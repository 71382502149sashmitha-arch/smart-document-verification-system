/**
 * Processing Pipeline — Orchestrates the entire document verification flow
 * Upload → Preprocess → OCR → Classify → Extract → Validate → Duplicate → Score → Store
 */
import path from 'path';
import ocrService from './ocrService.js';
import classifierService from './classifierService.js';
import validatorService from './validatorService.js';
import scoringService from './scoringService.js';
import imageQualityService from './imageQualityService.js';
import tamperingService from './tamperingService.js';
import duplicateService from './duplicateService.js';
import storageService from './storageService.js';
import notificationService from './notificationService.js';
import { parseDocument } from '../parsers/index.js';
import Document from '../models/Document.js';
import { query } from '../config/database.js';
import { isExpired } from '../utils/helpers.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class ProcessingPipeline {
  /**
   * Process a document through the entire verification pipeline
   * @param {number} documentId
   * @param {string} filePath - Absolute path to the file
   * @param {number} userId
   */
  async process(documentId, filePath, userId) {
    const startTime = Date.now();
    let currentStatus = 'queued';

    try {
      // STEP 1: Update status to preprocessing
      currentStatus = 'preprocessing';
      await Document.update(documentId, { processingStatus: 'preprocessing', processingStartedAt: new Date() });

      // STEP 2: Image quality check (for images only)
      let imageQuality = { score: 75, details: {}, issues: [] };
      const ext = path.extname(filePath).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'].includes(ext);

      if (isImage) {
        try {
          imageQuality = await imageQualityService.analyze(filePath);
          logger.info(`Image quality: ${imageQuality.score}/100`);
        } catch (err) {
          logger.warn('Image quality check failed, using defaults:', err.message);
        }
      }

      await Document.update(documentId, {
        imageQualityScore: imageQuality.score,
        imageQualityDetails: JSON.stringify(imageQuality.details),
      });

      // STEP 3: Tampering check (for images)
      let tamperingResult = { risk: 'none', indicators: [] };
      if (isImage) {
        try {
          tamperingResult = await tamperingService.analyze(filePath);
        } catch (err) {
          logger.warn('Tampering check failed:', err.message);
        }
      }

      await Document.update(documentId, {
        tamperingIndicators: JSON.stringify(tamperingResult.indicators),
        tamperingRisk: tamperingResult.risk,
      });

      // STEP 4: OCR
      currentStatus = 'ocr_processing';
      await Document.update(documentId, { processingStatus: 'ocr_processing' });

      let ocrResult;
      if (config.demoMode) {
        ocrResult = { text: 'DEMO MODE — No OCR performed', confidence: 0, words: [] };
      } else {
        ocrResult = await ocrService.recognize(filePath);
      }

      await Document.update(documentId, {
        ocrRawText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
      });

      // STEP 5: Classification
      currentStatus = 'classifying';
      await Document.update(documentId, { processingStatus: 'classifying' });

      const classification = classifierService.classify(ocrResult.text);
      logger.info(`Classification: ${classification.documentType} (${classification.confidence}%)`);

      await Document.update(documentId, {
        documentType: classification.documentType,
        classifiedAs: classification.documentType,
        classificationConfidence: classification.confidence,
      });

      // STEP 6: Field Extraction
      currentStatus = 'extracting';
      await Document.update(documentId, { processingStatus: 'extracting' });

      const extractedFields = parseDocument(classification.documentType, ocrResult.text);
      await Document.saveExtractedFields(documentId, extractedFields);

      // STEP 7: Validation
      currentStatus = 'validating';
      await Document.update(documentId, { processingStatus: 'validating' });

      const validationResults = await validatorService.validate(classification.documentType, extractedFields);

      // Special invoice check
      if (classification.documentType === 'invoice') {
        const calcCheck = validatorService.checkInvoiceCalculation(extractedFields);
        if (calcCheck) validationResults.results.push(calcCheck);
      }

      await Document.saveValidationResults(documentId, validationResults.results);

      // STEP 8: Duplicate Detection
      await Document.update(documentId, { processingStatus: 'scoring' });

      const duplicateResult = await duplicateService.check(classification.documentType, extractedFields, documentId);

      if (duplicateResult.isDuplicate) {
        await Document.update(documentId, {
          isDuplicate: true,
          duplicateOf: duplicateResult.duplicateDocId,
        });
      }

      // STEP 9: Expiry Detection
      const expiryField = extractedFields.find(f => f.fieldName === 'date_of_expiry');
      const documentIsExpired = expiryField ? isExpired(expiryField.fieldValue) : false;
      if (documentIsExpired) {
        await Document.update(documentId, { isExpired: true });
      }

      // STEP 10: Score Calculation
      const scoreResult = scoringService.calculate({
        extractedFields,
        validationResults,
        isDuplicate: duplicateResult.isDuplicate,
        isExpired: documentIsExpired,
        imageQualityScore: imageQuality.score,
        ocrConfidence: ocrResult.confidence,
        documentType: classification.documentType,
      });

      // STEP 11: Save Issues
      const issues = this.collectIssues(validationResults, duplicateResult, documentIsExpired, imageQuality, tamperingResult, ocrResult);
      await Document.saveIssues(documentId, issues);

      // STEP 12: Save Verification Result
      await Document.saveVerificationResult(documentId, {
        decision: scoreResult.decision,
        remarks: scoreResult.remarks,
        completenessScore: scoreResult.completenessScore,
        formatScore: scoreResult.formatScore,
        duplicateScore: scoreResult.duplicateScore,
        expiryScore: scoreResult.expiryScore,
        qualityScore: scoreResult.qualityScore,
        overallScore: scoreResult.overallScore,
        verificationMethod: 'automatic',
      });

      // STEP 13: Update document with final results
      await Document.update(documentId, {
        processingStatus: 'completed',
        verificationScore: scoreResult.overallScore,
        verificationStatus: scoreResult.decision,
        verificationDecisionAt: new Date(),
        processingCompletedAt: new Date(),
      });

      // STEP 14: Add verification history
      await Document.addVerificationHistory(documentId, 'auto_verification', null, 'pending', scoreResult.decision, scoreResult.remarks);

      // STEP 15: Notification
      await notificationService.notifyVerificationComplete(userId, documentId, scoreResult.decision);

      // Notify verifiers if manual review needed
      if (scoreResult.decision === 'needs_review') {
        const verifiers = await query("SELECT id FROM users WHERE role IN ('verifier', 'admin') AND is_active = TRUE");
        await notificationService.notifyNewReviewItem(verifiers.map(v => v.id), documentId);
      }

      const elapsed = Date.now() - startTime;
      logger.info(`Document ${documentId} processed in ${elapsed}ms. Score: ${scoreResult.overallScore}, Decision: ${scoreResult.decision}`);

      return scoreResult;

    } catch (error) {
      logger.error(`Pipeline error for document ${documentId}:`, error);
      await Document.update(documentId, {
        processingStatus: 'failed',
        processingError: error.message,
        verificationStatus: 'error',
      });
      await Document.addVerificationHistory(documentId, 'processing_error', null, currentStatus, 'error', error.message);
      throw error;
    }
  }

  /** Collect all issues from various checks */
  collectIssues(validationResults, duplicateResult, isExpiredDoc, imageQuality, tamperingResult, ocrResult) {
    const issues = [];

    // Validation issues
    for (const r of validationResults.results) {
      if (r.status === 'INVALID') {
        issues.push({
          issueType: 'invalid_format',
          severity: r.severity || 'medium',
          title: `Invalid ${r.fieldName.replace(/_/g, ' ')}`,
          description: r.message,
          category: 'invalid_format',
        });
      }
      if (r.status === 'MISSING') {
        issues.push({
          issueType: 'missing_field',
          severity: r.severity || 'medium',
          title: `Missing ${r.fieldName.replace(/_/g, ' ')}`,
          description: r.message,
          category: 'missing_field',
        });
      }
    }

    // Duplicate
    if (duplicateResult.isDuplicate) {
      issues.push({
        issueType: 'duplicate',
        severity: 'critical',
        title: 'Duplicate Document Identifier',
        description: duplicateResult.message,
        category: 'duplicate',
      });
    }

    // Expired
    if (isExpiredDoc) {
      issues.push({
        issueType: 'expired',
        severity: 'critical',
        title: 'Document Expired',
        description: 'The document expiry date has passed.',
        category: 'expired',
      });
    }

    // Image quality
    for (const iq of imageQuality.issues || []) {
      issues.push({
        issueType: iq.type,
        severity: iq.severity,
        title: `Image Quality: ${iq.type.replace(/_/g, ' ')}`,
        description: iq.message,
        category: 'image_quality',
      });
    }

    // Tampering
    for (const ti of tamperingResult.indicators || []) {
      issues.push({
        issueType: ti.type,
        severity: ti.severity.toLowerCase(),
        title: `Potential Tampering Indicator: ${ti.type.replace(/_/g, ' ')}`,
        description: ti.message,
        category: 'tampering',
      });
    }

    // OCR confidence
    if (ocrResult.confidence < 60) {
      issues.push({
        issueType: 'low_ocr_confidence',
        severity: 'medium',
        title: 'Low OCR Confidence',
        description: `OCR confidence is ${Math.round(ocrResult.confidence)}%. Extracted text may be inaccurate.`,
        category: 'ocr_confidence',
      });
    }

    return issues;
  }
}

export default new ProcessingPipeline();

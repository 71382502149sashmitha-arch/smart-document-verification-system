import Document from '../models/Document.js';
import auditService from '../services/auditService.js';
import notificationService from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export async function getVerificationQueue(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    let result;
    if (req.user.role === 'user') {
      result = await Document.findByUserId(req.user.id, { page: parseInt(page), limit: parseInt(limit) });
    } else {
      result = await Document.findPendingReview({ page: parseInt(page), limit: parseInt(limit) });
      if (!result.documents || result.documents.length === 0) {
        result = await Document.findAll({ page: parseInt(page), limit: parseInt(limit) });
      }
    }
    return successResponse(res, 'Verification queue retrieved.', result);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve queue.', 500, error.message);
  }
}

export async function getVerification(req, res) {
  try {
    const doc = await Document.findByIdWithUser(req.params.id);
    if (!doc) return errorResponse(res, 'Document not found.', 404);

    if (req.user.role === 'user' && doc.user_id !== req.user.id) {
      return errorResponse(res, 'Access denied.', 403);
    }

    const extractedFields = await Document.getExtractedFields(doc.id);
    const validationResults = await Document.getValidationResults(doc.id);
    const issues = await Document.getIssues(doc.id);
    const verificationResult = await Document.getVerificationResult(doc.id);
    const verificationHistory = await Document.getVerificationHistory(doc.id);

    return successResponse(res, 'Verification details retrieved.', {
      document: doc, extractedFields, validationResults, issues, verificationResult, verificationHistory,
    });
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve verification.', 500, error.message);
  }
}

export async function submitDecision(req, res) {
  try {
    const { decision, remarks } = req.body;
    const documentId = parseInt(req.params.id);
    const verifierId = req.user.id;

    if (!['verified', 'rejected', 'needs_review', 'flagged'].includes(decision)) {
      return errorResponse(res, 'Invalid decision. Must be: verified, rejected, needs_review, or flagged.', 400);
    }

    const doc = await Document.findById(documentId);
    if (!doc) return errorResponse(res, 'Document not found.', 404);

    const oldStatus = doc.verification_status;

    // Update verification result
    await Document.saveVerificationResult(documentId, {
      decision,
      remarks: remarks || null,
      completenessScore: 0,
      formatScore: 0,
      duplicateScore: 0,
      expiryScore: 0,
      qualityScore: 0,
      overallScore: doc.verification_score,
      verificationMethod: 'manual',
    });

    const { insert } = await import('../config/database.js');
    await insert(
      'UPDATE verification_results SET verified_by = ?, verification_method = "manual" WHERE document_id = ? ORDER BY created_at DESC LIMIT 1',
      [verifierId, documentId]
    );

    // Update document status
    await Document.update(documentId, {
      verificationStatus: decision,
      verificationDecisionAt: new Date(),
    });

    // Add verification history
    await Document.addVerificationHistory(documentId, 'manual_review', verifierId, oldStatus, decision, remarks);

    // Audit log
    await auditService.log(req, 'verification', 'document', documentId, {
      decision, remarks, previousStatus: oldStatus,
    });

    // Notify document owner
    await notificationService.notifyVerificationComplete(doc.user_id, documentId, decision);

    return successResponse(res, `Document ${decision.replace('_', ' ')}.`, { decision, documentId });
  } catch (error) {
    return errorResponse(res, 'Failed to submit decision.', 500, error.message);
  }
}

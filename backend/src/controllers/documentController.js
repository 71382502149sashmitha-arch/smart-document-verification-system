import path from 'path';
import Document from '../models/Document.js';
import User from '../models/User.js';
import processingPipeline from '../services/processingPipeline.js';
import storageService from '../services/storageService.js';
import reportService from '../services/reportService.js';
import auditService from '../services/auditService.js';
import { successResponse, errorResponse, formatFileSize } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded.', 400);
    }

    const userId = req.user.id;
    const file = req.file;
    const docType = req.body.documentType || 'unknown';

    // Move from temp to permanent storage
    const destPath = await storageService.moveFile(
      file.path, userId, docType, file.filename
    );

    // Create document record
    const documentId = await Document.create({
      userId,
      documentType: docType,
      originalName: file.originalname,
      storedName: file.filename,
      filePath: destPath,
      fileSize: file.size,
      mimeType: file.mimetype,
      pageCount: 1,
    });

    await auditService.log(req, 'document_upload', 'document', documentId, {
      type: docType,
      file: file.originalname,
      size: formatFileSize(file.size),
    });

    // Process asynchronously
    const absPath = storageService.getAbsolutePath(destPath);
    processingPipeline.process(documentId, absPath, userId).catch(err => {
      logger.error(`Background processing failed for doc ${documentId}:`, err.message);
    });

    return successResponse(res, 'Document uploaded. Processing started.', {
      documentId,
      fileName: file.originalname,
      fileSize: formatFileSize(file.size),
      status: 'queued',
    }, 201);
  } catch (error) {
    return errorResponse(res, 'Upload failed.', 500, error.message);
  }
}

export async function getMyDocuments(req, res) {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    const result = await Document.findByUserId(req.user.id, {
      page: parseInt(page), limit: parseInt(limit), type, status, search,
    });
    return successResponse(res, 'Documents retrieved.', result);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve documents.', 500, error.message);
  }
}

export async function getDocument(req, res) {
  try {
    const doc = await Document.findByIdWithUser(req.params.id);
    if (!doc) return errorResponse(res, 'Document not found.', 404);

    // Check access
    if (req.user.role === 'user' && doc.user_id !== req.user.id) {
      return errorResponse(res, 'Access denied.', 403);
    }

    const extractedFields = await Document.getExtractedFields(doc.id);
    const validationResults = await Document.getValidationResults(doc.id);
    const issues = await Document.getIssues(doc.id);
    const verificationResult = await Document.getVerificationResult(doc.id);
    const verificationHistory = await Document.getVerificationHistory(doc.id);

    return successResponse(res, 'Document details retrieved.', {
      document: doc,
      extractedFields,
      validationResults,
      issues,
      verificationResult,
      verificationHistory,
    });
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve document.', 500, error.message);
  }
}

export async function deleteDocument(req, res) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return errorResponse(res, 'Document not found.', 404);
    if (req.user.role === 'user' && doc.user_id !== req.user.id) {
      return errorResponse(res, 'Access denied.', 403);
    }

    await storageService.deleteFile(doc.file_path);
    await Document.delete(doc.id);
    await auditService.log(req, 'document_delete', 'document', doc.id);

    return successResponse(res, 'Document deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete document.', 500, error.message);
  }
}

export async function getDocumentReport(req, res) {
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
    const user = await User.findById(doc.user_id);

    const pdfDoc = reportService.generate({
      document: doc, extractedFields, validationResults, issues, verificationResult, verificationHistory, user,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=verification_report_${doc.id}.pdf`);
    pdfDoc.pipe(res);

    await auditService.log(req, 'report_download', 'document', doc.id, { format: 'pdf' });
  } catch (error) {
    return errorResponse(res, 'Failed to generate report.', 500, error.message);
  }
}

export async function getDocumentFile(req, res) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return errorResponse(res, 'Document not found.', 404);
    if (req.user.role === 'user' && doc.user_id !== req.user.id) {
      return errorResponse(res, 'Access denied.', 403);
    }

    const absPath = storageService.getAbsolutePath(doc.file_path);
    if (!storageService.exists(absPath)) {
      return errorResponse(res, 'File not found on server.', 404);
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.sendFile(absPath);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve file.', 500, error.message);
  }
}

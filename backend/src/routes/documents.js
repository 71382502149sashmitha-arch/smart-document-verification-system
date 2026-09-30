import { Router } from 'express';
import { uploadDocument, getMyDocuments, getDocument, deleteDocument, getDocumentReport, getDocumentFile } from '../controllers/documentController.js';
import { authenticate, checkDocumentAccess } from '../middleware/auth.js';
import upload, { handleUploadError } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/upload', authenticate, uploadLimiter, upload.single('document'), handleUploadError, uploadDocument);
router.get('/my', authenticate, getMyDocuments);
router.get('/', authenticate, getMyDocuments);
router.get('/:id', authenticate, checkDocumentAccess, getDocument);
router.get('/:id/report', authenticate, checkDocumentAccess, getDocumentReport);
router.get('/:id/file', authenticate, checkDocumentAccess, getDocumentFile);
router.delete('/:id', authenticate, checkDocumentAccess, deleteDocument);

export default router;

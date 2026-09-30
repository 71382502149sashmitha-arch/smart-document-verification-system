import { Router } from 'express';
import { getVerificationQueue, getVerification, submitDecision } from '../controllers/verificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/queue', authenticate, getVerificationQueue);
router.get('/:id', authenticate, getVerification);
router.post('/:id/decision', authenticate, authorize('verifier', 'admin'), submitDecision);

export default router;

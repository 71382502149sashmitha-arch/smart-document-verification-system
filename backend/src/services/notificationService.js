import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

class NotificationService {
  async notifyVerificationComplete(userId, documentId, decision) {
    const titles = {
      verified: 'Document Verified',
      rejected: 'Document Rejected',
      needs_review: 'Document Needs Review',
      flagged: 'Document Flagged',
    };
    const messages = {
      verified: 'Your document has been verified successfully.',
      rejected: 'Your document has been rejected. Please check the details.',
      needs_review: 'Your document requires manual review.',
      flagged: 'Your document has been flagged for further review.',
    };
    try {
      await Notification.create({
        userId,
        type: decision === 'verified' ? 'verification_complete' : decision,
        title: titles[decision] || 'Verification Update',
        message: messages[decision] || 'Your document verification status has been updated.',
        documentId,
      });
    } catch (error) {
      logger.error('Notification creation failed:', error.message);
    }
  }

  async notifyNewReviewItem(verifierIds, documentId) {
    try {
      for (const vid of verifierIds) {
        await Notification.create({
          userId: vid,
          type: 'needs_review',
          title: 'New Document for Review',
          message: 'A new document has been flagged for manual review.',
          documentId,
        });
      }
    } catch (error) {
      logger.error('Review notification failed:', error.message);
    }
  }
}

export default new NotificationService();

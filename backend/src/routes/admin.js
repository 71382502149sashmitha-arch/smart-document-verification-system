import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getUsers, updateUserStatus, updateUserRole,
  getAnalytics, getAuditLogs, getAllDocuments,
  getValidationRules, updateValidationRule, toggleValidationRule,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from '../controllers/adminController.js';

const router = Router();

// User management (admin only)
router.get('/users', authenticate, authorize('admin'), getUsers);
router.patch('/users/:id/status', authenticate, authorize('admin'), updateUserStatus);
router.patch('/users/:id/role', authenticate, authorize('admin'), updateUserRole);

// Analytics (admin only)
router.get('/analytics', authenticate, authorize('admin'), getAnalytics);

// Audit logs (admin only)
router.get('/audit-logs', authenticate, authorize('admin'), getAuditLogs);

// All documents (admin only)
router.get('/documents', authenticate, authorize('admin'), getAllDocuments);

// Validation rules (admin only)
router.get('/validation-rules', authenticate, authorize('admin'), getValidationRules);
router.patch('/validation-rules/:id', authenticate, authorize('admin'), updateValidationRule);
router.patch('/validation-rules/:id/toggle', authenticate, authorize('admin'), toggleValidationRule);

// Notifications (all authenticated users)
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);
router.patch('/notifications/read-all', authenticate, markAllNotificationsRead);

export default router;

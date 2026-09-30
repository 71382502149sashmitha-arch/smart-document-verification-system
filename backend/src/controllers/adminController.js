import User from '../models/User.js';
import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import ValidationRule from '../models/ValidationRule.js';
import auditService from '../services/auditService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export async function getUsers(req, res) {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const result = await User.findAll({ page: parseInt(page), limit: parseInt(limit), search, role });
    return successResponse(res, 'Users retrieved.', result);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve users.', 500, error.message);
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { isActive } = req.body;
    const userId = parseInt(req.params.id);

    if (userId === req.user.id) {
      return errorResponse(res, 'Cannot change your own status.', 400);
    }

    await User.updateStatus(userId, isActive);
    await auditService.log(req, isActive ? 'user_enable' : 'user_disable', 'user', userId);

    return successResponse(res, `User ${isActive ? 'enabled' : 'disabled'}.`);
  } catch (error) {
    return errorResponse(res, 'Failed to update user status.', 500, error.message);
  }
}

export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id);

    if (!['user', 'verifier', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role.', 400);
    }
    if (userId === req.user.id) {
      return errorResponse(res, 'Cannot change your own role.', 400);
    }

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 'User not found.', 404);

    const oldRole = user.role;
    await User.updateRole(userId, role);
    await auditService.log(req, 'user_role_change', 'user', userId, { from: oldRole, to: role });

    return successResponse(res, `User role updated to ${role}.`);
  } catch (error) {
    return errorResponse(res, 'Failed to update user role.', 500, error.message);
  }
}

export async function getAnalytics(req, res) {
  try {
    const userStats = await User.getStats();
    const docStats = await Document.getStats();
    const typeStats = await Document.getTypeStats();
    const docsOverTime = await Document.getDocumentsOverTime();
    const scoreDistribution = await Document.getScoreDistribution();
    const issuesByCategory = await Document.getIssuesByCategory();
    const recentDocs = await Document.getRecentDocuments(5);
    const recentAudit = await AuditLog.getRecent(10);

    return successResponse(res, 'Analytics retrieved.', {
      userStats,
      docStats,
      typeStats,
      docsOverTime,
      scoreDistribution,
      issuesByCategory,
      recentDocs,
      recentAudit,
    });
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve analytics.', 500, error.message);
  }
}

export async function getAuditLogs(req, res) {
  try {
    const { page = 1, limit = 20, action = '', search = '' } = req.query;
    const result = await AuditLog.findAll({ page: parseInt(page), limit: parseInt(limit), action, search });
    return successResponse(res, 'Audit logs retrieved.', result);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve audit logs.', 500, error.message);
  }
}

export async function getAllDocuments(req, res) {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    const result = await Document.findAll({
      page: parseInt(page), limit: parseInt(limit), type, status, search,
    });
    return successResponse(res, 'All documents retrieved.', result);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve documents.', 500, error.message);
  }
}

export async function getValidationRules(req, res) {
  try {
    const { documentType } = req.query;
    const rules = await ValidationRule.findAll({ documentType });
    return successResponse(res, 'Validation rules retrieved.', { rules });
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve validation rules.', 500, error.message);
  }
}

export async function updateValidationRule(req, res) {
  try {
    const ruleId = parseInt(req.params.id);
    const { isEnabled, pattern, errorMessage, isRequired, severity } = req.body;
    await ValidationRule.update(ruleId, { isEnabled, pattern, errorMessage, isRequired, severity });
    await auditService.log(req, 'rule_update', 'validation_rule', ruleId, req.body);
    return successResponse(res, 'Validation rule updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update rule.', 500, error.message);
  }
}

export async function toggleValidationRule(req, res) {
  try {
    const ruleId = parseInt(req.params.id);
    await ValidationRule.toggleEnabled(ruleId);
    return successResponse(res, 'Validation rule toggled.');
  } catch (error) {
    return errorResponse(res, 'Failed to toggle rule.', 500, error.message);
  }
}

export async function getNotifications(req, res) {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const result = await Notification.findByUserId(req.user.id, {
      page: parseInt(page), limit: parseInt(limit), unreadOnly: unreadOnly === 'true',
    });
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    return successResponse(res, 'Notifications retrieved.', { ...result, unreadCount });
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve notifications.', 500, error.message);
  }
}

export async function markNotificationRead(req, res) {
  try {
    await Notification.markAsRead(parseInt(req.params.id), req.user.id);
    return successResponse(res, 'Notification marked as read.');
  } catch (error) {
    return errorResponse(res, 'Failed to mark notification.', 500, error.message);
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    await Notification.markAllAsRead(req.user.id);
    return successResponse(res, 'All notifications marked as read.');
  } catch (error) {
    return errorResponse(res, 'Failed to mark notifications.', 500, error.message);
  }
}

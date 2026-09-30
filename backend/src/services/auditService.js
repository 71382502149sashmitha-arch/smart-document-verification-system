import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

class AuditService {
  async log(req, action, targetType, targetId, metadata = {}) {
    try {
      await AuditLog.create({
        userId: req.user?.id || null,
        action,
        targetType,
        targetId,
        metadata,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers?.['user-agent'],
      });
    } catch (error) {
      logger.error('Audit log failed:', error.message);
    }
  }
}

export default new AuditService();

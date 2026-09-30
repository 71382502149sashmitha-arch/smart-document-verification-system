import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { queryOne } from '../config/database.js';
import { errorResponse } from '../utils/helpers.js';

/** Verify JWT token and attach user to request */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again.', 401);
    }
    return errorResponse(res, 'Invalid token.', 401);
  }
}

/** Check if user has required role(s) */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. Insufficient permissions.', 403);
    }
    next();
  };
}

/** Check user is active */
export async function checkActive(req, res, next) {
  try {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }
    const user = await queryOne('SELECT is_active FROM users WHERE id = ?', [req.user.id]);
    if (!user || !user.is_active) {
      return errorResponse(res, 'Account is disabled. Contact administrator.', 403);
    }
    next();
  } catch (error) {
    return errorResponse(res, 'Authorization check failed.', 500);
  }
}

/** Check document ownership or admin/verifier access */
export async function checkDocumentAccess(req, res, next) {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'admin' || role === 'verifier') {
      return next();
    }

    const doc = await queryOne('SELECT user_id FROM documents WHERE id = ?', [documentId]);
    if (!doc) {
      return errorResponse(res, 'Document not found.', 404);
    }
    if (doc.user_id !== userId) {
      return errorResponse(res, 'Access denied. This document does not belong to you.', 403);
    }
    next();
  } catch (error) {
    return errorResponse(res, 'Document access check failed.', 500);
  }
}

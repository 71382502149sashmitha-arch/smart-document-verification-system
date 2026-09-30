/**
 * Utility helpers for masking, formatting, and validation
 */

/** Mask Aadhaar: XXXX XXXX 1234 */
export function maskAadhaar(aadhaar) {
  if (!aadhaar) return '';
  const clean = aadhaar.replace(/\s/g, '');
  if (clean.length < 4) return 'XXXX XXXX XXXX';
  return `XXXX XXXX ${clean.slice(-4)}`;
}

/** Mask account number: XXXXXX1234 */
export function maskAccountNumber(accNum) {
  if (!accNum) return '';
  const clean = accNum.replace(/\s/g, '');
  if (clean.length <= 4) return clean;
  return 'X'.repeat(clean.length - 4) + clean.slice(-4);
}

/** Mask PAN partially for display: ABCD***34F */
export function maskPAN(pan) {
  if (!pan || pan.length < 10) return pan || '';
  return pan.slice(0, 4) + '***' + pan.slice(7);
}

/** Parse date string in DD/MM/YYYY format to Date */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  // Try DD/MM/YYYY
  const dmyMatch = dateStr.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }
  // Try YYYY-MM-DD
  const ymdMatch = dateStr.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }
  return null;
}

/** Check if a date is expired */
export function isExpired(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return false;
  return date < new Date();
}

/** Format date for display */
export function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

/** Format file size */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/** Generate a secure random filename */
export function generateSecureFilename(originalName) {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
  const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  return `${safeName}.${ext}`;
}

/** Sanitize filename to prevent path traversal */
export function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '.');
}

/** Standard API response */
export function apiResponse(res, statusCode, success, message, data = null) {
  const response = { success, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
}

/** Success response */
export function successResponse(res, message, data = null, statusCode = 200) {
  return apiResponse(res, statusCode, true, message, data);
}

/** Error response */
export function errorResponse(res, message, statusCode = 500, error = null) {
  const response = { success: false, message };
  if (error && process.env.NODE_ENV !== 'production') response.error = error;
  return res.status(statusCode).json(response);
}

/** Calculate processing time in human-readable format */
export function processingTime(startTime) {
  const ms = Date.now() - startTime;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

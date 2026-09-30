import { query, queryOne, insert } from '../config/database.js';

const Document = {
  async create(data) {
    const result = await insert(
      `INSERT INTO documents (user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count, processing_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued')`,
      [data.userId, data.documentType || 'unknown', data.originalName, data.storedName, data.filePath, data.fileSize, data.mimeType, data.pageCount || 1]
    );
    return result.insertId;
  },

  async findById(id) {
    return queryOne('SELECT * FROM documents WHERE id = ?', [id]);
  },

  async findByIdWithUser(id) {
    return queryOne(`
      SELECT d.*, u.full_name as user_name, u.email as user_email
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `, [id]);
  },

  async findByUserId(userId, { page = 1, limit = 20, type = '', status = '', search = '' } = {}) {
    let sql = 'SELECT * FROM documents WHERE user_id = ?';
    const params = [userId];

    if (type) { sql += ' AND document_type = ?'; params.push(type); }
    if (status) { sql += ' AND verification_status = ?'; params.push(status); }
    if (search) {
      sql += ' AND (original_name LIKE ? OR document_type LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await query(countSql, params);
    const total = countResult?.total || 0;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const documents = await query(sql, params);
    return { documents, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findAll({ page = 1, limit = 20, type = '', status = '', search = '', userId = null } = {}) {
    let sql = `SELECT d.*, u.full_name as user_name, u.email as user_email
               FROM documents d JOIN users u ON d.user_id = u.id WHERE 1=1`;
    const params = [];

    if (userId) { sql += ' AND d.user_id = ?'; params.push(userId); }
    if (type) { sql += ' AND d.document_type = ?'; params.push(type); }
    if (status) { sql += ' AND d.verification_status = ?'; params.push(status); }
    if (search) {
      sql += ' AND (d.original_name LIKE ? OR d.document_type LIKE ? OR u.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countSql = sql.replace(/SELECT d\.\*, u\.full_name as user_name, u\.email as user_email/, 'SELECT COUNT(*) as total');
    const [countResult] = await query(countSql, params);
    const total = countResult?.total || 0;

    sql += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const documents = await query(sql, params);
    return { documents, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findPendingReview({ page = 1, limit = 20 } = {}) {
    const sql = `SELECT d.*, u.full_name as user_name, u.email as user_email
                 FROM documents d JOIN users u ON d.user_id = u.id
                 WHERE d.verification_status IN ('pending', 'needs_review')
                 AND d.processing_status = 'completed'
                 ORDER BY d.created_at ASC LIMIT ? OFFSET ?`;
    const documents = await query(sql, [limit, (page - 1) * limit]);

    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM documents WHERE verification_status IN ('pending', 'needs_review') AND processing_status = 'completed'`
    );
    const total = countResult?.total || 0;

    return { documents, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async update(id, data) {
    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      fields.push(`${snakeKey} = ?`);
      params.push(value);
    }
    params.push(id);
    await insert(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async delete(id) {
    await insert('DELETE FROM documents WHERE id = ?', [id]);
  },

  async getExtractedFields(documentId) {
    return query('SELECT * FROM extracted_fields WHERE document_id = ? ORDER BY id', [documentId]);
  },

  async getValidationResults(documentId) {
    return query('SELECT * FROM validation_results WHERE document_id = ? ORDER BY id', [documentId]);
  },

  async getIssues(documentId) {
    return query('SELECT * FROM document_issues WHERE document_id = ? ORDER BY severity DESC, id', [documentId]);
  },

  async getVerificationResult(documentId) {
    return queryOne('SELECT * FROM verification_results WHERE document_id = ? ORDER BY created_at DESC LIMIT 1', [documentId]);
  },

  async getVerificationHistory(documentId) {
    return query(`
      SELECT vh.*, u.full_name as actor_name
      FROM verification_history vh
      LEFT JOIN users u ON vh.actor_id = u.id
      WHERE vh.document_id = ?
      ORDER BY vh.created_at ASC
    `, [documentId]);
  },

  async saveExtractedFields(documentId, fields) {
    if (!fields || fields.length === 0) return;
    await insert('DELETE FROM extracted_fields WHERE document_id = ?', [documentId]);
    for (const field of fields) {
      await insert(
        'INSERT INTO extracted_fields (document_id, field_name, field_value, field_type, confidence, is_sensitive, display_value) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [documentId, field.fieldName, field.fieldValue, field.fieldType || 'text', field.confidence || 0, field.isSensitive || false, field.displayValue || field.fieldValue]
      );
    }
  },

  async saveValidationResults(documentId, results) {
    if (!results || results.length === 0) return;
    await insert('DELETE FROM validation_results WHERE document_id = ?', [documentId]);
    for (const r of results) {
      await insert(
        'INSERT INTO validation_results (document_id, field_name, extracted_value, expected_format, status, message, severity) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [documentId, r.fieldName, r.extractedValue, r.expectedFormat || null, r.status, r.message, r.severity || 'info']
      );
    }
  },

  async saveIssues(documentId, issues) {
    if (!issues || issues.length === 0) return;
    await insert('DELETE FROM document_issues WHERE document_id = ?', [documentId]);
    for (const issue of issues) {
      await insert(
        'INSERT INTO document_issues (document_id, issue_type, severity, title, description, category) VALUES (?, ?, ?, ?, ?, ?)',
        [documentId, issue.issueType, issue.severity, issue.title, issue.description, issue.category || 'other']
      );
    }
  },

  async saveVerificationResult(documentId, result) {
    await insert('DELETE FROM verification_results WHERE document_id = ?', [documentId]);
    await insert(
      `INSERT INTO verification_results (document_id, decision, remarks, completeness_score, format_score, duplicate_score, expiry_score, quality_score, overall_score, verification_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [documentId, result.decision, result.remarks, result.completenessScore, result.formatScore, result.duplicateScore, result.expiryScore, result.qualityScore, result.overallScore, result.verificationMethod || 'automatic']
    );
  },

  async addVerificationHistory(documentId, action, actorId, fromStatus, toStatus, remarks) {
    await insert(
      'INSERT INTO verification_history (document_id, action, actor_id, from_status, to_status, remarks) VALUES (?, ?, ?, ?, ?, ?)',
      [documentId, action, actorId, fromStatus, toStatus, remarks]
    );
  },

  async getStats() {
    const stats = await queryOne(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN verification_status = 'needs_review' THEN 1 ELSE 0 END) as needs_review,
        SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN processing_status = 'completed' THEN 1 ELSE 0 END) as processed,
        SUM(CASE WHEN processing_status = 'failed' THEN 1 ELSE 0 END) as failed,
        AVG(verification_score) as avg_score,
        SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicates,
        SUM(CASE WHEN is_expired = 1 THEN 1 ELSE 0 END) as expired
      FROM documents
    `);
    return stats;
  },

  async getTypeStats() {
    return query(`
      SELECT document_type, COUNT(*) as count,
        AVG(verification_score) as avg_score,
        SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as verified
      FROM documents GROUP BY document_type ORDER BY count DESC
    `);
  },

  async getRecentDocuments(limit = 10) {
    return query(`
      SELECT d.*, u.full_name as user_name
      FROM documents d JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC LIMIT ?
    `, [limit]);
  },

  async getDocumentsOverTime() {
    return query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM documents
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
  },

  async getScoreDistribution() {
    return query(`
      SELECT
        CASE
          WHEN verification_score >= 85 THEN '85-100'
          WHEN verification_score >= 70 THEN '70-84'
          WHEN verification_score >= 50 THEN '50-69'
          WHEN verification_score >= 25 THEN '25-49'
          ELSE '0-24'
        END as range_label,
        COUNT(*) as count
      FROM documents
      WHERE processing_status = 'completed'
      GROUP BY range_label
      ORDER BY range_label DESC
    `);
  },

  async getIssuesByCategory() {
    return query(`
      SELECT category, severity, COUNT(*) as count
      FROM document_issues
      GROUP BY category, severity
      ORDER BY count DESC
    `);
  },

  async checkDuplicate(fieldName, fieldValue, excludeDocId = null) {
    let sql = `SELECT d.id, d.document_type, d.user_id, d.verification_status
               FROM extracted_fields ef
               JOIN documents d ON ef.document_id = d.id
               WHERE ef.field_name = ? AND ef.field_value = ?`;
    const params = [fieldName, fieldValue];
    if (excludeDocId) {
      sql += ' AND d.id != ?';
      params.push(excludeDocId);
    }
    return query(sql, params);
  },
};

export default Document;

import { query, queryOne, insert } from '../config/database.js';

const ValidationRule = {
  async findByDocumentType(documentType) {
    return query(
      'SELECT * FROM validation_rules WHERE document_type = ? AND is_enabled = TRUE ORDER BY display_order',
      [documentType]
    );
  },

  async findAll({ documentType = '' } = {}) {
    let sql = 'SELECT * FROM validation_rules WHERE 1=1';
    const params = [];
    if (documentType) { sql += ' AND document_type = ?'; params.push(documentType); }
    sql += ' ORDER BY document_type, display_order';
    return query(sql, params);
  },

  async update(id, { isEnabled, pattern, errorMessage, isRequired, severity }) {
    const fields = [];
    const params = [];
    if (isEnabled !== undefined) { fields.push('is_enabled = ?'); params.push(isEnabled); }
    if (pattern !== undefined) { fields.push('pattern = ?'); params.push(pattern); }
    if (errorMessage !== undefined) { fields.push('error_message = ?'); params.push(errorMessage); }
    if (isRequired !== undefined) { fields.push('is_required = ?'); params.push(isRequired); }
    if (severity !== undefined) { fields.push('severity = ?'); params.push(severity); }
    if (fields.length === 0) return;
    params.push(id);
    await insert(`UPDATE validation_rules SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async toggleEnabled(id) {
    await insert('UPDATE validation_rules SET is_enabled = NOT is_enabled WHERE id = ?', [id]);
  },
};

export default ValidationRule;

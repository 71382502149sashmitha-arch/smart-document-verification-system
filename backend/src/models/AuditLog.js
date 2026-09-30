import { query, queryOne, insert } from '../config/database.js';

const AuditLog = {
  async create({ userId, action, targetType, targetId, metadata, ipAddress, userAgent }) {
    await insert(
      'INSERT INTO audit_logs (user_id, action, target_type, target_id, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, action, targetType || null, targetId || null, metadata ? JSON.stringify(metadata) : null, ipAddress || null, userAgent || null]
    );
  },

  async findAll({ page = 1, limit = 20, action = '', userId = null, search = '' } = {}) {
    let sql = `SELECT al.*, u.full_name as user_name, u.email as user_email
               FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1`;
    const params = [];

    if (action) { sql += ' AND al.action = ?'; params.push(action); }
    if (userId) { sql += ' AND al.user_id = ?'; params.push(userId); }
    if (search) {
      sql += ' AND (al.action LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countSql = sql.replace(/SELECT al\.\*, u\.full_name as user_name, u\.email as user_email/, 'SELECT COUNT(*) as total');
    const [countResult] = await query(countSql, params);
    const total = countResult?.total || 0;

    sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const logs = await query(sql, params);
    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getRecent(limit = 10) {
    return query(`
      SELECT al.*, u.full_name as user_name
      FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC LIMIT ?
    `, [limit]);
  },
};

export default AuditLog;

import { query, queryOne, insert } from '../config/database.js';

const User = {
  async findByEmail(email) {
    return queryOne('SELECT * FROM users WHERE email = ?', [email]);
  },

  async findById(id) {
    return queryOne('SELECT id, email, full_name, phone, role, is_active, last_login, created_at FROM users WHERE id = ?', [id]);
  },

  async findByIdWithPassword(id) {
    return queryOne('SELECT * FROM users WHERE id = ?', [id]);
  },

  async create({ email, passwordHash, fullName, phone }) {
    const result = await insert(
      'INSERT INTO users (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)',
      [email, passwordHash, fullName, phone || null]
    );
    return result.insertId;
  },

  async updateLastLogin(id) {
    await insert('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  },

  async updateProfile(id, { fullName, phone }) {
    const updates = [];
    const params = [];

    if (fullName) {
      updates.push('full_name = ?');
      params.push(fullName);
    }
    if (phone !== undefined && phone !== null) {
      updates.push('phone = ?');
      params.push(phone);
    }

    if (updates.length === 0) return;

    params.push(id);
    await insert(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  },

  async updatePassword(id, passwordHash) {
    await insert('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  },

  async updateRole(id, role) {
    await insert('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  },

  async updateStatus(id, isActive) {
    await insert('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
  },

  async findAll({ page = 1, limit = 20, search = '', role = '' }) {
    let sql = 'SELECT id, email, full_name, phone, role, is_active, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    const countSql = sql.replace('SELECT id, email, full_name, phone, role, is_active, last_login, created_at', 'SELECT COUNT(*) as total');
    const [countResult] = await query(countSql, params);
    const total = countResult?.total || 0;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const users = await query(sql, params);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getStats() {
    const stats = await queryOne(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users,
        SUM(CASE WHEN role = 'verifier' THEN 1 ELSE 0 END) as verifiers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM users
    `);
    return stats;
  },
};

export default User;

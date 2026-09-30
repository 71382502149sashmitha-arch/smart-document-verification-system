import { query, queryOne, insert } from '../config/database.js';

const Notification = {
  async create({ userId, type, title, message, documentId }) {
    await insert(
      'INSERT INTO notifications (user_id, type, title, message, document_id) VALUES (?, ?, ?, ?, ?)',
      [userId, type || 'system', title, message, documentId || null]
    );
  },

  async findByUserId(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];
    if (unreadOnly) { sql += ' AND is_read = FALSE'; }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await query(countSql, params);
    const total = countResult?.total || 0;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const notifications = await query(sql, params);
    return { notifications, total, page, limit };
  },

  async getUnreadCount(userId) {
    const result = await queryOne('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]);
    return result?.count || 0;
  },

  async markAsRead(id, userId) {
    await insert('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
  },

  async markAllAsRead(userId) {
    await insert('UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE', [userId]);
  },
};

export default Notification;

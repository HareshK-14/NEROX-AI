const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/responseHelper');

// ─── Send Notification (Officer/Admin) ───────────────────────────────────────
const sendNotification = async (req, res) => {
  try {
    const { type, title, message, targetDepartments, targetYears, priority } = req.body;
    if (!title || !message) return error(res, 'Title and message are required.', 400);

    const id = uuidv4();
    await pool.query(
      `INSERT INTO notifications (id, sent_by, type, title, message, target_departments, target_years, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, type || 'general', title, message, JSON.stringify(targetDepartments || []), JSON.stringify(targetYears || []), priority || 'medium']
    );

    // Log
    try {
      await pool.query(`INSERT INTO activity_logs (id, user_id, role, action, metadata) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), req.user.id, req.user.role, 'NOTIFICATION_SENT', JSON.stringify({ title, type })]);
    } catch(_) {}

    return success(res, { id }, 'Notification sent.', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to send notification.', 500);
  }
};

// ─── Get All Notifications (Officer view — all sent) ─────────────────────────
const getAllNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `SELECT n.*, u.email as sent_by_email,
       COALESCE(po.name, 'Admin') as sent_by_name
       FROM notifications n
       LEFT JOIN users u ON u.id = n.sent_by
       LEFT JOIN placement_officers po ON po.user_id = n.sent_by
       ORDER BY n.created_at DESC LIMIT 100`
    );
    return success(res, notifications);
  } catch (err) {
    return error(res, 'Failed to fetch notifications.', 500);
  }
};

// ─── Get Notifications for Student ───────────────────────────────────────────
const getStudentNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get student profile for dept/year filtering
    const [profiles] = await pool.query('SELECT department, year FROM student_profiles WHERE user_id = ?', [userId]);
    const profile = profiles[0] || {};

    const [notifications] = await pool.query(
      `SELECT n.*,
         (SELECT COUNT(*) FROM notification_reads nr WHERE nr.notification_id = n.id AND nr.user_id = ?) as is_read,
         COALESCE(po.name, 'Administrator') as sent_by_name
       FROM notifications n
       LEFT JOIN placement_officers po ON po.user_id = n.sent_by
       WHERE (
         JSON_LENGTH(n.target_departments) = 0
         OR JSON_CONTAINS(n.target_departments, JSON_QUOTE(?))
       )
       ORDER BY n.created_at DESC LIMIT 50`,
      [userId, profile.department || '']
    );

    return success(res, notifications);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch notifications.', 500);
  }
};

// ─── Mark Notification Read ───────────────────────────────────────────────────
const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `INSERT IGNORE INTO notification_reads (id, notification_id, user_id) VALUES (?, ?, ?)`,
      [uuidv4(), id, req.user.id]
    );
    return success(res, null, 'Marked as read.');
  } catch (err) {
    return error(res, 'Failed to mark as read.', 500);
  }
};

// ─── Delete Notification ──────────────────────────────────────────────────────
const deleteNotification = async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    return success(res, null, 'Notification deleted.');
  } catch (err) {
    return error(res, 'Failed to delete.', 500);
  }
};

module.exports = { sendNotification, getAllNotifications, getStudentNotifications, markRead, deleteNotification };

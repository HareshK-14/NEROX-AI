const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/responseHelper');

// ─── System Stats ─────────────────────────────────────────────────────────────
const getSystemStats = async (req, res) => {
  try {
    const [[{ students }]] = await pool.query(`SELECT COUNT(*) as students FROM users WHERE role='student'`);
    const [[{ officers }]] = await pool.query(`SELECT COUNT(*) as officers FROM users WHERE role='placement_officer'`);
    const [[{ admins }]] = await pool.query(`SELECT COUNT(*) as admins FROM users WHERE role='admin'`);
    const [[{ companies }]] = await pool.query(`SELECT COUNT(*) as companies FROM companies`);
    const [[{ drives }]] = await pool.query(`SELECT COUNT(*) as drives FROM placement_drives`);
    const [[{ notifications }]] = await pool.query(`SELECT COUNT(*) as notifications FROM notifications`);
    const [[{ logs }]] = await pool.query(`SELECT COUNT(*) as logs FROM activity_logs`);
    const [recentLogs] = await pool.query(`SELECT al.*, u.email FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id ORDER BY al.created_at DESC LIMIT 20`);
    const [settings] = await pool.query(`SELECT setting_key, setting_value FROM admin_settings`);

    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.setting_key] = s.setting_value; });

    return success(res, { students, officers, admins, companies, drives, notifications, logs, recentLogs, settings: settingsMap });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch system stats.', 500);
  }
};

// ─── Get All Users ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 25 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];
    if (role) { where += ' AND u.role = ?'; params.push(role); }
    if (search) { where += ' AND u.email LIKE ?'; params.push(`%${search}%`); }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users u ${where}`, params);
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.role, u.created_at,
         COALESCE(sp.name, po.name, 'Admin') as name,
         COALESCE(sp.department, po.department, '') as department
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id AND u.role='student'
       LEFT JOIN placement_officers po ON po.user_id = u.id AND u.role='placement_officer'
       ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return success(res, { users, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return error(res, 'Failed to fetch users.', 500);
  }
};

// ─── Update User Role ─────────────────────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['student','placement_officer','admin'].includes(role)) return error(res, 'Invalid role.', 400);
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    // Log
    try {
      await pool.query(`INSERT INTO activity_logs (id, user_id, role, action, metadata) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), req.user.id, req.user.role, 'ROLE_UPDATED', JSON.stringify({ targetUser: id, newRole: role })]);
    } catch(_) {}

    return success(res, null, `Role updated to ${role}.`);
  } catch (err) {
    return error(res, 'Failed to update role.', 500);
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return error(res, 'Cannot delete your own account.', 400);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return success(res, null, 'User deleted.');
  } catch (err) {
    return error(res, 'Failed to delete user.', 500);
  }
};

// ─── Get Activity Logs ────────────────────────────────────────────────────────
const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];
    if (role) { where += ' AND al.role = ?'; params.push(role); }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM activity_logs al ${where}`, params);
    const [logs] = await pool.query(
      `SELECT al.*, u.email FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id ${where} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return success(res, { logs, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    return error(res, 'Failed to fetch logs.', 500);
  }
};

// ─── Update Settings ──────────────────────────────────────────────────────────
const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO admin_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=?, updated_by=?`,
        [key, String(value), req.user.id, String(value), req.user.id]
      );
    }
    return success(res, null, 'Settings updated.');
  } catch (err) {
    return error(res, 'Failed to update settings.', 500);
  }
};

module.exports = { getSystemStats, getAllUsers, updateUserRole, deleteUser, getLogs, updateSettings };

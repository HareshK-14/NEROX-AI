const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/responseHelper');

const getProfile = async (req, res) => {
  try {
    const [profiles] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (profiles.length === 0) {
      return error(res, 'Student profile not found.', 404);
    }
    const profile = profiles[0];

    const [skills] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [req.user.id]);

    return success(res, {
      profile,
      skills
    }, 'Student profile details resolved.');
  } catch (err) {
    console.error('getProfile error:', err);
    return error(res, 'Internal server error resolving profile details.', 500);
  }
};

const updateProfile = async (req, res) => {
  const { name, department, year, rollNumber, phone, bio, linkedinUrl, githubUrl } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE student_profiles 
       SET name = ?, department = ?, year = ?, roll_number = ?, phone = ?, bio = ?, linkedin_url = ?, github_url = ?
       WHERE user_id = ?`,
      [name, department, year, rollNumber, phone, bio, linkedinUrl, githubUrl, req.user.id]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Failed to update student profile.', 400);
    }

    return success(res, null, 'Student profile information updated successfully.');
  } catch (err) {
    console.error('updateProfile error:', err);
    return error(res, 'Internal server error updating profile information.', 500);
  }
};

const addSkill = async (req, res) => {
  const { skillName, proficiency, category } = req.body;

  if (!skillName) {
    return error(res, 'Skill name is required.', 400);
  }

  try {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO skills (id, user_id, skill_name, proficiency, category) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, skillName, proficiency || 'beginner', category || 'Technical']
    );

    return success(res, { id, skillName, proficiency, category }, 'Skill added successfully.', 201);
  } catch (err) {
    console.error('addSkill error:', err);
    return error(res, 'Internal server error adding skill.', 500);
  }
};

const deleteSkill = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM skills WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.affectedRows === 0) {
      return error(res, 'Skill not found or unauthorized to delete.', 404);
    }

    return success(res, null, 'Skill deleted successfully.');
  } catch (err) {
    console.error('deleteSkill error:', err);
    return error(res, 'Internal server error deleting skill.', 500);
  }
};

const updateAvatar = async (req, res) => {
  if (!req.file) {
    return error(res, 'No avatar image file uploaded.', 400);
  }

  try {
    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE student_profiles SET avatar_url = ? WHERE user_id = ?', [avatarUrl, req.user.id]);

    return success(res, { avatarUrl }, 'Profile avatar image updated successfully.');
  } catch (err) {
    console.error('updateAvatar error:', err);
    return error(res, 'Internal server error uploading avatar.', 500);
  }
};

const getNotifications = async (req, res) => {
  try {
    // Return student-specific + general college notifications
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );

    return success(res, notifications, 'Notifications retrieved.');
  } catch (err) {
    console.error('getNotifications error:', err);
    return error(res, 'Internal server error fetching notifications.', 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addSkill,
  deleteSkill,
  updateAvatar,
  getNotifications
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');

// ─────────────────────────────────────────────────────────────────────────────
//  REGISTER
//  Supports roles: student (default), placement_officer, admin
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { email, password, name, department, year, rollNumber, phone, role, employeeId, designation } = req.body;
  if (!email || !password || !name) return error(res, 'Email, password, and name are required.', 400);

  const userRole = ['student','placement_officer','admin'].includes(role) ? role : 'student';

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return error(res, 'A user with this email already exists.', 400);

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('START TRANSACTION');

    // Create base user
    await pool.query(
      'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, userRole]
    );

    if (userRole === 'student') {
      const profileId = uuidv4();
      await pool.query(
        `INSERT INTO student_profiles (id, user_id, name, department, year, roll_number, phone, placement_points, streak_days, last_login)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, CURDATE())`,
        [profileId, userId, name, department || '', year || 1, rollNumber || '', phone || '']
      );

      const analyticsId = uuidv4();
      await pool.query(
        `INSERT INTO placement_analytics (id, user_id, coding_score, sql_score, communication_score, resume_score, aptitude_score, projects_score, overall_score, placement_readiness)
         VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0)`,
        [analyticsId, userId]
      );

      const missionId = uuidv4();
      const initialMissions = [
        { id: 'm1', type: 'coding', title: 'Array Challenge', description: 'Write a function to reverse an array in Java', difficulty: 'easy', points: 10, time_minutes: 10 },
        { id: 'm2', type: 'sql',    title: 'SQL Joins',       description: 'Retrieve student names using Inner Join',         difficulty: 'easy', points: 10, time_minutes: 5 }
      ];
      await pool.query(
        `INSERT INTO daily_missions (id, user_id, mission_date, missions, completed_missions, points_earned) VALUES (?, ?, CURDATE(), ?, '[]', 0)`,
        [missionId, userId, JSON.stringify(initialMissions)]
      );
    } else if (userRole === 'placement_officer') {
      const officerId = uuidv4();
      await pool.query(
        `INSERT INTO placement_officers (id, user_id, name, employee_id, department, designation, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [officerId, userId, name, employeeId || '', department || '', designation || 'Placement Officer', phone || '']
      );
    }
    // admin: no extra profile table needed

    await pool.query('COMMIT');

    const token = jwt.sign(
      { id: userId, email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return success(res, { token, user: { id: userId, email, name, role: userRole } }, 'Registration successful.', 201);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Registration error:', err);
    return error(res, 'Internal server error during registration.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN  —  handles student, placement_officer, admin
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return error(res, 'Email and password are required.', 400);

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return error(res, 'Invalid credentials.', 401);

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return error(res, 'Invalid credentials.', 401);

    let profileData = {};

    if (user.role === 'student') {
      const [profiles] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [user.id]);
      const profile = profiles[0] || {};

      // Streak logic
      let streak = profile.streak_days || 0;
      const lastLogin = profile.last_login;
      const today = new Date().toISOString().split('T')[0];
      if (lastLogin) {
        const diffDays = Math.ceil(Math.abs(new Date(today) - new Date(lastLogin)) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak += 1;
        else if (diffDays > 1) streak = 1;
      } else { streak = 1; }

      await pool.query(
        'UPDATE student_profiles SET streak_days = ?, last_login = CURDATE() WHERE user_id = ?',
        [streak, user.id]
      );

      profileData = {
        name: profile.name,
        department: profile.department,
        year: profile.year,
        rollNumber: profile.roll_number,
        streakDays: streak,
        avatarUrl: profile.avatar_url,
        placementPoints: profile.placement_points
      };

    } else if (user.role === 'placement_officer') {
      const [officers] = await pool.query('SELECT * FROM placement_officers WHERE user_id = ?', [user.id]);
      const officer = officers[0] || {};
      profileData = {
        name: officer.name,
        department: officer.department,
        designation: officer.designation,
        employeeId: officer.employee_id,
        avatarUrl: officer.avatar_url
      };

    } else if (user.role === 'admin') {
      profileData = { name: 'System Administrator' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log activity
    try {
      await pool.query(
        `INSERT INTO activity_logs (id, user_id, role, action, metadata) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), user.id, user.role, 'USER_LOGIN', JSON.stringify({ email: user.email })]
      );
    } catch (_) {}

    return success(res, {
      token,
      user: { id: user.id, email: user.email, role: user.role, ...profileData }
    }, 'Login successful.');

  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Internal server error during login.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET ME  —  role-aware profile fetch
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return error(res, 'User not found.', 404);

    const user = users[0];
    let profileData = {};

    if (user.role === 'student') {
      const [profiles] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [user.id]);
      const p = profiles[0] || {};
      profileData = {
        name: p.name, department: p.department, year: p.year,
        rollNumber: p.roll_number, phone: p.phone,
        avatarUrl: p.avatar_url, bio: p.bio,
        linkedinUrl: p.linkedin_url, githubUrl: p.github_url,
        placementPoints: p.placement_points, streakDays: p.streak_days
      };
    } else if (user.role === 'placement_officer') {
      const [officers] = await pool.query('SELECT * FROM placement_officers WHERE user_id = ?', [user.id]);
      const o = officers[0] || {};
      profileData = {
        name: o.name, department: o.department,
        designation: o.designation, employeeId: o.employee_id,
        phone: o.phone, avatarUrl: o.avatar_url
      };
    } else if (user.role === 'admin') {
      profileData = { name: 'System Administrator' };
    }

    return success(res, { id: user.id, email: user.email, role: user.role, ...profileData }, 'Profile retrieved.');
  } catch (err) {
    console.error('getMe error:', err);
    return error(res, 'Internal server error.', 500);
  }
};

module.exports = { register, login, getMe };

const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/responseHelper');
const { callAgent } = require('../services/geminiService');

// ─────────────────────────────────────────────────────────────────────────────
//  Dashboard Stats — aggregate KPIs for officer home
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query(`SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'`);
    const [[{ readyStudents }]] = await pool.query(`SELECT COUNT(*) as readyStudents FROM placement_analytics WHERE placement_readiness >= 70`);
    const [[{ notReady }]] = await pool.query(`SELECT COUNT(*) as notReady FROM placement_analytics WHERE placement_readiness < 70`);
    const [[avgs]] = await pool.query(`SELECT ROUND(AVG(coding_score),1) as avgCoding, ROUND(AVG(sql_score),1) as avgSQL, ROUND(AVG(communication_score),1) as avgComm, ROUND(AVG(overall_score),1) as avgOverall, ROUND(AVG(placement_readiness),1) as avgReadiness FROM placement_analytics`);

    // Dept-wise analytics
    const [deptStats] = await pool.query(`
      SELECT sp.department,
        COUNT(*) as count,
        ROUND(AVG(pa.coding_score),1) as avgCoding,
        ROUND(AVG(pa.placement_readiness),1) as avgReadiness
      FROM student_profiles sp
      LEFT JOIN placement_analytics pa ON pa.user_id = sp.user_id
      GROUP BY sp.department ORDER BY avgReadiness DESC`);

    // Year-wise analytics
    const [yearStats] = await pool.query(`
      SELECT sp.year,
        COUNT(*) as count,
        ROUND(AVG(pa.overall_score),1) as avgScore,
        ROUND(AVG(pa.placement_readiness),1) as avgReadiness
      FROM student_profiles sp
      LEFT JOIN placement_analytics pa ON pa.user_id = sp.user_id
      GROUP BY sp.year ORDER BY sp.year`);

    // Top 5 performers
    const [topStudents] = await pool.query(`
      SELECT sp.name, sp.department, sp.year, sp.roll_number, pa.overall_score, pa.placement_readiness
      FROM student_profiles sp
      JOIN placement_analytics pa ON pa.user_id = sp.user_id
      ORDER BY pa.overall_score DESC LIMIT 5`);

    // Students needing attention (readiness < 40)
    const [atRisk] = await pool.query(`
      SELECT sp.name, sp.department, sp.year, sp.roll_number, pa.overall_score, pa.placement_readiness
      FROM student_profiles sp
      JOIN placement_analytics pa ON pa.user_id = sp.user_id
      WHERE pa.placement_readiness < 40
      ORDER BY pa.placement_readiness ASC LIMIT 5`);

    // Upcoming drives
    const [drives] = await pool.query(`
      SELECT pd.title, pd.drive_date, pd.status, c.name as company
      FROM placement_drives pd LEFT JOIN companies c ON c.id = pd.company_id
      WHERE pd.status IN ('upcoming','ongoing')
      ORDER BY pd.drive_date ASC LIMIT 5`);

    return success(res, {
      totalStudents, readyStudents, notReady,
      avgCoding: avgs.avgCoding || 0,
      avgSQL: avgs.avgSQL || 0,
      avgCommunication: avgs.avgComm || 0,
      avgOverall: avgs.avgOverall || 0,
      avgReadiness: avgs.avgReadiness || 0,
      deptStats, yearStats, topStudents, atRisk, drives
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return error(res, 'Failed to fetch dashboard stats.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Get All Students — paginated, searchable, filterable
// ─────────────────────────────────────────────────────────────────────────────
const getAllStudents = async (req, res) => {
  try {
    const { search = '', department = '', year = '', minReadiness = 0, maxReadiness = 100, page = 1, limit = 25, sortBy = 'overall_score', sortOrder = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const allowedSort = ['overall_score','placement_readiness','coding_score','sql_score','communication_score','name'];
    const sortCol = allowedSort.includes(sortBy) ? sortBy : 'overall_score';
    const sortDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (sp.name LIKE ? OR sp.roll_number LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (department) { whereClause += ' AND sp.department = ?'; params.push(department); }
    if (year) { whereClause += ' AND sp.year = ?'; params.push(parseInt(year)); }

    whereClause += ' AND pa.placement_readiness BETWEEN ? AND ?';
    params.push(parseFloat(minReadiness), parseFloat(maxReadiness));

    const countSql = `SELECT COUNT(*) as total FROM student_profiles sp JOIN users u ON u.id = sp.user_id JOIN placement_analytics pa ON pa.user_id = sp.user_id ${whereClause}`;
    const [[{ total }]] = await pool.query(countSql, params);

    const sortTarget = allowedSort.slice(0,5).includes(sortCol) ? `pa.${sortCol}` : `sp.${sortCol}`;
    const dataSql = `
      SELECT sp.user_id as id, sp.name, sp.roll_number, sp.department, sp.year, sp.phone,
             u.email, pa.coding_score, pa.sql_score, pa.communication_score,
             pa.overall_score, pa.placement_readiness, pa.aptitude_score, pa.resume_score,
             sp.avatar_url
      FROM student_profiles sp
      JOIN users u ON u.id = sp.user_id
      JOIN placement_analytics pa ON pa.user_id = sp.user_id
      ${whereClause}
      ORDER BY ${sortTarget} ${sortDir}
      LIMIT ? OFFSET ?`;
    const [students] = await pool.query(dataSql, [...params, parseInt(limit), offset]);

    return success(res, {
      students,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('getAllStudents error:', err);
    return error(res, 'Failed to fetch students.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Get Student By ID — full profile for officer
// ─────────────────────────────────────────────────────────────────────────────
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [profiles] = await pool.query(`SELECT sp.*, u.email FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.user_id = ?`, [id]);
    if (!profiles.length) return error(res, 'Student not found.', 404);
    const profile = profiles[0];

    const [analytics] = await pool.query(`SELECT * FROM placement_analytics WHERE user_id = ?`, [id]);
    const [skills] = await pool.query(`SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC`, [id]);
    const [quizResults] = await pool.query(`SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`, [id]);
    const [codingTests] = await pool.query(`SELECT * FROM coding_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`, [id]);
    const [missionHistory] = await pool.query(`SELECT * FROM daily_missions WHERE user_id = ? ORDER BY mission_date DESC LIMIT 30`, [id]);
    const [resumes] = await pool.query(`SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`, [id]);

    return success(res, {
      profile: { ...profile, email: profile.email },
      analytics: analytics[0] || {},
      skills,
      quizResults,
      codingTests,
      missionHistory,
      resume: resumes[0] || null
    });
  } catch (err) {
    console.error('getStudentById error:', err);
    return error(res, 'Failed to fetch student profile.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Placement Analytics (deep charts data)
// ─────────────────────────────────────────────────────────────────────────────
const getPlacementAnalytics = async (req, res) => {
  try {
    // Distribution buckets
    const [readinessDistribution] = await pool.query(`
      SELECT
        SUM(CASE WHEN placement_readiness >= 80 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN placement_readiness BETWEEN 60 AND 79 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN placement_readiness BETWEEN 40 AND 59 THEN 1 ELSE 0 END) as average,
        SUM(CASE WHEN placement_readiness < 40 THEN 1 ELSE 0 END) as needsWork
      FROM placement_analytics`);

    // Score distribution per skill
    const [skillScores] = await pool.query(`
      SELECT
        ROUND(AVG(coding_score),1) as coding,
        ROUND(AVG(sql_score),1) as sql_avg,
        ROUND(AVG(communication_score),1) as communication,
        ROUND(AVG(aptitude_score),1) as aptitude,
        ROUND(AVG(resume_score),1) as resume,
        ROUND(AVG(projects_score),1) as projects
      FROM placement_analytics`);

    // Dept × avg readiness
    const [deptReadiness] = await pool.query(`
      SELECT sp.department as dept, ROUND(AVG(pa.placement_readiness),1) as avg_readiness, COUNT(*) as count
      FROM student_profiles sp JOIN placement_analytics pa ON pa.user_id = sp.user_id
      GROUP BY sp.department`);

    // Year × avg score
    const [yearScores] = await pool.query(`
      SELECT sp.year, ROUND(AVG(pa.overall_score),1) as avg_score, COUNT(*) as count
      FROM student_profiles sp JOIN placement_analytics pa ON pa.user_id = sp.user_id
      GROUP BY sp.year ORDER BY sp.year`);

    // Top 20 students
    const [top20] = await pool.query(`
      SELECT sp.name, sp.department, sp.year, sp.roll_number, pa.overall_score, pa.placement_readiness,
             pa.coding_score, pa.sql_score, pa.communication_score
      FROM student_profiles sp JOIN placement_analytics pa ON pa.user_id = sp.user_id
      ORDER BY pa.overall_score DESC LIMIT 20`);

    // At-risk students
    const [atRisk] = await pool.query(`
      SELECT sp.name, sp.department, sp.year, sp.roll_number, pa.placement_readiness, pa.overall_score,
             pa.coding_score, pa.sql_score
      FROM student_profiles sp JOIN placement_analytics pa ON pa.user_id = sp.user_id
      WHERE pa.placement_readiness < 40
      ORDER BY pa.placement_readiness ASC`);

    return success(res, { readinessDistribution: readinessDistribution[0], skillScores: skillScores[0], deptReadiness, yearScores, top20, atRisk });
  } catch (err) {
    console.error('getPlacementAnalytics error:', err);
    return error(res, 'Failed to fetch analytics.', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  AI Analytics Agent — officer asks free-form question
// ─────────────────────────────────────────────────────────────────────────────
const askAnalyticsAgent = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return error(res, 'Query is required.', 400);

    // Pull a data snapshot for the agent
    const [[totals]] = await pool.query(`SELECT COUNT(*) as total FROM placement_analytics`);
    const [[avgs]] = await pool.query(`SELECT ROUND(AVG(coding_score),1) as coding, ROUND(AVG(sql_score),1) as sql_avg, ROUND(AVG(communication_score),1) as comm, ROUND(AVG(placement_readiness),1) as readiness FROM placement_analytics`);
    const [deptData] = await pool.query(`SELECT sp.department, ROUND(AVG(pa.overall_score),1) as avg_score, COUNT(*) as count FROM student_profiles sp JOIN placement_analytics pa ON pa.user_id = sp.user_id GROUP BY sp.department`);
    const [lowSQL] = await pool.query(`SELECT sp.name, sp.department, pa.sql_score FROM student_profiles sp JOIN placement_analytics pa ON pa.user_id = sp.user_id WHERE pa.sql_score < 40 ORDER BY pa.sql_score ASC LIMIT 10`);
    const [top10] = await pool.query(`SELECT sp.name, sp.department, pa.overall_score FROM student_profiles sp JOIN placement_analytics pa ON pa.user_id = sp.user_id ORDER BY pa.overall_score DESC LIMIT 10`);

    const context = `PLATFORM DATA SNAPSHOT:\nTotal Students: ${totals.total}\nAvg Coding: ${avgs.coding} | Avg SQL: ${avgs.sql_avg} | Avg Communication: ${avgs.comm} | Avg Readiness: ${avgs.readiness}\nDept-wise: ${JSON.stringify(deptData)}\nStudents with Low SQL (<40): ${JSON.stringify(lowSQL)}\nTop 10 Students: ${JSON.stringify(top10)}`;

    const result = await callAgent('PLACEMENT_ANALYTICS_AGENT', query, context);

    return success(res, { query, result });
  } catch (err) {
    console.error('askAnalyticsAgent error:', err);
    return error(res, `AI agent failed: ${err.message}`, 500);
  }
};

module.exports = { getDashboardStats, getAllStudents, getStudentById, getPlacementAnalytics, askAnalyticsAgent };

const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/responseHelper');
const { callAgent } = require('../services/geminiService');

// ─── Get All Companies ────────────────────────────────────────────────────────
const getCompanies = async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT * FROM companies WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
    sql += ' ORDER BY created_at DESC';
    const [companies] = await pool.query(sql, params);
    return success(res, companies);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch companies.', 500);
  }
};

// ─── Add Company ──────────────────────────────────────────────────────────────
const addCompany = async (req, res) => {
  try {
    const { name, sector, minCgpa, minCodingScore, requiredSkills, packageLpa, driveDate, status, interviewPattern, codingPattern, eligibilityCriteria } = req.body;
    if (!name) return error(res, 'Company name is required.', 400);
    const id = uuidv4();
    await pool.query(
      `INSERT INTO companies (id, name, sector, min_cgpa, min_coding_score, required_skills, package_lpa, drive_date, status, interview_pattern, coding_pattern, eligibility_criteria, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, sector || '', minCgpa || 6.0, minCodingScore || 50, JSON.stringify(requiredSkills || []), packageLpa || null, driveDate || null, status || 'upcoming', interviewPattern || '', codingPattern || '', eligibilityCriteria || '', req.user.id]
    );
    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
    return success(res, rows[0], 'Company added.', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to add company.', 500);
  }
};

// ─── Update Company ───────────────────────────────────────────────────────────
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sector, minCgpa, minCodingScore, requiredSkills, packageLpa, driveDate, status, interviewPattern, codingPattern, eligibilityCriteria } = req.body;
    await pool.query(
      `UPDATE companies SET name=?, sector=?, min_cgpa=?, min_coding_score=?, required_skills=?, package_lpa=?, drive_date=?, status=?, interview_pattern=?, coding_pattern=?, eligibility_criteria=? WHERE id=?`,
      [name, sector, minCgpa, minCodingScore, JSON.stringify(requiredSkills || []), packageLpa, driveDate, status, interviewPattern, codingPattern, eligibilityCriteria, id]
    );
    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
    return success(res, rows[0], 'Company updated.');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update company.', 500);
  }
};

// ─── Delete Company ───────────────────────────────────────────────────────────
const deleteCompany = async (req, res) => {
  try {
    await pool.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
    return success(res, null, 'Company deleted.');
  } catch (err) {
    return error(res, 'Failed to delete company.', 500);
  }
};

// ─── Get Placement Drives ─────────────────────────────────────────────────────
const getDrives = async (req, res) => {
  try {
    const [drives] = await pool.query(
      `SELECT pd.*, c.name as company_name, c.sector, c.package_lpa FROM placement_drives pd LEFT JOIN companies c ON c.id = pd.company_id ORDER BY pd.drive_date ASC`
    );
    return success(res, drives);
  } catch (err) {
    return error(res, 'Failed to fetch drives.', 500);
  }
};

// ─── Schedule Drive ───────────────────────────────────────────────────────────
const scheduleDrive = async (req, res) => {
  try {
    const { companyId, title, description, driveDate, venue, eligibility } = req.body;
    if (!title) return error(res, 'Drive title is required.', 400);
    const id = uuidv4();
    await pool.query(
      `INSERT INTO placement_drives (id, company_id, title, description, drive_date, venue, eligibility, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, companyId || null, title, description || '', driveDate || null, venue || '', JSON.stringify(eligibility || {}), req.user.id]
    );
    return success(res, { id }, 'Drive scheduled.', 201);
  } catch (err) {
    return error(res, 'Failed to schedule drive.', 500);
  }
};

// ─── Generate AI Prep Plan ────────────────────────────────────────────────────
const generateAIPrepPlan = async (req, res) => {
  try {
    const { companyName, targetStudents, timelineWeeks } = req.body;
    if (!companyName) return error(res, 'Company name is required.', 400);
    const result = await callAgent('COMPANY_EXPLORER', `Generate a detailed placement preparation plan for ${companyName}. Timeline: ${timelineWeeks || 8} weeks. Target: ${targetStudents || 'all eligible students'}.`);
    return success(res, result);
  } catch (err) {
    return error(res, `AI prep plan failed: ${err.message}`, 500);
  }
};

module.exports = { getCompanies, addCompany, updateCompany, deleteCompany, getDrives, scheduleDrive, generateAIPrepPlan };

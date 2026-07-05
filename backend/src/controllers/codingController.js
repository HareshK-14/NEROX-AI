const { callAgent } = require('../services/geminiService');
const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

const mentor = async (req, res) => {
  const { code, language, operation, question } = req.body;

  if (!code && !question) {
    return error(res, 'Code snippet or query is required.', 400);
  }

  const prompt = JSON.stringify({
    code: code || '',
    language: language || 'any',
    operation: operation || 'explain',
    question: question || ''
  });

  try {
    const aiResponse = await callAgent('CODING_MENTOR', prompt);
    return success(res, aiResponse, 'Coding mentor finished analysis.');
  } catch (err) {
    console.error('Coding Mentor error:', err);
    return error(res, 'Coding Mentor Agent failed to analyze.', 500);
  }
};

const debug = async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return error(res, 'Please provide the code snippet to debug.', 400);
  }

  const prompt = JSON.stringify({
    code,
    language: language || 'Java'
  });

  try {
    const aiResponse = await callAgent('DEBUG', prompt);
    return success(res, aiResponse, 'Debug complete.');
  } catch (err) {
    console.error('Debug agent error:', err);
    return error(res, 'Debug Agent failed to analyze code.', 500);
  }
};

const sqlAssistant = async (req, res) => {
  const { query, task } = req.body;

  if (!query && !task) {
    return error(res, 'Query or task description is required.', 400);
  }

  // We can use CODING_MENTOR or a dedicated query prompt for SQL
  const prompt = JSON.stringify({
    code: query || '',
    language: 'SQL',
    operation: 'sql',
    question: task || 'Explain database normalization and JOIN practice.'
  });

  try {
    const aiResponse = await callAgent('CODING_MENTOR', prompt);
    return success(res, aiResponse, 'SQL assistant completed task.');
  } catch (err) {
    console.error('SQL Assistant error:', err);
    return error(res, 'SQL Assistant Agent failed to respond.', 500);
  }
};

const generateTest = async (req, res) => {
  const { language, difficulty } = req.body;

  const prompt = JSON.stringify({
    language: language || 'Java',
    difficulty: difficulty || 'easy',
    timestamp: new Date().toISOString()
  });

  try {
    const aiResponse = await callAgent('CODING_TEST', prompt);
    return success(res, aiResponse, 'Coding test generated.');
  } catch (err) {
    console.error('Coding test generator error:', err);
    return error(res, 'Coding Test Agent failed to generate test.', 500);
  }
};

const submitTest = async (req, res) => {
  const { testType, language, difficulty, questions, answers, score, totalMarks } = req.body;

  try {
    const id = uuidv4();
    const percentage = ((score / totalMarks) * 100).toFixed(2);
    const feedback = `Coding performance: ${percentage}%. Adaptive evaluation suggests practice in weak areas.`;

    await pool.query(
      `INSERT INTO coding_tests (id, user_id, test_type, language, difficulty, questions, answers, score, total_marks, percentage, feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [id, req.user.id, testType || 'Coding Challenge', language || 'Java', difficulty || 'easy', JSON.stringify(questions), JSON.stringify(answers), score, totalMarks, percentage, feedback]
    );

    // Update student placement points
    await pool.query(
      'UPDATE student_profiles SET placement_points = placement_points + ? WHERE user_id = ?',
      [score * 10, req.user.id]
    );

    const auditId = uuidv4();
    await pool.query(
      'INSERT INTO placement_points (id, user_id, points, activity) VALUES (?, ?, ?, ?)',
      [auditId, req.user.id, score * 10, `Completed coding test in ${language} (${difficulty})`]
    );

    // Update Coding placement analytics score
    await pool.query(
      `UPDATE placement_analytics 
       SET coding_score = GREATEST(coding_score, ?), overall_score = (coding_score + sql_score + communication_score + resume_score) / 4
       WHERE user_id = ?`,
      [percentage, req.user.id]
    );

    return success(res, { id, percentage, feedback }, 'Coding test result stored successfully.');
  } catch (err) {
    console.error('submitTest error:', err);
    return error(res, 'Internal server error saving coding test score.', 500);
  }
};

module.exports = {
  mentor,
  debug,
  sqlAssistant,
  generateTest,
  submitTest
};

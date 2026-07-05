const { callAgent } = require('../services/geminiService');
const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

// ─── CAREER ADVISOR ──────────────────────────────────────────────────────────
const advise = async (req, res) => {
  const { interests, year, department } = req.body;

  try {
    const [profile] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const [skills] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [req.user.id]);

    const context = JSON.stringify({
      interests: interests || '',
      year: year || profile[0]?.year || 3,
      department: department || profile[0]?.department || 'CSE',
      skills: skills.map(s => s.skill_name)
    });

    const aiResponse = await callAgent('CAREER_ADVISOR', 'Give me personalized career advice', context);
    return success(res, aiResponse, 'Career advice generated.');
  } catch (err) {
    console.error('Career advisor error:', err);
    return error(res, 'Career Advisor Agent failed.', 500);
  }
};

// ─── SKILL GAP ANALYZER ──────────────────────────────────────────────────────
const skillGap = async (req, res) => {
  const { targetRole } = req.body;
  if (!targetRole) return error(res, 'Target role is required.', 400);

  try {
    const [skills] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [req.user.id]);
    const [analytics] = await pool.query('SELECT * FROM placement_analytics WHERE user_id = ?', [req.user.id]);

    const context = JSON.stringify({
      targetRole,
      currentSkills: skills.map(s => ({ name: s.skill_name, level: s.proficiency })),
      scores: analytics[0] || {}
    });

    const aiResponse = await callAgent('SKILL_GAP', `Analyze skill gap for role: ${targetRole}`, context);

    // Persist gap analysis
    const id = uuidv4();
    await pool.query(
      'INSERT INTO skill_gap (id, user_id, target_role, gap_data, estimated_weeks) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, targetRole, JSON.stringify(aiResponse), aiResponse?.estimated_weeks_to_ready || 0]
    );

    return success(res, { ...aiResponse, savedId: id }, 'Skill gap analysis complete.');
  } catch (err) {
    console.error('Skill gap error:', err);
    return error(res, 'Skill Gap Agent failed.', 500);
  }
};

// ─── GET SAVED ROADMAPS ──────────────────────────────────────────────────────
const getSavedRoadmaps = async (req, res) => {
  try {
    const [roadmaps] = await pool.query(
      'SELECT id, goal, current_level, created_at FROM career_roadmaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [req.user.id]
    );
    return success(res, roadmaps, 'Career roadmaps retrieved.');
  } catch (err) {
    console.error('Get roadmaps error:', err);
    return error(res, 'Failed to fetch roadmaps.', 500);
  }
};

module.exports = { advise, skillGap, getSavedRoadmaps };

const { callAgent } = require('../services/geminiService');
const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

// ─── AGENT 1: COMPANY READINESS ──────────────────────────────────────────────
const readiness = async (req, res) => {
  const { company } = req.body;
  if (!company) return error(res, 'Company name is required.', 400);

  try {
    const [profiles] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const [skills] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [req.user.id]);
    const [analytics] = await pool.query('SELECT * FROM placement_analytics WHERE user_id = ?', [req.user.id]);

    const context = JSON.stringify({
      company,
      student: profiles[0] || {},
      skills: skills || [],
      current_scores: analytics[0] || {}
    });

    const aiResponse = await callAgent('READINESS', `Evaluate readiness for ${company}`, context);

    // Persist readiness score to analytics
    if (aiResponse?.overall_score) {
      await pool.query(
        'UPDATE placement_analytics SET placement_readiness = ?, overall_score = ? WHERE user_id = ?',
        [aiResponse.readiness_percentage || aiResponse.overall_score, aiResponse.overall_score, req.user.id]
      );
    }

    // Award XP points for using readiness check
    await pool.query(
      'INSERT INTO placement_points (id, user_id, points, activity) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.user.id, 10, 'Company Readiness Check']
    );

    return success(res, aiResponse, 'Company readiness analysis complete.');
  } catch (err) {
    console.error('Company readiness error:', err);
    return error(res, 'Company Readiness Agent failed.', 500);
  }
};

// ─── AGENT 2: COMPANY EXPLORER ────────────────────────────────────────────────
const exploreCompany = async (req, res) => {
  const { company } = req.body;
  if (!company) return error(res, 'Company name is required.', 400);

  try {
    // Check cache first (cache valid for 7 days)
    const [cached] = await pool.query(
      'SELECT profile_data, last_updated FROM company_details WHERE company_name = ? AND last_updated > DATE_SUB(NOW(), INTERVAL 7 DAY)',
      [company]
    );
    if (cached.length > 0) {
      const data = typeof cached[0].profile_data === 'string'
        ? JSON.parse(cached[0].profile_data)
        : cached[0].profile_data;
      return success(res, data, 'Company profile loaded from cache.');
    }

    const aiResponse = await callAgent('COMPANY_EXPLORER', company);

    // Cache the result
    await pool.query(
      'INSERT INTO company_details (id, company_name, profile_data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE profile_data = ?, last_updated = NOW()',
      [uuidv4(), company, JSON.stringify(aiResponse), JSON.stringify(aiResponse)]
    );

    return success(res, aiResponse, 'Company profile generated.');
  } catch (err) {
    console.error('Company explorer error:', err);
    return error(res, 'Company Explorer Agent failed.', 500);
  }
};

// ─── AGENT 3: TEST GENERATOR ──────────────────────────────────────────────────
const generateTest = async (req, res) => {
  const { company, testType } = req.body;
  if (!company) return error(res, 'Company is required.', 400);

  const prompt = JSON.stringify({ company, testType: testType || 'full' });

  try {
    const aiResponse = await callAgent('TEST_GENERATOR', prompt);
    return success(res, aiResponse, 'Company test generated.');
  } catch (err) {
    console.error('Test generator error:', err);
    return error(res, 'Test Generator Agent failed.', 500);
  }
};

// ─── SAVE TEST RESULT ─────────────────────────────────────────────────────────
const saveTestResult = async (req, res) => {
  const { company, testType, score, totalMarks, percentage, weakAreas, suggestions, answers } = req.body;
  if (!company) return error(res, 'Company is required.', 400);

  try {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO aptitude_tests (id, user_id, company, test_type, score, total_marks, percentage, weak_areas, suggestions, answers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, company, testType || 'full', score || 0, totalMarks || 0, percentage || 0,
        JSON.stringify(weakAreas || []), JSON.stringify(suggestions || []), JSON.stringify(answers || {})]
    );

    // Update analytics aptitude score
    if (percentage) {
      await pool.query(
        `UPDATE placement_analytics
         SET aptitude_score = GREATEST(aptitude_score, ?), tests_taken = tests_taken + 1
         WHERE user_id = ?`,
        [Math.round(percentage), req.user.id]
      );
    }

    // Award XP
    const pts = Math.round((percentage || 0) / 2);
    await pool.query(
      'INSERT INTO placement_points (id, user_id, points, activity) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.user.id, pts, `${company} Mock Test`]
    );

    return success(res, { id, percentage }, 'Test result saved.');
  } catch (err) {
    console.error('Save test result error:', err);
    return error(res, 'Failed to save test result.', 500);
  }
};

// ─── AGENT 4: CODING EVALUATOR ────────────────────────────────────────────────
const evaluateCode = async (req, res) => {
  const { code, language, context: codeContext } = req.body;
  if (!code) return error(res, 'Code snippet is required.', 400);

  const prompt = JSON.stringify({ code, language: language || 'Java', context: codeContext || '' });

  try {
    const aiResponse = await callAgent('CODING_EVALUATOR', prompt);

    // Save evaluation
    const id = uuidv4();
    await pool.query(
      `INSERT INTO coding_evaluations
       (id, user_id, language, original_code, quality_score, correctness_score, efficiency_score,
        style_score, time_complexity, space_complexity, optimized_code, issues_found, practice_suggestions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, language || 'Java', code,
        aiResponse?.scores?.quality || 0,
        aiResponse?.scores?.correctness || 0,
        aiResponse?.scores?.efficiency || 0,
        aiResponse?.scores?.style || 0,
        aiResponse?.time_complexity || 'N/A',
        aiResponse?.space_complexity || 'N/A',
        aiResponse?.optimized_code || '',
        JSON.stringify(aiResponse?.issues || []),
        JSON.stringify(aiResponse?.practice_questions || [])
      ]
    );

    // Update coding score in analytics
    if (aiResponse?.overall_score) {
      await pool.query(
        'UPDATE placement_analytics SET coding_score = GREATEST(coding_score, ?) WHERE user_id = ?',
        [aiResponse.overall_score, req.user.id]
      );
    }

    return success(res, aiResponse, 'Code evaluation complete.');
  } catch (err) {
    console.error('Code evaluation error:', err);
    return error(res, 'Coding Evaluator Agent failed.', 500);
  }
};

// ─── AGENT 5: GD COACH — Generate Topic ──────────────────────────────────────
const generateGDTopic = async (req, res) => {
  const { topicType } = req.body;
  const prompt = JSON.stringify({ mode: 'topic', topicType: topicType || 'mixed' });

  try {
    const aiResponse = await callAgent('GD_COACH', prompt);
    return success(res, { ...aiResponse, mode: 'topic' }, 'GD topic generated.');
  } catch (err) {
    console.error('GD topic error:', err);
    return error(res, 'GD Coach Agent failed to generate topic.', 500);
  }
};

// ─── AGENT 5: GD COACH — Evaluate Response ───────────────────────────────────
const submitGD = async (req, res) => {
  const { topic, response } = req.body;
  if (!topic || !response) return error(res, 'Topic and student response are required.', 400);

  const prompt = JSON.stringify({ mode: 'evaluation', topic, studentResponse: response });

  try {
    const aiResponse = await callAgent('GD_COACH', prompt);
    const eval_ = aiResponse?.evaluation || {};

    // Persist GD result
    const id = uuidv4();
    await pool.query(
      `INSERT INTO gd_results
       (id, user_id, topic, student_response, communication_score, grammar_score, confidence_score,
        relevance_score, vocabulary_score, critical_thinking_score, overall_score, feedback, model_answer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, topic, response,
        eval_.communication_score || 0,
        eval_.grammar_score || 0,
        eval_.confidence_score || 0,
        eval_.relevance_score || 0,
        eval_.vocabulary_score || 0,
        eval_.critical_thinking_score || 0,
        eval_.overall_score || 0,
        eval_.feedback || '',
        aiResponse?.model_answer || ''
      ]
    );

    // Update analytics
    if (eval_.overall_score) {
      await pool.query(
        `UPDATE placement_analytics
         SET communication_score = GREATEST(communication_score, ?), gd_score = GREATEST(gd_score, ?), gd_sessions = gd_sessions + 1
         WHERE user_id = ?`,
        [eval_.overall_score, eval_.overall_score, req.user.id]
      );
    }

    return success(res, { ...aiResponse, id }, 'GD evaluation complete.');
  } catch (err) {
    console.error('GD evaluation error:', err);
    return error(res, 'GD Coach Agent failed to evaluate.', 500);
  }
};

// ─── AGENT 6: PLACEMENT ANALYTICS ────────────────────────────────────────────
const analytics = async (req, res) => {
  try {
    const [analyticsData] = await pool.query('SELECT * FROM placement_analytics WHERE user_id = ?', [req.user.id]);
    const [testHistory] = await pool.query(
      'SELECT company, score, total_marks, percentage, taken_at FROM aptitude_tests WHERE user_id = ? ORDER BY taken_at DESC LIMIT 10',
      [req.user.id]
    );
    const [gdHistory] = await pool.query(
      'SELECT overall_score, evaluated_at FROM gd_results WHERE user_id = ? ORDER BY evaluated_at DESC LIMIT 5',
      [req.user.id]
    );
    const [codeHistory] = await pool.query(
      'SELECT overall_score, quality_score, evaluated_at FROM coding_evaluations WHERE user_id = ? ORDER BY evaluated_at DESC LIMIT 5',
      [req.user.id]
    );

    const context = JSON.stringify({
      scores: analyticsData[0] || {},
      test_history: testHistory,
      gd_history: gdHistory
    });

    const aiResponse = await callAgent('PLACEMENT_ANALYTICS', 'Analyze my comprehensive placement profile', context);

    return success(res, {
      databaseScores: analyticsData[0] || {},
      testHistory,
      gdHistory,
      aiAnalysis: aiResponse
    }, 'Placement analytics resolved.');
  } catch (err) {
    console.error('Analytics error:', err);
    return error(res, 'Placement Analytics Agent failed.', 500);
  }
};

// ─── AGENT 7: STRATEGY PLANNER ───────────────────────────────────────────────
const strategy = async (req, res) => {
  const { goal, currentLevel } = req.body;
  if (!goal) return error(res, 'Target goal is required.', 400);

  const prompt = JSON.stringify({ goal, currentLevel: currentLevel || 'beginner' });

  try {
    const aiResponse = await callAgent('STRATEGY', prompt);

    // Save roadmap
    const id = uuidv4();
    await pool.query(
      'INSERT INTO career_roadmaps (id, user_id, goal, current_level, plan_data) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, goal, currentLevel || 'beginner', JSON.stringify(aiResponse)]
    );

    return success(res, { ...aiResponse, savedId: id }, 'Strategy roadmap generated.');
  } catch (err) {
    console.error('Strategy error:', err);
    return error(res, 'Strategy Agent failed.', 500);
  }
};

// ─── AGENT 8: DAILY MISSIONS ──────────────────────────────────────────────────
const getDailyMissions = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [existing] = await pool.query(
      'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?',
      [req.user.id, today]
    );

    if (existing.length > 0) {
      const missionsData = typeof existing[0].missions === 'string'
        ? JSON.parse(existing[0].missions)
        : existing[0].missions;
      const completedData = typeof existing[0].completed_missions === 'string'
        ? JSON.parse(existing[0].completed_missions)
        : existing[0].completed_missions;
      return success(res, {
        missions: missionsData,
        completedMissions: completedData || [],
        pointsEarned: existing[0].points_earned,
        missionDate: today
      }, 'Daily missions loaded.');
    }

    const [analytics] = await pool.query('SELECT * FROM placement_analytics WHERE user_id = ?', [req.user.id]);
    const context = JSON.stringify({ scores: analytics[0] || {}, date: today });
    const aiResponse = await callAgent('DAILY_MISSION', 'Generate personalized daily missions', context);

    const id = uuidv4();
    await pool.query(
      'INSERT INTO daily_missions (id, user_id, mission_date, missions, completed_missions) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, today, JSON.stringify(aiResponse.missions || []), JSON.stringify([])]
    );

    return success(res, {
      missions: aiResponse.missions || [],
      completedMissions: [],
      greeting: aiResponse.greeting,
      motivation: aiResponse.motivation,
      daily_tip: aiResponse.daily_tip,
      total_points_today: aiResponse.total_points_today,
      missionDate: today
    }, 'Daily missions generated.');
  } catch (err) {
    console.error('Daily missions error:', err);
    return error(res, 'Daily Mission Agent failed.', 500);
  }
};

const completeMission = async (req, res) => {
  const { missionId, points } = req.body;
  if (!missionId) return error(res, 'Mission ID is required.', 400);

  try {
    const today = new Date().toISOString().split('T')[0];
    const [existing] = await pool.query(
      'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?',
      [req.user.id, today]
    );

    if (existing.length === 0) return error(res, 'No missions found for today.', 404);

    const completed = typeof existing[0].completed_missions === 'string'
      ? JSON.parse(existing[0].completed_missions)
      : (existing[0].completed_missions || []);

    if (!completed.includes(missionId)) {
      completed.push(missionId);
      const missionPoints = points || 50;
      await pool.query(
        'UPDATE daily_missions SET completed_missions = ?, points_earned = points_earned + ? WHERE user_id = ? AND mission_date = ?',
        [JSON.stringify(completed), missionPoints, req.user.id, today]
      );
      await pool.query(
        'UPDATE student_profiles SET placement_points = placement_points + ? WHERE user_id = ?',
        [missionPoints, req.user.id]
      );
      await pool.query(
        'INSERT INTO placement_points (id, user_id, points, activity) VALUES (?, ?, ?, ?)',
        [uuidv4(), req.user.id, missionPoints, `Daily Mission: ${missionId}`]
      );
    }

    return success(res, { completedMissions: completed }, 'Mission marked complete.');
  } catch (err) {
    console.error('Complete mission error:', err);
    return error(res, 'Failed to update mission.', 500);
  }
};

// ─── UPDATE ANALYTICS SCORES ─────────────────────────────────────────────────
const updateAnalytics = async (req, res) => {
  const updates = req.body;
  const allowed = ['coding_score', 'sql_score', 'communication_score', 'resume_score', 'aptitude_score', 'projects_score', 'gd_score'];

  try {
    const setClauses = [];
    const values = [];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = GREATEST(${key}, ?)`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length > 0) {
      values.push(req.user.id);
      await pool.query(
        `UPDATE placement_analytics SET ${setClauses.join(', ')} WHERE user_id = ?`,
        values
      );
    }

    return success(res, {}, 'Analytics updated.');
  } catch (err) {
    console.error('Update analytics error:', err);
    return error(res, 'Failed to update analytics.', 500);
  }
};

module.exports = {
  readiness,
  exploreCompany,
  generateTest,
  saveTestResult,
  evaluateCode,
  generateGDTopic,
  submitGD,
  analytics,
  strategy,
  getDailyMissions,
  completeMission,
  updateAnalytics
};

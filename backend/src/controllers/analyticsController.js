const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');

const getSuccessScore = async (req, res) => {
  try {
    // 1. Fetch skills count
    const [skills] = await pool.query('SELECT COUNT(*) as count FROM skills WHERE user_id = ?', [req.user.id]);
    const skillsCount = skills[0]?.count || 0;

    // 2. Fetch quiz scores
    const [quizzes] = await pool.query('SELECT AVG(percentage) as avg FROM quiz_results WHERE user_id = ?', [req.user.id]);
    const quizAvg = parseFloat(quizzes[0]?.avg) || 0;

    // 3. Fetch coding test scores
    const [coding] = await pool.query('SELECT AVG(percentage) as avg FROM coding_tests WHERE user_id = ?', [req.user.id]);
    const codingAvg = parseFloat(coding[0]?.avg) || 0;

    // 4. Fetch student profile (streak, points)
    const [profiles] = await pool.query('SELECT placement_points, streak_days FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const points = profiles[0]?.placement_points || 0;
    const streak = profiles[0]?.streak_days || 0;

    // Composite Success Score calculation
    // Max skills contribution = 20 pts (4 pts per skill, cap at 5 skills)
    // Quizzes average contribution = 25 pts (avg % * 0.25)
    // Coding average contribution = 30 pts (avg % * 0.3)
    // Streak contribution = 10 pts (min(streak * 2, 10))
    // Points contribution = 15 pts (min(points / 100, 15))
    const skillsScore = Math.min(skillsCount * 4, 20);
    const quizScorePart = (quizAvg * 0.25);
    const codingScorePart = (codingAvg * 0.3);
    const streakScorePart = Math.min(streak * 2, 10);
    const pointsScorePart = Math.min(points / 100, 15);

    const overallSuccessScore = Math.round(skillsScore + quizScorePart + codingScorePart + streakScorePart + pointsScorePart);

    // Save/update this score in placement analytics
    await pool.query(
      `UPDATE placement_analytics 
       SET overall_score = ?, coding_score = ?, sql_score = ?, aptitude_score = ?, projects_score = ?, resume_score = ?
       WHERE user_id = ?`,
      [overallSuccessScore, Math.round(codingAvg), Math.round(quizAvg), Math.round(quizAvg * 0.9), Math.round(skillsScore * 5), Math.round(points > 0 ? 80 : 0), req.user.id]
    );

    return success(res, {
      overallSuccessScore: Math.min(overallSuccessScore, 100),
      metrics: {
        skillsCount,
        quizAverage: Math.round(quizAvg),
        codingAverage: Math.round(codingAvg),
        placementPoints: points,
        streakDays: streak
      }
    }, 'Student Success Score aggregated successfully.');
  } catch (err) {
    console.error('getSuccessScore error:', err);
    return error(res, 'Internal server error calculating Success Score.', 500);
  }
};

const updateAnalytics = async (req, res) => {
  const { codingScore, sqlScore, communicationScore, resumeScore, aptitudeScore, projectsScore } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE placement_analytics 
       SET coding_score = COALESCE(?, coding_score),
           sql_score = COALESCE(?, sql_score),
           communication_score = COALESCE(?, communication_score),
           resume_score = COALESCE(?, resume_score),
           aptitude_score = COALESCE(?, aptitude_score),
           projects_score = COALESCE(?, projects_score),
           overall_score = (coding_score + sql_score + communication_score + resume_score) / 4
       WHERE user_id = ?`,
      [codingScore, sqlScore, communicationScore, resumeScore, aptitudeScore, projectsScore, req.user.id]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Failed to update placement analytics.', 400);
    }

    return success(res, null, 'Placement analytics updated successfully.');
  } catch (err) {
    console.error('updateAnalytics error:', err);
    return error(res, 'Internal server error updating analytics details.', 500);
  }
};

const getHistory = async (req, res) => {
  try {
    // Historical trends (e.g. past test attempts percentage)
    const [attempts] = await pool.query(
      `SELECT percentage, taken_at FROM coding_tests WHERE user_id = ? 
       UNION ALL
       SELECT percentage, taken_at FROM quiz_results WHERE user_id = ?
       ORDER BY taken_at ASC LIMIT 15`,
      [req.user.id, req.user.id]
    );

    return success(res, attempts, 'Historical score trends retrieved.');
  } catch (err) {
    console.error('getHistory error:', err);
    return error(res, 'Internal server error resolving historical data.', 500);
  }
};

module.exports = {
  getSuccessScore,
  updateAnalytics,
  getHistory
};

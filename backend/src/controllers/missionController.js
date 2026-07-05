const { callAgent } = require('../services/geminiService');
const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

const getDailyMission = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Check if daily missions already generated for user today
    const [existingMissions] = await pool.query(
      'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?',
      [req.user.id, today]
    );

    if (existingMissions.length > 0) {
      return success(res, {
        missions: existingMissions[0].missions,
        completedMissions: existingMissions[0].completed_missions || [],
        pointsEarned: existingMissions[0].points_earned
      }, 'Daily missions loaded.');
    }

    // 2. Fetch student profile/skills for context
    const [profiles] = await pool.query('SELECT streak_days FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const [skills] = await pool.query('SELECT skill_name FROM skills WHERE user_id = ?', [req.user.id]);
    
    const streak = profiles[0]?.streak_days || 1;
    const skillsList = skills.map(s => s.skill_name).join(', ') || 'Java, SQL';

    const context = JSON.stringify({
      date: today,
      streakDays: streak,
      skills: skillsList
    });

    // 3. Generate missions using AI agent
    const aiResponse = await callAgent('DAILY_MISSION', 'Generate fresh challenges', context);

    // Ensure missions is array
    const missionsArray = aiResponse.missions || [
      { id: 'm1', type: 'coding', title: 'Array Rotation', description: 'Rotate an array by K positions', difficulty: 'easy', points: 10, time_minutes: 10 },
      { id: 'm2', type: 'sql', title: 'Basic Select', description: 'Write SQL query to fetch student names with age > 20', difficulty: 'easy', points: 10, time_minutes: 5 }
    ];

    // 4. Save to database
    const id = uuidv4();
    await pool.query(
      `INSERT INTO daily_missions (id, user_id, mission_date, missions, completed_missions, points_earned)
       VALUES (?, ?, ?, ?, '[]', 0)`,
      [id, req.user.id, today, JSON.stringify(missionsArray)]
    );

    return success(res, {
      missions: missionsArray,
      completedMissions: [],
      pointsEarned: 0,
      motivation: aiResponse.motivation || 'Unlock your potential step by step today!'
    }, 'New daily missions generated successfully.');
  } catch (err) {
    console.error('getDailyMission error:', err);
    // Return backup static missions if Gemini fails
    const backupMissions = [
      { id: 'm1', type: 'coding', title: 'List Duplicates', description: 'Write Python function to find duplicates in list', difficulty: 'easy', points: 10, time_minutes: 10 },
      { id: 'm2', type: 'sql', title: 'Aggregate Function', description: 'Calculate average salary of employees per department', difficulty: 'easy', points: 10, time_minutes: 5 }
    ];
    return success(res, {
      missions: backupMissions,
      completedMissions: [],
      pointsEarned: 0,
      motivation: 'Stay consistent and practice coding daily!'
    }, 'Missions loaded (Fallback).');
  }
};

const completeMission = async (req, res) => {
  const { missionId } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!missionId) {
    return error(res, 'Mission ID is required.', 400);
  }

  try {
    const [records] = await pool.query(
      'SELECT * FROM daily_missions WHERE user_id = ? AND mission_date = ?',
      [req.user.id, today]
    );

    if (records.length === 0) {
      return error(res, 'Daily missions record not found.', 404);
    }

    const record = records[0];
    const missions = record.missions;
    let completed = record.completed_missions || [];

    // Find the mission in list to get points
    const mission = missions.find(m => m.id === missionId);
    if (!mission) {
      return error(res, 'Mission not found in today\'s list.', 404);
    }

    if (completed.includes(missionId)) {
      return error(res, 'Mission has already been completed today.', 400);
    }

    completed.push(missionId);
    const rewardPoints = mission.points || 10;

    // Start transaction
    await pool.query('START TRANSACTION');

    // Update daily mission record
    await pool.query(
      'UPDATE daily_missions SET completed_missions = ?, points_earned = points_earned + ? WHERE id = ?',
      [JSON.stringify(completed), rewardPoints, record.id]
    );

    // Update student total points
    await pool.query(
      'UPDATE student_profiles SET placement_points = placement_points + ? WHERE user_id = ?',
      [rewardPoints, req.user.id]
    );

    // Audit logs for points
    const auditId = uuidv4();
    await pool.query(
      'INSERT INTO placement_points (id, user_id, points, activity) VALUES (?, ?, ?, ?)',
      [auditId, req.user.id, rewardPoints, `Completed Daily Mission: ${mission.title}`]
    );

    await pool.query('COMMIT');

    return success(res, {
      completedMissions: completed,
      pointsEarned: record.points_earned + rewardPoints
    }, 'Mission completed successfully.');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('completeMission error:', err);
    return error(res, 'Internal server error completing mission.', 500);
  }
};

const getPoints = async (req, res) => {
  try {
    const [auditLog] = await pool.query(
      'SELECT * FROM placement_points WHERE user_id = ? ORDER BY earned_at DESC LIMIT 30',
      [req.user.id]
    );

    return success(res, auditLog, 'Points log retrieved successfully.');
  } catch (err) {
    console.error('getPoints error:', err);
    return error(res, 'Internal server error resolving points logs.', 500);
  }
};

module.exports = {
  getDailyMission,
  completeMission,
  getPoints
};

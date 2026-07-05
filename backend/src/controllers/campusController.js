const { callAgent } = require('../services/geminiService');
const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

const helpdesk = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return error(res, 'Query message cannot be empty.', 400);
  }

  try {
    const aiResponse = await callAgent('HELPDESK', message);

    // Save interaction to chat history
    const chatId = uuidv4();
    await pool.query(
      `INSERT INTO chat_history (id, user_id, agent_name, module, user_message, ai_response)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [chatId, req.user.id, 'HELPDESK', 'CAMPUS', message, JSON.stringify(aiResponse)]
    );

    return success(res, aiResponse, 'Helpdesk agent resolved query.');
  } catch (err) {
    console.error('Campus Helpdesk error:', err);
    return error(res, 'Campus Helpdesk Agent failed to respond.', 500);
  }
};

const timetable = async (req, res) => {
  const { query } = req.body;
  const prompt = query || "Show today's classes and weekly schedule.";

  try {
    const aiResponse = await callAgent('TIMETABLE', prompt);
    return success(res, aiResponse, 'Timetable assistant resolved schedule.');
  } catch (err) {
    console.error('Timetable assistant error:', err);
    return error(res, 'Timetable Assistant failed to resolve.', 500);
  }
};

const library = async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return error(res, 'Search term or query is required.', 400);
  }

  try {
    const aiResponse = await callAgent('LIBRARY', query);
    return success(res, aiResponse, 'Library assistant resolved book information.');
  } catch (err) {
    console.error('Library assistant error:', err);
    return error(res, 'Library Assistant failed to resolve.', 500);
  }
};

const events = async (req, res) => {
  const { query } = req.body;
  const prompt = query || "Show upcoming hackathons, workshops and engineering symposiums.";

  try {
    const aiResponse = await callAgent('EVENTS', prompt);
    return success(res, aiResponse, 'Events agent resolved details.');
  } catch (err) {
    console.error('Events agent error:', err);
    return error(res, 'Events Assistant failed to resolve.', 500);
  }
};

module.exports = {
  helpdesk,
  timetable,
  library,
  events
};

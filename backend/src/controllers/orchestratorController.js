const { callAgent } = require('../services/geminiService');
const pool = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

/**
 * NEROX AI Multi-Agent Orchestrator
 * Routes student queries to the right specialized agents,
 * runs them in parallel or series, then merges responses.
 */

// Agent capability map — what each agent handles
const AGENT_CAPABILITIES = {
  HELPDESK:         { label: 'Helpdesk Agent',         emoji: '🏫', color: '#6366f1', description: 'Answering campus & policy questions' },
  TUTOR:            { label: 'Smart Tutor Agent',       emoji: '📚', color: '#8b5cf6', description: 'Explaining concepts & generating notes' },
  CODING_MENTOR:    { label: 'Coding Mentor Agent',     emoji: '💻', color: '#06b6d4', description: 'Code review, debug & optimization' },
  CODING_EVALUATOR: { label: 'Code Evaluator Agent',   emoji: '⚙️',  color: '#10b981', description: 'Evaluating code quality & complexity' },
  COMPANY_EXPLORER: { label: 'Company Intel Agent',    emoji: '🏢', color: '#f59e0b', description: 'Generating company intelligence profiles' },
  READINESS:        { label: 'Readiness Agent',         emoji: '🎯', color: '#ef4444', description: 'Scoring placement readiness vs company' },
  TEST_GENERATOR:   { label: 'Test Generator Agent',   emoji: '📝', color: '#8b5cf6', description: 'Generating company-specific tests' },
  INTERVIEW_COACH:  { label: 'Interview Coach Agent',   emoji: '🗣️', color: '#ec4899', description: 'Mock technical, HR and behavioral interviews' },
  GD_COACH:         { label: 'GD Coach Agent',          emoji: '🎙️', color: '#f97316', description: 'Evaluating group discussion skills' },
  STRATEGY:         { label: 'Strategy Planner Agent', emoji: '🗺️', color: '#0ea5e9', description: 'Building placement preparation roadmap' },
  CAREER_ADVISOR:   { label: 'Career Advisor Agent',   emoji: '🚀', color: '#a855f7', description: 'Advising career paths & certifications' },
  DAILY_MISSION:    { label: 'Daily Mission Agent',     emoji: '⚡', color: '#eab308', description: 'Generating today\'s personalized missions' },
  PLACEMENT_ANALYTICS: { label: 'Analytics Agent',     emoji: '📊', color: '#ec4899', description: 'Analyzing comprehensive placement metrics' },
  SKILL_GAP:        { label: 'Skill Gap Agent',         emoji: '🔍', color: '#14b8a6', description: 'Identifying skill gaps vs target role' },
  ORCHESTRATOR:     { label: 'AI Orchestrator',         emoji: '🧠', color: '#6366f1', description: 'Routing request to specialized agents' },
};

/**
 * Classify student intent and determine which agents to invoke
 */
const classifyIntent = async (message) => {
  try {
    const result = await callAgent('ORCHESTRATOR', message);
    // If single agent response
    if (result?.agent) {
      // Expand common multi-agent patterns
      const msg = message.toLowerCase();
      const agents = [result.agent];

      // Add complementary agents based on keywords
      if ((msg.includes('zoho') || msg.includes('tcs') || msg.includes('infosys') ||
           msg.includes('amazon') || msg.includes('microsoft') || msg.includes('google') ||
           msg.includes('prepare for') || msg.includes('placement')) &&
           !agents.includes('COMPANY_EXPLORER')) {
        agents.push('COMPANY_EXPLORER');
      }
      if ((msg.includes('prepare') || msg.includes('roadmap') || msg.includes('plan')) &&
           !agents.includes('STRATEGY')) {
        agents.push('STRATEGY');
      }
      if ((msg.includes('career') || msg.includes('job') || msg.includes('role') || msg.includes('paths')) &&
           !agents.includes('CAREER_ADVISOR')) {
        agents.push('CAREER_ADVISOR');
      }
      if ((msg.includes('ready') || msg.includes('readiness') || msg.includes('score')) &&
           !agents.includes('READINESS') && !agents.includes('PLACEMENT_ANALYTICS')) {
        agents.push('PLACEMENT_ANALYTICS');
      }
      if ((msg.includes('interview') || msg.includes('mock') || msg.includes('hr') || msg.includes('behavioral')) &&
           !agents.includes('INTERVIEW_COACH')) {
        agents.push('INTERVIEW_COACH');
      }
      if ((msg.includes('gap') || msg.includes('missing') || msg.includes('skills')) &&
           !agents.includes('SKILL_GAP')) {
        agents.push('SKILL_GAP');
      }
      return { agents, primaryAgent: result.agent, reasoning: result.reasoning };
    }
    return { agents: ['HELPDESK'], primaryAgent: 'HELPDESK', reasoning: 'Defaulting to helpdesk' };
  } catch {
    return { agents: ['HELPDESK'], primaryAgent: 'HELPDESK', reasoning: 'Fallback routing' };
  }
};

/**
 * POST /api/orchestrator/query
 * Main orchestrator endpoint — runs multiple agents and merges
 */
const query = async (req, res) => {
  const { message, context: extraContext } = req.body;

  if (!message || message.trim().length < 2) {
    return error(res, 'Please enter a message for NEROX AI.', 400);
  }

  try {
    // Fetch student profile for context
    const [profiles] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const [skills] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [req.user.id]);
    const [analytics] = await pool.query('SELECT * FROM placement_analytics WHERE user_id = ?', [req.user.id]);

    const studentContext = JSON.stringify({
      message,
      student: profiles[0] || {},
      skills: skills.map(s => s.skill_name),
      scores: analytics[0] || {},
      extraContext: extraContext || ''
    });

    // Step 1: Classify intent
    const { agents, primaryAgent, reasoning } = await classifyIntent(message);

    // Limit to max 4 agents to prevent timeout
    const agentsToRun = [...new Set(agents)].slice(0, 4);

    // Step 2: Build agent pipeline info
    const pipeline = agentsToRun.map(agentName => ({
      id: agentName,
      ...AGENT_CAPABILITIES[agentName] || { label: agentName, emoji: '🤖', color: '#6366f1', description: 'Processing request' },
      status: 'pending'
    }));

    // Step 3: Run agents (parallel where possible)
    const agentResults = {};
    const errors = {};

    await Promise.allSettled(
      agentsToRun.map(async (agentName) => {
        try {
          const result = await callAgent(agentName, message, studentContext);
          agentResults[agentName] = result;
        } catch (err) {
          console.warn(`Agent ${agentName} failed:`, err.message);
          errors[agentName] = err.message;
        }
      })
    );

    // Step 4: Build merged response
    const merged = buildMergedResponse(message, agentsToRun, agentResults, primaryAgent);

    // Step 5: Save to chat history
    const chatId = uuidv4();
    await pool.query(
      'INSERT INTO chat_history (id, user_id, agent_name, module, user_message, ai_response) VALUES (?, ?, ?, ?, ?, ?)',
      [chatId, req.user.id, primaryAgent, 'ORCHESTRATOR', message, JSON.stringify({ merged, agentResults })]
    );

    return success(res, {
      chatId,
      userMessage: message,
      pipeline,
      primaryAgent,
      reasoning,
      agentsRun: agentsToRun,
      agentResults,
      merged,
      errors: Object.keys(errors).length > 0 ? errors : null
    }, 'Multi-agent response generated.');

  } catch (err) {
    console.error('Orchestrator error:', err);
    return error(res, 'AI Orchestrator failed to process request.', 500);
  }
};

/**
 * Build a unified, readable merged response from all agent outputs
 */
const buildMergedResponse = (userMessage, agents, results, primaryAgent) => {
  const sections = [];

  // Primary agent answer first
  if (results[primaryAgent]) {
    const primary = results[primaryAgent];
    sections.push({
      agent: primaryAgent,
      info: AGENT_CAPABILITIES[primaryAgent],
      isPrimary: true,
      data: primary
    });
  }

  // Secondary agents
  agents.forEach(agentName => {
    if (agentName !== primaryAgent && results[agentName]) {
      sections.push({
        agent: agentName,
        info: AGENT_CAPABILITIES[agentName],
        isPrimary: false,
        data: results[agentName]
      });
    }
  });

  // Generate a summary
  const summary = generateSummary(userMessage, agents, results);

  return { sections, summary, agentCount: sections.length };
};

const generateSummary = (message, agents, results) => {
  const agentNames = agents
    .filter(a => results[a])
    .map(a => AGENT_CAPABILITIES[a]?.label || a);

  return `NEROX AI activated ${agentNames.length} specialized agent${agentNames.length > 1 ? 's' : ''}: ${agentNames.join(' → ')}. Your query has been analyzed and a comprehensive response has been compiled.`;
};

/**
 * GET /api/orchestrator/history
 * Fetch recent chat history for the student
 */
const history = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, agent_name, user_message, ai_response, created_at
       FROM chat_history
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    const parsed = rows.map(r => ({
      ...r,
      ai_response: typeof r.ai_response === 'string' ? JSON.parse(r.ai_response) : r.ai_response
    }));

    return success(res, parsed, 'Chat history retrieved.');
  } catch (err) {
    console.error('History error:', err);
    return error(res, 'Failed to load chat history.', 500);
  }
};

/**
 * GET /api/orchestrator/agents
 * Return list of all available agents and their capabilities
 */
const listAgents = async (req, res) => {
  const agents = Object.entries(AGENT_CAPABILITIES)
    .filter(([key]) => key !== 'ORCHESTRATOR')
    .map(([key, val]) => ({ id: key, ...val }));

  return success(res, agents, 'Available AI agents listed.');
};

module.exports = { query, history, listAgents, AGENT_CAPABILITIES };

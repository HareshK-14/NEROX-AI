const { genAI, AGENT_PROMPTS } = require('../config/gemini');

const MODEL = 'gemini-2.5-flash';

/**
 * Strip markdown code fences from Gemini responses (```json ... ```)
 */
const stripMarkdown = (text) => {
  let clean = text.trim();
  // Remove opening fence (e.g. ```json or ```)
  clean = clean.replace(/^```(?:json)?\s*/i, '');
  // Remove closing fence
  clean = clean.replace(/\s*```\s*$/, '');
  return clean.trim();
};

/**
 * Calls a specific NEROX AI Agent by name using the latest @google/genai SDK.
 *
 * @param {string} agentName       - Key in AGENT_PROMPTS (e.g. 'ORCHESTRATOR', 'COMPANY_READINESS')
 * @param {string} userMessage     - The user prompt or input content
 * @param {string} additionalContext - Extra structured context passed alongside the user message
 * @returns {object|string}        - Parsed JSON object, or { raw: string } on parse failure
 */
const callAgent = async (agentName, userMessage, additionalContext = '') => {
  const systemPrompt = AGENT_PROMPTS[agentName];
  if (!systemPrompt) {
    throw new Error(`No system prompt found for agent: "${agentName}". Available agents: ${Object.keys(AGENT_PROMPTS).join(', ')}`);
  }

  const finalMessage = additionalContext
    ? `[SYSTEM CONTEXT]\n${additionalContext}\n\n[USER INPUT]\n${userMessage}`
    : userMessage;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: finalMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const rawText = response.text;

    // Attempt JSON parse after stripping markdown fences
    const cleaned = stripMarkdown(rawText);
    try {
      return JSON.parse(cleaned);
    } catch (_parseErr) {
      console.warn(`⚠️  Agent [${agentName}] returned non-JSON. Returning raw text.`);
      return { raw: rawText };
    }
  } catch (err) {
    // Provide actionable error messages
    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
      throw new Error('Invalid Gemini API Key. Please update GEMINI_API_KEY in backend/.env with a valid key from https://aistudio.google.com/apikey');
    }
    if (err.message?.includes('PERMISSION_DENIED')) {
      throw new Error('Gemini API permission denied. Check your API key permissions at https://aistudio.google.com/apikey');
    }
    if (err.message?.includes('QUOTA_EXCEEDED') || err.message?.includes('429')) {
      throw new Error('Gemini API quota exceeded. Please check your usage at https://aistudio.google.com');
    }
    console.error(`❌ Gemini Agent [${agentName}] error:`, err.message);
    throw new Error(`AI Agent "${agentName}" failed: ${err.message}`);
  }
};

/**
 * Quick text generation — no JSON parsing, returns plain string.
 * Useful for streaming or simple text completions.
 */
const generateText = async (prompt, systemInstruction = '') => {
  const config = {
    model: MODEL,
    contents: prompt,
  };
  if (systemInstruction) {
    config.config = { systemInstruction };
  }
  const response = await genAI.models.generateContent(config);
  return response.text;
};

module.exports = { callAgent, generateText };

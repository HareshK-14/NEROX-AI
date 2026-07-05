const { callAgent } = require('./geminiService');

/**
 * Routes user requests automatically to the correct AI Agent.
 * @param {string} userMessage The query sent by student
 * @param {string} additionalContext Context about current student profile/skills
 */
const routeAndExecute = async (userMessage, additionalContext = '') => {
  try {
    console.log(`[ORCHESTRATOR] Analyzing route for query: "${userMessage.substring(0, 50)}..."`);
    
    // Step 1: Query Orchestrator to classify intent
    const classification = await callAgent('ORCHESTRATOR', userMessage, additionalContext);
    
    const activeAgent = classification.agent || 'HELPDESK';
    const activeModule = classification.module || 'CAMPUS';
    const confidence = classification.confidence || 1.0;
    const reasoning = classification.reasoning || 'Automated classification';

    console.log(`[ORCHESTRATOR] Routing to Agent [${activeAgent}] (Confidence: ${confidence})`);

    // Step 2: Invoke the classified agent
    const agentResponse = await callAgent(activeAgent, userMessage, additionalContext);

    return {
      success: true,
      orchestration: {
        agent: activeAgent,
        module: activeModule,
        confidence,
        reasoning
      },
      response: agentResponse
    };
  } catch (err) {
    console.error('[ORCHESTRATOR] Failure during routing/execution:', err);
    throw err;
  }
};

module.exports = {
  routeAndExecute
};

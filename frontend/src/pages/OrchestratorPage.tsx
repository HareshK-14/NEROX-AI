import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Loader2, Bot, User, Sparkles, Zap, Target,
  Briefcase, Code2, BookOpen, Users, Map, BarChart3,
  MessageSquare, Lightbulb, HelpCircle, Flame, X, ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import AgentActivityPanel, { AgentPipelineStep } from '../components/ui/AgentActivityPanel';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pipeline?: AgentPipelineStep[];
  agentsRun?: string[];
  agentResults?: Record<string, any>;
  merged?: any;
  summary?: string;
  timestamp: Date;
}

// ── Quick prompt suggestions ───────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: <Target className="w-3.5 h-3.5" />,     label: 'Am I ready for Zoho?',           color: 'from-indigo-500 to-violet-600' },
  { icon: <Briefcase className="w-3.5 h-3.5" />,  label: 'Tell me about TCS interview',    color: 'from-violet-500 to-purple-600' },
  { icon: <Code2 className="w-3.5 h-3.5" />,      label: 'Explain binary search',          color: 'from-cyan-500 to-blue-600' },
  { icon: <Map className="w-3.5 h-3.5" />,        label: 'Build my 30-day roadmap',        color: 'from-sky-500 to-cyan-600' },
  { icon: <Users className="w-3.5 h-3.5" />,      label: 'Give me a GD topic to practice', color: 'from-amber-500 to-orange-600' },
  { icon: <BarChart3 className="w-3.5 h-3.5" />,  label: 'Analyze my placement progress',  color: 'from-pink-500 to-rose-600' },
  { icon: <BookOpen className="w-3.5 h-3.5" />,   label: 'What certifications should I do?',color: 'from-emerald-500 to-teal-600' },
  { icon: <HelpCircle className="w-3.5 h-3.5" />, label: 'What are attendance rules?',     color: 'from-gray-500 to-slate-600' },
];

// ── Agent color map ────────────────────────────────────────────────────────────
const AGENT_COLORS: Record<string, string> = {
  HELPDESK:            '#6366f1',
  TUTOR:               '#8b5cf6',
  CODING_MENTOR:       '#06b6d4',
  CODING_EVALUATOR:    '#10b981',
  COMPANY_EXPLORER:    '#f59e0b',
  READINESS:           '#ef4444',
  TEST_GENERATOR:      '#8b5cf6',
  INTERVIEW_COACH:      '#ec4899',
  GD_COACH:            '#f97316',
  STRATEGY:            '#0ea5e9',
  CAREER_ADVISOR:      '#a855f7',
  DAILY_MISSION:       '#eab308',
  PLACEMENT_ANALYTICS: '#ec4899',
  SKILL_GAP:           '#14b8a6',
};

const AGENT_EMOJI: Record<string, string> = {
  HELPDESK: '🏫', TUTOR: '📚', CODING_MENTOR: '💻', CODING_EVALUATOR: '⚙️',
  COMPANY_EXPLORER: '🏢', READINESS: '🎯', TEST_GENERATOR: '📝',
  INTERVIEW_COACH: '🗣️', GD_COACH: '🎙️',
  STRATEGY: '🗺️', CAREER_ADVISOR: '🚀', DAILY_MISSION: '⚡', PLACEMENT_ANALYTICS: '📊', SKILL_GAP: '🔍',
};

const AGENT_LABELS: Record<string, string> = {
  HELPDESK: 'Helpdesk Agent', TUTOR: 'Smart Tutor Agent', CODING_MENTOR: 'Coding Mentor Agent',
  CODING_EVALUATOR: 'Code Evaluator Agent', COMPANY_EXPLORER: 'Company Intel Agent',
  READINESS: 'Readiness Agent', TEST_GENERATOR: 'Test Generator Agent',
  INTERVIEW_COACH: 'Interview Coach Agent', GD_COACH: 'GD Coach Agent',
  STRATEGY: 'Strategy Agent', CAREER_ADVISOR: 'Career Advisor Agent', DAILY_MISSION: 'Mission Agent',
  PLACEMENT_ANALYTICS: 'Analytics Agent', SKILL_GAP: 'Skill Gap Agent',
};

// ── Render agent result block ─────────────────────────────────────────────────
const AgentResultBlock: React.FC<{ agentId: string; data: any; isPrimary: boolean }> = ({ agentId, data, isPrimary }) => {
  const [expanded, setExpanded] = React.useState(isPrimary);
  const color = AGENT_COLORS[agentId] || '#6366f1';
  const emoji = AGENT_EMOJI[agentId] || '🤖';
  const label = AGENT_LABELS[agentId] || agentId;

  const renderValue = (val: any, depth = 0): React.ReactNode => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'string') return <span className="text-gray-300">{val}</span>;
    if (typeof val === 'number') return <span className="font-bold" style={{ color }}>{val}</span>;
    if (typeof val === 'boolean') return <span className={val ? 'text-emerald-400' : 'text-rose-400'}>{val ? 'Yes' : 'No'}</span>;
    if (Array.isArray(val)) {
      if (val.length === 0) return null;
      if (typeof val[0] === 'string') {
        return (
          <ul className="space-y-0.5">
            {val.slice(0, 8).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                <span style={{ color }} className="mt-0.5">•</span>{item}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <div className="space-y-2">
          {val.slice(0, 4).map((item, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/3 border border-white/5">
              {renderValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    if (typeof val === 'object') {
      if (depth > 2) return <span className="text-gray-500 text-[10px]">[nested object]</span>;
      return (
        <div className="space-y-2">
          {Object.entries(val).slice(0, 8).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[auto_1fr] gap-2 items-start">
              <span className="text-[10px] font-mono uppercase text-gray-500 min-w-[80px] pt-0.5">
                {k.replace(/_/g, ' ')}:
              </span>
              <div className="text-xs">{renderValue(v, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }
    return String(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: color + '30' }}
    >
      {/* Agent header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-all hover:bg-white/3 text-left"
        style={{ background: color + '10' }}
      >
        <span className="text-lg">{emoji}</span>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-white">{label}</span>
          {isPrimary && (
            <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white">PRIMARY</span>
          )}
        </div>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 pt-3 overflow-hidden"
          >
            <div className="space-y-2 text-xs">
              {renderValue(data)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Assistant Message ─────────────────────────────────────────────────────────
const AssistantMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const [showRaw, setShowRaw] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-nerox-indigo to-nerox-violet flex items-center justify-center shrink-0 mt-1">
        <Brain className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-nerox-indigo uppercase font-mono">NEROX AI</span>
          {msg.agentsRun && msg.agentsRun.length > 0 && (
            <div className="flex items-center gap-1">
              {msg.agentsRun.map(a => (
                <span key={a} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: AGENT_COLORS[a] + '20', color: AGENT_COLORS[a], border: `1px solid ${AGENT_COLORS[a]}40` }}>
                  {AGENT_EMOJI[a]} {AGENT_LABELS[a]?.split(' ')[0]}
                </span>
              ))}
            </div>
          )}
          <span className="text-[9px] text-gray-600 ml-auto">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Summary text */}
        {msg.merged?.summary && (
          <p className="text-xs text-gray-400 leading-relaxed italic">{msg.merged.summary}</p>
        )}

        {/* Agent result blocks */}
        {msg.merged?.sections && msg.merged.sections.length > 0 ? (
          <div className="space-y-2">
            {msg.merged.sections.map((section: any) => (
              <AgentResultBlock
                key={section.agent}
                agentId={section.agent}
                data={section.data}
                isPrimary={section.isPrimary}
              />
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-white/4 border border-white/8 text-xs text-gray-300 leading-relaxed">
            {msg.content}
          </div>
        )}

        {/* Toggle raw */}
        {msg.agentResults && (
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-[9px] font-mono text-gray-600 hover:text-gray-400 cursor-pointer"
          >
            {showRaw ? '▲ hide raw JSON' : '▼ show raw agent data'}
          </button>
        )}
        {showRaw && msg.agentResults && (
          <pre className="text-[9px] font-mono text-gray-500 bg-black/30 rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto">
            {JSON.stringify(msg.agentResults, null, 2)}
          </pre>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Orchestrator Page ────────────────────────────────────────────────────
const OrchestratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isRunning, setIsRunning] = React.useState(false);
  const [pipeline, setPipeline] = React.useState<AgentPipelineStep[]>([]);
  const [activeSummary, setActiveSummary] = React.useState('');
  const [agents, setAgents] = React.useState<any[]>([]);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    // Load agent list
    api.get('/orchestrator/agents').then(res => {
      if (res.data.success) setAgents(res.data.data);
    }).catch(() => {});

    // Welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '',
      merged: {
        sections: [],
        summary: "Welcome to NEROX AI Command Center. I'm your autonomous AI Orchestrator with access to 14 specialized agents. Ask me anything about your placement preparation, company research, coding help, career guidance, mock interviews, or campus FAQs. I'll automatically route your request to the right agents."
      },
      timestamp: new Date()
    }]);
  }, []);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRunning]);

  const handleSend = async () => {
    if (!input.trim() || isRunning) return;
    const userMessage = input.trim();
    setInput('');

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsRunning(true);
    setPipeline([]);

    try {
      const res = await api.post('/orchestrator/query', { message: userMessage });

      if (res.data.success) {
        const d = res.data.data;

        // Build pipeline from agentsRun
        const steps: AgentPipelineStep[] = (d.agentsRun || []).map((a: string) => ({
          id: a,
          label: AGENT_LABELS[a] || a,
          emoji: AGENT_EMOJI[a] || '🤖',
          color: AGENT_COLORS[a] || '#6366f1',
          description: 'processing',
          status: 'done'
        }));

        setPipeline(steps);
        setActiveSummary(d.merged?.summary || '');

        // Delay to let animation play
        await new Promise(r => setTimeout(r, steps.length * 900 + 400));

        const assistantMsg: ChatMessage = {
          id: d.chatId || Date.now().toString(),
          role: 'assistant',
          content: d.merged?.summary || 'Response ready.',
          pipeline: steps,
          agentsRun: d.agentsRun,
          agentResults: d.agentResults,
          merged: d.merged,
          summary: d.merged?.summary,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ The AI Orchestrator encountered an issue. Please check your backend connection and Gemini API key.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsRunning(false);
      setPipeline([]);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <PageWrapper>
      <div className="flex gap-5 h-[calc(100vh-120px)]">

        {/* ── Left: Agent Directory ─────────────────────────────────────── */}
        <div className="hidden xl:flex flex-col w-64 shrink-0 gap-3">
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-nerox-indigo" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-nerox-indigo font-bold">AI Agent Directory</span>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-[60vh]">
              {agents.map(agent => (
                <div key={agent.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/3 border border-white/5 hover:border-white/12 transition-all cursor-default">
                  <span className="text-base">{agent.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-white truncate">{agent.label}</p>
                    <p className="text-[9px] text-gray-600 truncate">{agent.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4 text-center" hover={false}>
            <Sparkles className="w-6 h-6 text-nerox-gold mx-auto mb-2" />
            <p className="text-[10px] text-gray-400 leading-relaxed">Orchestrator routes your query to the best combination of agents automatically.</p>
          </GlassCard>
        </div>

        {/* ── Main Chat Area ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 gap-3">
          {/* Header */}
          <GlassCard className="p-4 flex items-center gap-3 shrink-0" hover={false}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-nerox-indigo to-nerox-violet">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-sm font-black font-grotesk text-white">AI Command Center</h1>
              <p className="text-[10px] text-gray-500">Multi-Agent Orchestrator — 14 Specialized AI Agents</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />ONLINE
              </span>
            </div>
          </GlassCard>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 justify-end"
                  >
                    <div className="max-w-lg">
                      <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-nerox-indigo to-nerox-violet text-white text-xs leading-relaxed">
                        {msg.content}
                      </div>
                      <p className="text-[9px] text-gray-600 mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ) : (
                  <AssistantMessage msg={msg} />
                )}
              </div>
            ))}

            {/* Running state — agent activity panel */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-nerox-indigo to-nerox-violet flex items-center justify-center shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <AgentActivityPanel
                      pipeline={pipeline}
                      isRunning={isRunning}
                      summary={activeSummary}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="flex gap-2 flex-wrap shrink-0">
            {QUICK_PROMPTS.slice(0, 5).map((p, i) => (
              <button
                key={i}
                onClick={() => { setInput(p.label); inputRef.current?.focus(); }}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold border border-white/8 bg-white/4 text-gray-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer disabled:opacity-40"
              >
                {p.icon}{p.label}
              </button>
            ))}
          </div>

          {/* Input box */}
          <GlassCard className="p-3 flex gap-3 items-end shrink-0" hover={false}>
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              placeholder="Ask NEROX AI anything... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none leading-relaxed"
            />
            <button
              onClick={handleSend}
              disabled={isRunning || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              {isRunning
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
};

export default OrchestratorPage;

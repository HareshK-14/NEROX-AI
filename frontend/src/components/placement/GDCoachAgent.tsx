import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mic, Send, RefreshCw, Loader2, CheckCircle2, Star } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';
import ProgressRing from '../ui/ProgressRing';

const GDCoachAgent: React.FC = () => {
  const [phase, setPhase] = React.useState<'setup' | 'topic' | 'writing' | 'result'>('setup');
  const [topicType, setTopicType] = React.useState('mixed');
  const [loadingTopic, setLoadingTopic] = React.useState(false);
  const [loadingEval, setLoadingEval] = React.useState(false);
  const [gdData, setGdData] = React.useState<any>(null);
  const [studentResponse, setStudentResponse] = React.useState('');
  const [evalResult, setEvalResult] = React.useState<any>(null);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [timerActive, setTimerActive] = React.useState(false);

  const TOPIC_TYPES = [
    { id: 'technical',      label: 'Technical',      emoji: '⚙️' },
    { id: 'current_affairs',label: 'Current Affairs', emoji: '📰' },
    { id: 'abstract',       label: 'Abstract',        emoji: '💡' },
    { id: 'case_study',     label: 'Case Study',      emoji: '📊' },
    { id: 'mixed',          label: 'Mixed',           emoji: '🎲' },
  ];

  // Countdown timer
  React.useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { clearInterval(t); setTimerActive(false); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, [timerActive, timeLeft]);

  const fetchTopic = async () => {
    setLoadingTopic(true);
    try {
      const res = await api.post('/placement/gd/topic', { topicType });
      if (res.data.success) {
        setGdData(res.data.data);
        setPhase('topic');
      }
    } catch (e) { console.error(e); }
    finally { setLoadingTopic(false); }
  };

  const startWriting = () => {
    setPhase('writing');
    const mins = gdData?.time_limit_minutes || 5;
    setTimeLeft(mins * 60);
    setTimerActive(true);
  };

  const handleSubmit = async () => {
    if (!studentResponse.trim() || !gdData?.topic) return;
    setTimerActive(false);
    setLoadingEval(true);
    try {
      const res = await api.post('/placement/gd/submit', { topic: gdData.topic, response: studentResponse });
      if (res.data.success) {
        setEvalResult(res.data.data);
        setPhase('result');
      }
    } catch (e) { console.error(e); }
    finally { setLoadingEval(false); }
  };

  const reset = () => {
    setPhase('setup'); setGdData(null); setStudentResponse('');
    setEvalResult(null); setTimeLeft(0); setTimerActive(false);
  };

  const formatTime = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  const ev = evalResult?.evaluation || {};
  const scoreKeys = ['communication_score', 'grammar_score', 'confidence_score', 'relevance_score', 'vocabulary_score', 'critical_thinking_score'];
  const scoreLabels: Record<string, string> = {
    communication_score: 'Communication',
    grammar_score: 'Grammar',
    confidence_score: 'Confidence',
    relevance_score: 'Relevance',
    vocabulary_score: 'Vocabulary',
    critical_thinking_score: 'Critical Thinking',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <AnimatePresence mode="wait">

        {/* Setup */}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <GlassCard className="p-6 text-center space-y-4" hover={false}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Users className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-black text-white font-grotesk">GD Coach Agent</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                Practice Group Discussion with AI-powered evaluation across 6 communication dimensions.
                Get a topic, write your argument, receive expert feedback.
              </p>
            </GlassCard>

            <GlassCard className="p-5 space-y-4" hover={false}>
              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block">Choose Topic Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TOPIC_TYPES.map(t => (
                  <button key={t.id} onClick={() => setTopicType(t.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                      topicType === t.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                        : 'bg-white/4 border-white/8 text-gray-400 hover:text-white hover:bg-white/8'
                    }`}>
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-[11px] font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={fetchTopic} disabled={loadingTopic}
                className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                {loadingTopic ? <><Loader2 className="w-4 h-4 animate-spin" />Generating Topic...</> : <><Mic className="w-4 h-4" />Get GD Topic</>}
              </button>
            </GlassCard>
          </motion.div>
        )}

        {/* Topic reveal */}
        {phase === 'topic' && gdData && (
          <motion.div key="topic" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <GlassCard className="p-6 text-center space-y-3" glow hover={false}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {gdData.topic_type?.replace('_', ' ')} • {gdData.time_limit_minutes} min
              </div>
              <h2 className="text-xl font-black text-white font-grotesk leading-tight">{gdData.topic}</h2>
              <p className="text-xs text-gray-400 leading-relaxed max-w-lg mx-auto">{gdData.background}</p>
            </GlassCard>

            {gdData.key_points_to_cover?.length > 0 && (
              <GlassCard className="p-4 space-y-2" hover={false}>
                <span className="text-[10px] uppercase font-mono text-gray-500">Key Points to Cover</span>
                <div className="grid grid-cols-2 gap-2">
                  {gdData.key_points_to_cover.map((pt: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />{pt}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <button onClick={startWriting} className="btn-primary w-full py-3 text-sm font-bold cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
              ▶ Start GD — Begin Timer
            </button>
          </motion.div>
        )}

        {/* Writing */}
        {phase === 'writing' && (
          <motion.div key="writing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <GlassCard className="p-4 flex items-center justify-between" hover={false}>
              <div>
                <p className="text-[10px] text-gray-500 font-mono uppercase mb-0.5">Topic</p>
                <p className="text-xs font-semibold text-white">{gdData?.topic}</p>
              </div>
              <div className={`text-2xl font-black font-grotesk tabular-nums ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-nerox-cyan'}`}>
                {formatTime(timeLeft)}
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-3" hover={false}>
              <div className="flex justify-between">
                <label className="text-[10px] uppercase font-mono text-gray-500">Your GD Response</label>
                <span className="text-[10px] font-mono text-gray-600">{studentResponse.length} chars</span>
              </div>
              <textarea
                rows={10}
                value={studentResponse}
                onChange={e => setStudentResponse(e.target.value)}
                className="w-full input-glass text-xs resize-none leading-relaxed font-sans"
                placeholder="Type your group discussion argument here. Cover multiple perspectives, use data/examples, maintain a logical flow..."
                autoFocus
              />
              <button onClick={handleSubmit} disabled={loadingEval || !studentResponse.trim()}
                className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                {loadingEval ? <><Loader2 className="w-4 h-4 animate-spin" />Evaluating...</> : <><Send className="w-4 h-4" />Submit for Evaluation</>}
              </button>
            </GlassCard>
          </motion.div>
        )}

        {/* Result */}
        {phase === 'result' && evalResult && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <GlassCard className="p-6" glow hover={false}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ProgressRing percentage={ev.overall_score || 0} size={110} strokeWidth={9} label="GD Score" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-white font-grotesk">GD Evaluation Result</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      ev.overall_band === 'Excellent' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                      ev.overall_band === 'Good'      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' :
                      ev.overall_band === 'Average'   ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
                                                        'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    }`}>{ev.overall_band}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{ev.feedback}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(ev.strong_points || []).slice(0, 3).map((pt: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">✓ {pt}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Score breakdown */}
            <GlassCard className="p-5" hover={false}>
              <span className="text-xs font-bold text-white font-grotesk block mb-4">DIMENSION BREAKDOWN</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {scoreKeys.map(key => {
                  const val = ev[key] || 0;
                  return (
                    <div key={key} className="p-3 rounded-xl bg-white/4 border border-white/6 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-gray-500">{scoreLabels[key]}</span>
                        <span className={`text-sm font-black ${val >= 80 ? 'text-emerald-400' : val >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{val}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Model Answer */}
            {evalResult.model_answer && (
              <GlassCard className="p-5 space-y-2" hover={false}>
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-nerox-gold" /><span className="text-xs font-bold text-white font-grotesk">MODEL ANSWER STRUCTURE</span></div>
                <p className="text-xs text-gray-400 leading-relaxed">{evalResult.model_answer}</p>
              </GlassCard>
            )}

            {/* Useful phrases */}
            {evalResult.useful_phrases?.length > 0 && (
              <GlassCard className="p-4 space-y-2" hover={false}>
                <span className="text-[10px] font-mono uppercase text-gray-500">Useful Phrases for Next GD</span>
                <div className="flex flex-wrap gap-2">
                  {evalResult.useful_phrases.map((p: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-nerox-indigo/15 border border-nerox-indigo/30 text-nerox-indigo">"{p}"</span>
                  ))}
                </div>
              </GlassCard>
            )}

            <button onClick={reset} className="btn-ghost w-full py-2.5 text-xs cursor-pointer flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />Practice Another GD
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GDCoachAgent;

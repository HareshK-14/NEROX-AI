import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestTube, CheckCircle2, XCircle, Trophy, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';
import ProgressRing from '../ui/ProgressRing';

const COMPANIES = ['TCS','Infosys','Wipro','Cognizant','Capgemini','Accenture','Zoho','Amazon','Microsoft','Google'];
const TEST_TYPES = [
  { id: 'full',       label: 'Full Paper',      desc: 'Aptitude + Coding + SQL + HR' },
  { id: 'aptitude',  label: 'Aptitude Only',   desc: 'Quantitative + Logical + Verbal' },
  { id: 'coding',    label: 'Coding Only',      desc: 'DSA + Problem Solving' },
  { id: 'sql',       label: 'SQL Only',         desc: 'Queries + Joins + Aggregation' },
  { id: 'technical', label: 'Technical MCQ',   desc: 'CS Fundamentals + OOP' },
  { id: 'hr',        label: 'HR Round',         desc: 'Behavioral + Situational' },
];

const MockTestAgent: React.FC = () => {
  const [company, setCompany] = React.useState('TCS');
  const [testType, setTestType] = React.useState('full');
  const [loading, setLoading] = React.useState(false);
  const [test, setTest] = React.useState<any>(null);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [saving, setSaving] = React.useState(false);

  const generateTest = async () => {
    setLoading(true); setTest(null); setAnswers({}); setSubmitted(false); setResult(null);
    try {
      const res = await api.post('/placement/test', { company, testType });
      if (res.data.success) setTest(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!test) return;
    setSaving(true);

    // Calculate score locally
    let totalQ = 0, correct = 0;
    const allQuestions: any[] = [];
    (test.sections || []).forEach((s: any) => {
      (s.questions || []).forEach((q: any) => {
        totalQ++;
        allQuestions.push(q);
        const ans = answers[q.id] || '';
        if (q.correct_answer && ans.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) correct++;
      });
    });

    const pct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
    const weakAreas = test.sections
      ?.filter((s: any) => {
        const sq = s.questions || [];
        const sc = sq.filter((q: any) => answers[q.id]?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()).length;
        return sq.length > 0 && (sc / sq.length) < 0.6;
      })
      .map((s: any) => s.name) || [];

    setResult({ score: correct, total: totalQ, percentage: pct, weakAreas });
    setSubmitted(true);

    try {
      await api.post('/placement/test/save', {
        company, testType,
        score: correct, totalMarks: totalQ, percentage: pct,
        weakAreas, answers
      });
    } catch {}
    setSaving(false);
  };

  const reset = () => { setTest(null); setAnswers({}); setSubmitted(false); setResult(null); };

  return (
    <div className="space-y-5">
      {!test && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassCard className="p-5 space-y-4" hover={false}>
            <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block">Agent 3 — Mock Test Generator</span>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-gray-500">Target Company</label>
              <div className="grid grid-cols-2 gap-1.5">
                {COMPANIES.map(c => (
                  <button key={c} onClick={() => setCompany(c)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all border text-left ${
                      company === c ? 'bg-nerox-indigo/30 border-nerox-indigo/60 text-white' : 'bg-white/4 border-white/6 text-gray-400 hover:text-white'
                    }`}>{c}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-4" hover={false}>
            <label className="text-[10px] uppercase font-mono text-gray-500 block">Test Type</label>
            <div className="space-y-2">
              {TEST_TYPES.map(t => (
                <button key={t.id} onClick={() => setTestType(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left cursor-pointer border transition-all ${
                    testType === t.id ? 'bg-nerox-indigo/25 border-nerox-indigo/50' : 'bg-white/4 border-white/6 hover:bg-white/8'
                  }`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${testType === t.id ? 'bg-nerox-indigo' : 'bg-gray-600'}`} />
                  <div>
                    <div className={`text-xs font-semibold ${testType === t.id ? 'text-white' : 'text-gray-400'}`}>{t.label}</div>
                    <div className="text-[10px] text-gray-600">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={generateTest} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-3 cursor-pointer">
              <TestTube className="w-4 h-4" /> Generate {company} Test Paper
            </button>
          </GlassCard>
        </div>
      )}

      {loading && (
        <GlassCard className="p-16 flex flex-col items-center justify-center" hover={false}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 mb-4" />
          <p className="text-xs font-mono text-gray-400 animate-pulse">Generating {company} placement test...</p>
        </GlassCard>
      )}

      {/* Test Interface */}
      {test && !result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="p-4 flex items-center justify-between" hover={false}>
            <div>
              <h3 className="text-sm font-black text-white font-grotesk">{test.company} — {TEST_TYPES.find(t=>t.id===testType)?.label}</h3>
              <p className="text-[10px] text-gray-500 font-mono">{test.total_duration_minutes} min • {test.total_marks} marks • {test.sections?.length} sections</p>
            </div>
            <button onClick={reset} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" />Reset</button>
          </GlassCard>

          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            {(test.sections || []).map((section: any, si: number) => (
              <GlassCard key={si} className="p-5" hover={false}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/6">
                  <span className="w-6 h-6 rounded-lg bg-nerox-indigo/25 border border-nerox-indigo/40 text-nerox-indigo text-[10px] font-bold flex items-center justify-center">{si+1}</span>
                  <span className="text-xs font-bold text-white font-grotesk">{section.name}</span>
                  <span className="text-[10px] text-gray-500 ml-auto">{section.marks} marks • {section.time_limit_minutes} min</span>
                </div>
                <div className="space-y-4">
                  {(section.questions || []).map((q: any, qi: number) => {
                    const chosen = answers[q.id] || '';
                    const isCorrect = submitted && chosen.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase();
                    const isWrong = submitted && chosen && !isCorrect;
                    return (
                      <div key={q.id || qi} className="space-y-2">
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          <span className="text-nerox-indigo mr-2">Q{qi+1}.</span>{q.question}
                        </p>
                        {q.options && q.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt: string) => {
                              const isSelected = chosen === opt;
                              const isCorrectOpt = submitted && opt.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase();
                              return (
                                <button key={opt} disabled={submitted}
                                  onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))}
                                  className={`p-2.5 rounded-xl text-left text-xs border transition-all cursor-pointer ${
                                    isCorrectOpt ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' :
                                    (isSelected && submitted) ? 'bg-rose-500/15 border-rose-500/50 text-rose-300' :
                                    isSelected ? 'bg-nerox-indigo/25 border-nerox-indigo/60 text-white' :
                                    'bg-white/4 border-white/6 text-gray-400 hover:text-white'
                                  }`}>
                                  {isCorrectOpt && submitted ? <CheckCircle2 className="inline w-3 h-3 mr-1" /> : isSelected && submitted ? <XCircle className="inline w-3 h-3 mr-1" /> : null}
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <textarea rows={3} disabled={submitted}
                            value={answers[q.id] || ''}
                            onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                            className="w-full input-glass text-xs resize-none"
                            placeholder="Type your answer..." />
                        )}
                        {submitted && q.explanation && (
                          <p className="text-[10px] text-nerox-cyan bg-nerox-cyan/10 border border-nerox-cyan/20 rounded-lg px-3 py-1.5">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            ))}
          </div>

          {!submitted && (
            <button onClick={handleSubmit} disabled={saving} className="btn-primary w-full py-3 text-sm font-bold cursor-pointer">
              {saving ? 'Saving...' : 'Submit & Grade Test'}
            </button>
          )}
        </motion.div>
      )}

      {/* Result Dashboard */}
      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <GlassCard className="p-6" glow hover={false}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ProgressRing percentage={result.percentage} size={120} strokeWidth={10} label="Score" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-nerox-gold" />
                  <h3 className="text-lg font-black text-white font-grotesk">{company} Mock Test Result</h3>
                </div>
                <p className="text-sm text-gray-300">{result.score} / {result.total} questions correct</p>
                <p className={`text-base font-bold ${result.percentage >= 70 ? 'text-emerald-400' : result.percentage >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {result.percentage >= 70 ? '🎉 Excellent Performance!' : result.percentage >= 50 ? '👍 Good Effort' : '📚 Needs More Practice'}
                </p>
                {result.weakAreas?.length > 0 && (
                  <div className="flex items-start gap-2 text-xs text-amber-400 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Weak areas: {result.weakAreas.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
          <button onClick={reset} className="btn-ghost w-full py-2.5 text-xs cursor-pointer flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Take Another Test
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MockTestAgent;

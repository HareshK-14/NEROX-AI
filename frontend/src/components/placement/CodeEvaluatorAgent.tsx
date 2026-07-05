import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Loader2, AlertTriangle, CheckCircle2, Lightbulb, Zap, RefreshCw } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';
import ProgressRing from '../ui/ProgressRing';

const LANGUAGES = ['Java', 'Python', 'JavaScript', 'C++', 'C', 'SQL'];

const SAMPLE_CODE: Record<string, string> = {
  Java: `public class Solution {
  public static int findMax(int[] arr) {
    int max = arr[0];
    for (int i = 0; i < arr.length; i++) {
      if (arr[i] > max)
        max = arr[i];
    }
    return max;
  }
}`,
  Python: `def find_max(arr):
  max_val = arr[0]
  for i in range(len(arr)):
    if arr[i] > max_val:
      max_val = arr[i]
  return max_val`,
  JavaScript: `function findMax(arr) {
  let max = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}`,
  'C++': `int findMax(int arr[], int n) {
    int max = arr[0];
    for(int i = 1; i < n; i++)
        if(arr[i] > max) max = arr[i];
    return max;
}`,
  C: `int findMax(int arr[], int n) {
    int max = arr[0];
    for(int i = 1; i < n; i++)
        if(arr[i] > max) max = arr[i];
    return max;
}`,
  SQL: `SELECT department_id, AVG(salary) as avg_salary
FROM employees
WHERE hire_date > '2020-01-01'
GROUP BY department_id
HAVING AVG(salary) > 50000
ORDER BY avg_salary DESC;`,
};

const scoreColor = (s: number) =>
  s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-rose-400';

const CodeEvaluatorAgent: React.FC = () => {
  const [language, setLanguage] = React.useState('Java');
  const [code, setCode] = React.useState(SAMPLE_CODE['Java']);
  const [context, setContext] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [activeView, setActiveView] = React.useState<'scores' | 'issues' | 'optimized' | 'practice'>('scores');

  const handleEvaluate = async () => {
    if (!code.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/placement/evaluate-code', { code, language, context });
      if (res.data.success) setResult(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const issueColor: Record<string, string> = {
    error:      'border-rose-500/40 bg-rose-500/8 text-rose-400',
    warning:    'border-amber-500/40 bg-amber-500/8 text-amber-400',
    suggestion: 'border-nerox-indigo/40 bg-nerox-indigo/8 text-nerox-indigo',
  };

  const scoreKeys = result?.scores
    ? Object.entries(result.scores as Record<string, number>)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Code Editor */}
      <div className="lg:col-span-2 space-y-3">
        <GlassCard className="p-5 space-y-4" hover={false}>
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block">Agent 4 — Coding Evaluator</span>
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => { setLanguage(l); setCode(SAMPLE_CODE[l] || ''); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border transition-all ${
                  language === l ? 'bg-nerox-indigo/30 border-nerox-indigo/60 text-nerox-indigo' : 'bg-white/4 border-white/8 text-gray-500 hover:text-white'
                }`}>{l}
              </button>
            ))}
          </div>

          {/* Code textarea styled like an editor */}
          <div className="rounded-xl overflow-hidden border border-white/8 bg-[#0a0a16]">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/3 border-b border-white/6">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-[10px] font-mono text-gray-600">solution.{language.toLowerCase()}</span>
            </div>
            <textarea
              rows={14}
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full bg-transparent text-[11px] font-mono text-gray-300 p-4 resize-none outline-none leading-relaxed"
              spellCheck={false}
              placeholder="// Paste your code here..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-gray-500">Problem Context (optional)</label>
            <input type="text" value={context} onChange={e => setContext(e.target.value)}
              className="input-glass text-xs" placeholder="e.g. Find max element in array" />
          </div>

          <button onClick={handleEvaluate} disabled={loading}
            className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Evaluating...</> : <><Code2 className="w-4 h-4" />Evaluate My Code</>}
          </button>
        </GlassCard>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-4">
        {!result && !loading && (
          <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[50vh] border-dashed text-center" hover={false}>
            <Code2 className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-400">Paste your code and click Evaluate</p>
            <p className="text-xs text-gray-600 mt-1">AI rates quality, logic, efficiency, style & suggests improvements</p>
          </GlassCard>
        )}

        {loading && (
          <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[50vh]" hover={false}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 mb-4" />
            <p className="text-xs font-mono text-gray-400 animate-pulse">Running deep code analysis...</p>
          </GlassCard>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score hero */}
            <GlassCard className="p-5" glow hover={false}>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <ProgressRing percentage={result.overall_score || 0} size={100} strokeWidth={8} label="Overall" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-black text-white font-grotesk">Code Quality Report</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      result.verdict === 'Excellent' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                      result.verdict === 'Good'      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' :
                      result.verdict === 'Needs Improvement' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
                                                               'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    }`}>{result.verdict}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 mb-3">
                    <span>⏱ Time: <strong className="text-white">{result.time_complexity}</strong></span>
                    <span>🗂 Space: <strong className="text-white">{result.space_complexity}</strong></span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{result.explanation}</p>
                </div>
              </div>
            </GlassCard>

            {/* Section tabs */}
            <div className="flex gap-2 flex-wrap">
              {(['scores','issues','optimized','practice'] as const).map(v => (
                <button key={v} onClick={() => setActiveView(v)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold cursor-pointer border transition-all ${
                    activeView === v ? 'bg-nerox-indigo/30 border-nerox-indigo/50 text-nerox-indigo' : 'bg-white/4 border-white/8 text-gray-500 hover:text-white'
                  }`}>{v}
                </button>
              ))}
            </div>

            {/* Scores breakdown */}
            {activeView === 'scores' && (
              <GlassCard className="p-5" hover={false}>
                <span className="text-xs font-bold text-white font-grotesk block mb-4">DIMENSION SCORES</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {scoreKeys.map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-white/4 border border-white/6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] capitalize text-gray-500">{key}</span>
                        <span className={`text-sm font-black ${scoreColor(val)}`}>{val}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-nerox-indigo to-nerox-cyan" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Issues */}
            {activeView === 'issues' && (
              <GlassCard className="p-5 space-y-3" hover={false}>
                <span className="text-xs font-bold text-white font-grotesk block">ISSUES & SUGGESTIONS</span>
                {(!result.issues || result.issues.length === 0)
                  ? <p className="text-xs text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />No major issues found. Code looks clean!</p>
                  : result.issues.map((issue: any, i: number) => (
                    <div key={i} className={`p-3 rounded-xl border text-xs space-y-1 ${issueColor[issue.type] || issueColor.suggestion}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold capitalize">{issue.type}</span>
                        {issue.line > 0 && <span className="text-[10px] opacity-70">Line {issue.line}</span>}
                      </div>
                      <p>{issue.description}</p>
                      {issue.fix && <p className="text-[10px] opacity-80 font-mono">Fix: {issue.fix}</p>}
                    </div>
                  ))}
              </GlassCard>
            )}

            {/* Optimized Code */}
            {activeView === 'optimized' && result.optimized_code && (
              <GlassCard className="p-0 overflow-hidden" hover={false}>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/3 border-b border-white/6">
                  <Zap className="w-3.5 h-3.5 text-nerox-indigo" />
                  <span className="text-xs font-bold text-white">OPTIMIZED VERSION</span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {result.optimized_code}
                </pre>
              </GlassCard>
            )}

            {/* Practice Questions */}
            {activeView === 'practice' && (
              <GlassCard className="p-5 space-y-3" hover={false}>
                <span className="text-xs font-bold text-white font-grotesk block">PRACTICE QUESTIONS</span>
                {(result.practice_questions || []).map((q: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-white/4 border border-white/6 space-y-1">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-nerox-gold" />
                      <span className="text-xs font-semibold text-white">{q.title}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${
                        q.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-400' :
                        q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'}`}>{q.difficulty}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{q.problem}</p>
                  </div>
                ))}
              </GlassCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CodeEvaluatorAgent;

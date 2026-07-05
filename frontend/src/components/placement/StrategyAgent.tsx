import React from 'react';
import { motion } from 'framer-motion';
import { Map, ChevronRight, Loader2, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';

const LEVELS = ['beginner','intermediate','advanced'];
const GOALS = [
  'Java Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Android Developer',
  'Frontend Developer',
  'Machine Learning Engineer',
  'Cloud Architect',
];
const PLAN_TABS = ['30 Days','60 Days','90 Days'] as const;

const StrategyAgent: React.FC = () => {
  const [goal, setGoal] = React.useState(GOALS[0]);
  const [customGoal, setCustomGoal] = React.useState('');
  const [level, setLevel] = React.useState('beginner');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [planTab, setPlanTab] = React.useState<typeof PLAN_TABS[number]>('30 Days');
  const [expandedWeek, setExpandedWeek] = React.useState<number | null>(0);

  const handleGenerate = async () => {
    setLoading(true); setData(null);
    try {
      const res = await api.post('/placement/strategy', {
        goal: customGoal.trim() || goal,
        currentLevel: level
      });
      if (res.data.success) setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const plan30 = data?.plan_30_day;
  const plan60 = data?.plan_60_day;
  const plan90 = data?.plan_90_day;
  const resources = data?.resources || [];

  const renderPlan30 = () => {
    if (!plan30) return null;
    return (
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-nerox-indigo/10 border border-nerox-indigo/25 text-xs text-nerox-indigo">
          🎯 {plan30.theme}: {plan30.overview}
        </div>
        <div className="space-y-2">
          {(plan30.weeks || []).map((w: any, i: number) => (
            <div key={i} className="rounded-xl border border-white/8 overflow-hidden">
              <button
                onClick={() => setExpandedWeek(expandedWeek === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/4 hover:bg-white/8 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-nerox-indigo/20 border border-nerox-indigo/40 flex items-center justify-center text-nerox-indigo text-xs font-bold">W{w.week}</div>
                  <div>
                    <p className="text-xs font-semibold text-white">{w.theme || w.focus}</p>
                    <p className="text-[10px] text-gray-500">{w.milestone}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${expandedWeek === i ? 'rotate-90' : ''}`} />
              </button>
              {expandedWeek === i && (
                <div className="p-4 space-y-3 border-t border-white/6">
                  {w.focus_areas?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {w.focus_areas.map((f: string, j: number) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-nerox-indigo/15 text-nerox-indigo border border-nerox-indigo/25">{f}</span>
                      ))}
                    </div>
                  )}
                  {w.daily_tasks?.slice(0, 5).map((task: any, j: number) => (
                    <div key={j} className="grid grid-cols-4 gap-2 text-[10px] text-gray-400 p-2 rounded-lg bg-white/3 border border-white/4">
                      <span className="text-white font-bold">{task.day}</span>
                      <span>{task.morning}</span>
                      <span>{task.afternoon}</span>
                      <span>{task.evening}</span>
                    </div>
                  ))}
                  {w.resources?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {w.resources.map((r: string, j: number) => (
                        <span key={j} className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-nerox-cyan border border-cyan-500/20">📚 {r}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlanPhased = (plan: any) => {
    if (!plan) return null;
    return (
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-nerox-indigo/10 border border-nerox-indigo/25 text-xs text-nerox-indigo">🗓 {plan.theme}</div>
        {(plan.phases || plan.weeks || []).map((p: any, i: number) => (
          <div key={i} className="p-4 rounded-xl bg-white/4 border border-white/8 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-nerox-violet/30 border border-nerox-violet/50 text-[10px] text-nerox-violet font-bold flex items-center justify-center">{p.phase || i+1}</div>
              <span className="text-xs font-semibold text-white">{p.focus}</span>
              <span className="ml-auto text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{p.duration_weeks}w</span>
            </div>
            {(p.goals || p.tasks || []).slice(0, 4).map((t: string, j: number) => (
              <div key={j} className="flex items-start gap-2 text-[11px] text-gray-400">
                <CheckCircle2 className="w-3 h-3 text-nerox-violet mt-0.5 shrink-0" />{t}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Config */}
      <GlassCard className="p-5 space-y-4 lg:col-span-1" hover={false}>
        <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Agent 7 — Strategy Planner</span>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono text-gray-500">Target Career Goal</label>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {GOALS.map(g => (
              <button key={g} onClick={() => { setGoal(g); setCustomGoal(''); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs border cursor-pointer transition-all ${
                  goal === g && !customGoal ? 'bg-sky-500/20 border-sky-500/50 text-white' : 'bg-white/4 border-white/6 text-gray-400 hover:text-white'
                }`}>{g}
              </button>
            ))}
          </div>
          <input type="text" value={customGoal} onChange={e => setCustomGoal(e.target.value)}
            className="input-glass text-xs" placeholder="Or type a custom goal..." />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono text-gray-500">Current Level</label>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase cursor-pointer border transition-all ${
                  level === l ? 'bg-sky-500/20 border-sky-500/50 text-sky-300' : 'bg-white/4 border-white/6 text-gray-500 hover:text-white'
                }`}>{l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading}
          className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Building Roadmap...</> : <><Map className="w-4 h-4" />Generate Strategy</>}
        </button>
      </GlassCard>

      {/* Plan display */}
      <div className="lg:col-span-2 space-y-4">
        {!data && !loading && (
          <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[50vh] border-dashed text-center" hover={false}>
            <Map className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-400">Set your goal and generate a strategy</p>
            <p className="text-xs text-gray-600 mt-1">Get personalized 30/60/90-day preparation roadmaps</p>
          </GlassCard>
        )}

        {loading && (
          <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[50vh]" hover={false}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 rounded-full border-2 border-sky-500/20 border-t-sky-500 mb-4" />
            <p className="text-xs font-mono text-gray-400 animate-pulse">Crafting your personalized roadmap...</p>
          </GlassCard>
        )}

        {data && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3 mb-2">
                <Map className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-black text-white font-grotesk">{data.goal}</h3>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                <span>Level: <strong className="text-sky-400">{data.current_level}</strong></span>
                <span>Daily: <strong className="text-sky-400">{data.daily_commitment_hours}h</strong></span>
                {(data.target_companies || []).length > 0 && <span>Targets: <strong className="text-sky-400">{data.target_companies.join(', ')}</strong></span>}
              </div>
            </GlassCard>

            {/* Plan tabs */}
            <div className="flex gap-2">
              {PLAN_TABS.map(t => (
                <button key={t} onClick={() => setPlanTab(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                    planTab === t ? 'bg-sky-500/20 border-sky-500/50 text-sky-300' : 'bg-white/4 border-white/6 text-gray-400 hover:text-white'
                  }`}>{t}
                </button>
              ))}
            </div>

            <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-4">
              {planTab === '30 Days' && renderPlan30()}
              {planTab === '60 Days' && renderPlanPhased(plan60)}
              {planTab === '90 Days' && renderPlanPhased(plan90)}
            </div>

            {resources.length > 0 && (
              <GlassCard className="p-4 space-y-2" hover={false}>
                <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-sky-400" /><span className="text-xs font-bold text-white font-grotesk">MUST-USE RESOURCES</span></div>
                <div className="space-y-1.5">
                  {resources.map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/4 border border-white/6 text-xs">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.priority === 'must' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'}`}>{r.priority}</span>
                      <span className="text-gray-300 flex-1">{r.name}</span>
                      <span className="text-[10px] text-gray-600">{r.type}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StrategyAgent;

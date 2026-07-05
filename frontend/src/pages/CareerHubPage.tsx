import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, GitBranch, Loader2, ChevronRight, TrendingUp,
  Award, ExternalLink, BookOpen, Briefcase, Target, Clock, Zap
} from 'lucide-react';
import api from '../api';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend
} from 'recharts';

// ─── Career Advisor ───────────────────────────────────────────────────────────
const CareerAdvisorPanel: React.FC = () => {
  const [interests, setInterests] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [activePathIdx, setActivePathIdx] = React.useState(0);

  const demandColor: Record<string, string> = {
    high:   'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    medium: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    low:    'text-rose-400 bg-rose-500/15 border-rose-500/30',
  };

  const handleAdvise = async () => {
    setLoading(true); setData(null);
    try {
      const res = await api.post('/career/advise', { interests });
      if (res.data.success) setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const paths = data?.recommended_paths || [];
  const activePath = paths[activePathIdx] || {};

  return (
    <div className="space-y-5">
      <GlassCard className="p-5 space-y-4" hover={false}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-500/20 to-purple-600/20 border border-violet-500/30">
            <Compass className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-grotesk">Career Advisor Agent</h3>
            <p className="text-[10px] text-gray-500">AI-curated career paths, certifications & market insights</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={interests}
            onChange={e => setInterests(e.target.value)}
            className="input-glass flex-1 text-xs"
            placeholder="e.g. backend, machine learning, cloud, mobile..."
          />
          <button onClick={handleAdvise} disabled={loading}
            className="btn-primary px-5 py-2.5 text-xs flex items-center gap-2 shrink-0 cursor-pointer">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Get Advice'}
          </button>
        </div>
      </GlassCard>

      {loading && (
        <GlassCard className="p-12 flex flex-col items-center" hover={false}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 mb-4" />
          <p className="text-xs font-mono text-gray-400 animate-pulse">Consulting career intelligence database...</p>
        </GlassCard>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Market insight banner */}
          {data.market_insights && (
            <div className="px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/25 text-xs text-violet-300">
              📊 {data.market_insights}
            </div>
          )}

          {/* Career Path Tabs */}
          <GlassCard className="p-5 space-y-4" hover={false}>
            <span className="text-xs font-bold text-white font-grotesk block">RECOMMENDED CAREER PATHS</span>
            <div className="flex gap-2 flex-wrap">
              {paths.map((p: any, i: number) => (
                <button key={i} onClick={() => setActivePathIdx(i)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                    activePathIdx === i
                      ? 'bg-violet-500/25 border-violet-500/50 text-white'
                      : 'bg-white/4 border-white/8 text-gray-400 hover:text-white'
                  }`}>{p.title}
                </button>
              ))}
            </div>

            {activePath.title && (
              <motion.div key={activePathIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${demandColor[activePath.demand] || demandColor.medium}`}>
                    {activePath.demand?.toUpperCase()} DEMAND
                  </div>
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold border bg-cyan-500/15 text-nerox-cyan border-cyan-500/30">
                    {activePath.salary_range}
                  </div>
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    Growth: {activePath.growth}
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">{activePath.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono text-gray-500">Skills Required</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(activePath.skills_required || []).map((s: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono text-gray-500">Top Companies</span>
                    <div className="space-y-1">
                      {(activePath.top_companies || []).slice(0, 5).map((c: string, i: number) => (
                        <p key={i} className="text-[11px] text-gray-300">• {c}</p>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono text-gray-500">Key Certifications</span>
                    <div className="space-y-1">
                      {(activePath.certifications || []).slice(0, 4).map((c: string, i: number) => (
                        <p key={i} className="text-[11px] text-gray-300"><Award className="inline w-3 h-3 mr-1 text-nerox-gold" />{c}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </GlassCard>

          {/* Certifications */}
          {data.certifications?.length > 0 && (
            <GlassCard className="p-5 space-y-3" hover={false}>
              <span className="text-xs font-bold text-white font-grotesk">RECOMMENDED CERTIFICATIONS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.certifications.map((cert: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6">
                    <div className="p-2 rounded-lg bg-nerox-gold/15 border border-nerox-gold/30 shrink-0">
                      <Award className="w-4 h-4 text-nerox-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{cert.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-gray-500">{cert.provider} • {cert.duration}</p>
                        {cert.free && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">FREE</span>}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Trending tech + learning resources */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.trending_technologies?.length > 0 && (
              <GlassCard className="p-4 space-y-2" hover={false}>
                <div className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs font-bold text-white font-grotesk">TRENDING TECH</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {data.trending_technologies.map((t: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">{t}</span>
                  ))}
                </div>
              </GlassCard>
            )}
            {data.internship_sites?.length > 0 && (
              <GlassCard className="p-4 space-y-2" hover={false}>
                <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-nerox-cyan" /><span className="text-xs font-bold text-white font-grotesk">INTERNSHIP SITES</span></div>
                <div className="space-y-1.5">
                  {data.internship_sites.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <ExternalLink className="w-3 h-3 text-gray-600 shrink-0" />
                      <span className="text-gray-300">{s.name}</span>
                      <span className="text-[9px] text-gray-600 ml-auto">{s.type}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {data.personalized_tip && (
            <div className="px-4 py-3 rounded-xl bg-nerox-indigo/10 border border-nerox-indigo/25 text-xs text-nerox-indigo">
              💡 Personal Tip: {data.personalized_tip}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ─── Skill Gap Analyzer ────────────────────────────────────────────────────────
const SkillGapPanel: React.FC = () => {
  const [targetRole, setTargetRole] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [activePhase, setActivePhase] = React.useState(0);

  const ROLES = ['Java Backend Developer','Full Stack Developer','Data Scientist','Cloud Architect','DevOps Engineer','Android Developer','ML Engineer'];

  const gapColor: Record<string, string> = {
    large:  'text-rose-400 bg-rose-500/15 border-rose-500/30',
    medium: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    small:  'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
    none:   'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim()) return;
    setLoading(true); setData(null);
    try {
      const res = await api.post('/career/skill-gap', { targetRole: targetRole.trim() });
      if (res.data.success) setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const radarData = (data?.gap_analysis || []).slice(0, 8).map((g: any) => ({
    skill: g.skill,
    Current: g.current_level === 'none' ? 0 : g.current_level === 'beginner' ? 25 : g.current_level === 'intermediate' ? 60 : g.current_level === 'advanced' ? 85 : 100,
    Required: g.required_level === 'beginner' ? 25 : g.required_level === 'intermediate' ? 60 : g.required_level === 'advanced' ? 85 : 100,
  }));

  return (
    <div className="space-y-5">
      <GlassCard className="p-5 space-y-4" hover={false}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
            <GitBranch className="w-5 h-5 text-nerox-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-grotesk">Skill Gap Analyzer Agent</h3>
            <p className="text-[10px] text-gray-500">Compare your current skills vs. target role requirements</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono text-gray-500">Target Role</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map(r => (
              <button key={r} onClick={() => setTargetRole(r)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold cursor-pointer border transition-all ${
                  targetRole === r ? 'bg-nerox-cyan/20 border-nerox-cyan/50 text-white' : 'bg-white/4 border-white/8 text-gray-400 hover:text-white'
                }`}>{r}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
              className="input-glass flex-1 text-xs" placeholder="Or type a custom role..." />
            <button onClick={handleAnalyze} disabled={loading || !targetRole.trim()}
              className="btn-primary px-5 py-2.5 text-xs flex items-center gap-2 shrink-0 cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Analyze Gap'}
            </button>
          </div>
        </div>
      </GlassCard>

      {loading && (
        <GlassCard className="p-12 flex flex-col items-center" hover={false}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 mb-4" />
          <p className="text-xs font-mono text-gray-400 animate-pulse">Running skill gap analysis...</p>
        </GlassCard>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Match % + summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard className="p-4 text-center" glow hover={false}>
              <div className="text-4xl font-black font-grotesk text-nerox-cyan">{data.match_percentage}%</div>
              <div className="text-[10px] text-gray-500 uppercase font-mono mt-1">Skill Match</div>
            </GlassCard>
            <GlassCard className="p-4 text-center" hover={false}>
              <div className="text-4xl font-black font-grotesk text-amber-400">{data.estimated_weeks_to_ready}</div>
              <div className="text-[10px] text-gray-500 uppercase font-mono mt-1">Weeks to Ready</div>
            </GlassCard>
            <GlassCard className="p-4 text-center" hover={false}>
              <div className="text-sm font-black font-grotesk text-white">{data.salary_after_ready}</div>
              <div className="text-[10px] text-gray-500 uppercase font-mono mt-1">Expected Salary</div>
            </GlassCard>
          </div>

          {/* Radar chart */}
          {radarData.length > 0 && (
            <GlassCard className="p-5" hover={false}>
              <span className="text-xs font-bold text-white font-grotesk block mb-4">SKILL COMPARISON RADAR</span>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <Radar name="Your Level" dataKey="Current" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                  <Radar name="Required" dataKey="Required" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: '10px', color: '#9ca3af' }} />
                </RadarChart>
              </ResponsiveContainer>
            </GlassCard>
          )}

          {/* Gap analysis table */}
          <GlassCard className="p-5 space-y-3" hover={false}>
            <span className="text-xs font-bold text-white font-grotesk">SKILL GAP BREAKDOWN</span>
            <div className="space-y-2">
              {(data.gap_analysis || []).map((g: any, i: number) => (
                <div key={i} className="grid grid-cols-4 gap-3 items-center p-2.5 rounded-xl bg-white/4 border border-white/6 text-xs">
                  <span className="text-gray-300 font-medium">{g.skill}</span>
                  <span className="text-gray-500 capitalize">{g.current_level}</span>
                  <span className="text-white capitalize font-semibold">{g.required_level}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${gapColor[g.gap_size] || gapColor.medium}`}>{g.gap_size}</span>
                    {g.estimated_weeks > 0 && <span className="text-[10px] text-gray-600">{g.estimated_weeks}w</span>}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Roadmap phases */}
          {(data.roadmap || []).length > 0 && (
            <GlassCard className="p-5 space-y-4" hover={false}>
              <span className="text-xs font-bold text-white font-grotesk">LEARNING ROADMAP</span>
              <div className="flex gap-2 flex-wrap mb-2">
                {data.roadmap.map((_: any, i: number) => (
                  <button key={i} onClick={() => setActivePhase(i)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border transition-all ${
                      activePhase === i ? 'bg-nerox-cyan/20 border-nerox-cyan/50 text-nerox-cyan' : 'bg-white/4 border-white/8 text-gray-500 hover:text-white'
                    }`}>Phase {i+1}
                  </button>
                ))}
              </div>
              {data.roadmap[activePhase] && (
                <motion.div key={activePhase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {(() => {
                    const phase = data.roadmap[activePhase];
                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-nerox-cyan">{phase.focus}</span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{phase.duration_weeks} weeks</span>
                          {phase.milestone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-nerox-indigo/20 text-nerox-indigo border border-nerox-indigo/30 ml-auto">{phase.milestone}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(phase.skills_to_learn || phase.topics || []).map((s: string, i: number) => (
                            <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-gray-300">{s}</span>
                          ))}
                        </div>
                        {(phase.resources || []).length > 0 && (
                          <div className="space-y-1.5">
                            {phase.resources.slice(0, 4).map((r: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-[11px] text-gray-400 p-2 rounded-lg bg-white/3 border border-white/4">
                                <BookOpen className="w-3 h-3 text-nerox-cyan shrink-0" />
                                <span>{typeof r === 'string' ? r : r.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </GlassCard>
          )}

          {/* Quick wins */}
          {data.quick_wins?.length > 0 && (
            <GlassCard className="p-4 space-y-2" hover={false}>
              <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-nerox-gold" /><span className="text-xs font-bold text-white font-grotesk">QUICK WINS</span></div>
              <div className="flex flex-wrap gap-1.5">
                {data.quick_wins.map((w: string, i: number) => (
                  <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-nerox-gold/15 text-nerox-gold border border-nerox-gold/30">{w}</span>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ─── Main Career Hub Page ─────────────────────────────────────────────────────
const CareerHubPage: React.FC = () => {
  const [activeAgent, setActiveAgent] = React.useState<'advisor' | 'skillgap'>('advisor');

  return (
    <PageWrapper>
      <div className="space-y-5">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-[#0e0e1e] to-[#07070f] p-6">
          <div className="absolute top-0 right-0 w-56 h-32 rounded-full bg-violet-500/12 blur-[50px] pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 border border-white/15 shadow-[0_0_24px_rgba(139,92,246,0.4)]">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black font-grotesk text-white">Career Intelligence Hub</h1>
              <p className="text-xs text-gray-400">AI-powered career advisor & skill gap analyzer</p>
            </div>
          </div>
        </div>

        {/* Agent switcher */}
        <div className="flex gap-3 p-1 bg-white/4 border border-white/8 rounded-2xl">
          <button onClick={() => setActiveAgent('advisor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-grotesk cursor-pointer transition-all ${
              activeAgent === 'advisor' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}>
            <Compass className="w-4 h-4" />Career Advisor Agent
          </button>
          <button onClick={() => setActiveAgent('skillgap')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-grotesk cursor-pointer transition-all ${
              activeAgent === 'skillgap' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}>
            <GitBranch className="w-4 h-4" />Skill Gap Analyzer Agent
          </button>
        </div>

        {/* Active agent */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAgent}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeAgent === 'advisor' ? <CareerAdvisorPanel /> : <SkillGapPanel />}
          </motion.div>
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
};

export default CareerHubPage;

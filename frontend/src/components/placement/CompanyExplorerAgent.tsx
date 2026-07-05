import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Star, Code2, Database, MessageSquare, BookOpen, Loader2, ExternalLink } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';

const COMPANIES = ['TCS','Infosys','Wipro','Cognizant','Capgemini','Accenture','Zoho','Amazon','Microsoft','Google'];

const difficultyColor: Record<string, string> = {
  Easy:   'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  Medium: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  Hard:   'text-rose-400 bg-rose-500/15 border-rose-500/30',
};

const CompanyExplorerAgent: React.FC = () => {
  const [company, setCompany] = React.useState('Zoho');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [activeSection, setActiveSection] = React.useState('overview');

  const handleExplore = async () => {
    setLoading(true); setData(null);
    try {
      const res = await api.post('/placement/company', { company });
      if (res.data.success) setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const sections = ['overview', 'process', 'topics', 'tips', 'resources'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* Sidebar */}
      <GlassCard className="p-5 space-y-4 lg:col-span-1" hover={false}>
        <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block">Agent 2 — Company Explorer</span>
        <div className="space-y-1.5">
          {COMPANIES.map(c => (
            <button
              key={c}
              onClick={() => setCompany(c)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                company === c
                  ? 'bg-gradient-to-r from-nerox-violet/40 to-nerox-indigo/40 border-nerox-violet/50 text-white'
                  : 'bg-white/3 border-transparent text-gray-400 hover:text-white hover:bg-white/6'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button onClick={handleExplore} disabled={loading} className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Loading...</> : <><Briefcase className="w-4 h-4" />Explore</>}
        </button>
      </GlassCard>

      {/* Content */}
      <div className="lg:col-span-3 space-y-4">
        {!data && !loading && (
          <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[50vh] border-dashed text-center" hover={false}>
            <Briefcase className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-400">Select a company and click Explore</p>
            <p className="text-xs text-gray-600 mt-1">Get insider interview patterns, salary data, and preparation tips</p>
          </GlassCard>
        )}

        {loading && (
          <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[50vh]" hover={false}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 rounded-full border-2 border-nerox-violet/20 border-t-nerox-violet mb-4" />
            <p className="text-xs font-mono text-gray-400 animate-pulse">Fetching {company} intelligence profile...</p>
          </GlassCard>
        )}

        {data && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Header card */}
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-black font-grotesk text-white">{data.company}</h2>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${difficultyColor[data.difficulty] || difficultyColor.Medium}`}>
                      {data.difficulty} Difficulty
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{data.tagline}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>📍 {data.headquarters}</span>
                    <span>👥 {data.employees}</span>
                    <span>🏢 {data.type}</span>
                    <span>📅 Est. {data.founded}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">Avg. Package</div>
                  <div className="text-lg font-black text-nerox-cyan font-grotesk">{data.package?.average}</div>
                  <div className="text-[10px] text-gray-500">{data.package?.min} – {data.package?.max}</div>
                </div>
              </div>
              {data.insider_tip && (
                <div className="mt-4 p-3 rounded-xl bg-nerox-indigo/10 border border-nerox-indigo/25 text-xs text-nerox-indigo">
                  💡 <strong>Insider Tip:</strong> {data.insider_tip}
                </div>
              )}
            </GlassCard>

            {/* Section tabs */}
            <div className="flex gap-2 flex-wrap">
              {sections.map(s => (
                <button key={s} onClick={() => setActiveSection(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold cursor-pointer transition-all border ${
                    activeSection === s ? 'bg-nerox-indigo/30 border-nerox-indigo/50 text-nerox-indigo' : 'bg-white/4 border-white/8 text-gray-500 hover:text-white'
                  }`}>{s}</button>
              ))}
            </div>

            {/* Selection Process */}
            {activeSection === 'process' && (
              <GlassCard className="p-5" hover={false}>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-nerox-cyan" />
                  <span className="text-xs font-bold text-white font-grotesk">SELECTION PROCESS</span>
                </div>
                <div className="space-y-3">
                  {(data.selection_process || []).map((round: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-nerox-indigo to-nerox-violet flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {round.round || i+1}
                      </div>
                      <div className="flex-1 p-3 rounded-xl bg-white/4 border border-white/6">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white">{round.name}</span>
                          <span className="text-[10px] text-gray-500">{round.duration}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{round.description}</p>
                        {round.tips && <p className="text-[10px] text-nerox-indigo mt-1.5">💡 {round.tips}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Overview */}
            {activeSection === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCard className="p-4" hover={false}>
                  <div className="flex items-center gap-2 mb-3"><Code2 className="w-3.5 h-3.5 text-nerox-indigo" /><span className="text-[10px] font-bold text-white uppercase font-mono">Coding Topics</span></div>
                  <div className="flex flex-wrap gap-1.5">{(data.coding_topics || []).map((t: string) => (<span key={t} className="px-2 py-1 rounded-lg bg-nerox-indigo/15 text-nerox-indigo text-[10px] font-semibold border border-nerox-indigo/25">{t}</span>))}</div>
                </GlassCard>
                <GlassCard className="p-4" hover={false}>
                  <div className="flex items-center gap-2 mb-3"><Database className="w-3.5 h-3.5 text-nerox-cyan" /><span className="text-[10px] font-bold text-white uppercase font-mono">SQL Topics</span></div>
                  <div className="flex flex-wrap gap-1.5">{(data.sql_topics || []).map((t: string) => (<span key={t} className="px-2 py-1 rounded-lg bg-cyan-500/15 text-nerox-cyan text-[10px] font-semibold border border-cyan-500/25">{t}</span>))}</div>
                </GlassCard>
                <GlassCard className="p-4" hover={false}>
                  <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-3.5 h-3.5 text-nerox-violet" /><span className="text-[10px] font-bold text-white uppercase font-mono">Eligibility</span></div>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex justify-between"><span>Min CGPA</span><span className="text-white font-semibold">{data.eligibility?.cgpa}</span></div>
                    <div className="flex justify-between"><span>Backlogs</span><span className="text-white font-semibold">{data.eligibility?.backlogs || 'None'}</span></div>
                    <div className="flex justify-between"><span>Branches</span><span className="text-white font-semibold">{(data.eligibility?.branches || []).join(', ')}</span></div>
                  </div>
                </GlassCard>
                <GlassCard className="p-4" hover={false}>
                  <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-3.5 h-3.5 text-amber-400" /><span className="text-[10px] font-bold text-white uppercase font-mono">Frequent HR Qs</span></div>
                  <div className="space-y-1">{(data.hr_questions || []).slice(0,4).map((q: string, i: number) => (<p key={i} className="text-[10px] text-gray-400">• {q}</p>))}</div>
                </GlassCard>
              </div>
            )}

            {/* Tips */}
            {activeSection === 'tips' && (
              <GlassCard className="p-5" hover={false}>
                <span className="text-xs font-bold text-white font-grotesk block mb-4">PREPARATION TIPS</span>
                <div className="space-y-2">{(data.preparation_tips || []).map((t: string, i: number) => (
                  <div key={i} className="flex gap-2 p-3 rounded-xl bg-white/4 border border-white/6 text-xs text-gray-300">
                    <span className="text-nerox-indigo font-bold">{i+1}.</span>{t}
                  </div>
                ))}</div>
              </GlassCard>
            )}

            {/* Topics */}
            {activeSection === 'topics' && (
              <GlassCard className="p-5" hover={false}>
                <span className="text-xs font-bold text-white font-grotesk block mb-4">FREQUENTLY ASKED TOPICS</span>
                <div className="flex flex-wrap gap-2">{(data.frequently_asked || []).map((t: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">{t}</span>
                ))}</div>
              </GlassCard>
            )}

            {/* Resources */}
            {activeSection === 'resources' && (
              <GlassCard className="p-5" hover={false}>
                <div className="flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4 text-nerox-violet" /><span className="text-xs font-bold text-white font-grotesk">RECOMMENDED RESOURCES</span></div>
                <div className="space-y-2">{(data.resources || []).map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6 hover:bg-white/8 transition-all cursor-pointer">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nerox-indigo/20 text-nerox-indigo border border-nerox-indigo/30">{r.type}</span>
                    <span className="text-xs text-gray-300 flex-1">{r.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                ))}</div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompanyExplorerAgent;

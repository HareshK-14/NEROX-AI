import React from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle2, Clock, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';
import ProgressRing from '../ui/ProgressRing';

const COMPANIES = [
  { name: 'TCS',        logo: '🔵', type: 'Service' },
  { name: 'Infosys',    logo: '🟢', type: 'Service' },
  { name: 'Wipro',      logo: '🟡', type: 'Service' },
  { name: 'Cognizant',  logo: '🔷', type: 'Service' },
  { name: 'Capgemini',  logo: '🔶', type: 'Service' },
  { name: 'Accenture',  logo: '🟣', type: 'Service' },
  { name: 'Zoho',       logo: '🔴', type: 'Product' },
  { name: 'Amazon',     logo: '🟠', type: 'Product' },
  { name: 'Microsoft',  logo: '⬜', type: 'Product' },
  { name: 'Google',     logo: '🌈', type: 'Product' },
];

const ReadinessAgent: React.FC = () => {
  const [company, setCompany] = React.useState('TCS');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  const handleCheck = async () => {
    setLoading(true);
    setData(null);
    try {
      const res = await api.post('/placement/readiness', { company });
      if (res.data.success) setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const bandColor: Record<string, string> = {
    'Not Ready': 'text-rose-400',
    'Developing': 'text-amber-400',
    'Almost Ready': 'text-yellow-400',
    'Ready': 'text-emerald-400',
    'Highly Ready': 'text-cyan-400',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Company selector */}
      <GlassCard className="p-5 space-y-4 lg:col-span-1" hover={false}>
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block mb-3">Agent 1 — Company Readiness</span>
          <p className="text-xs text-gray-400 leading-relaxed">AI evaluates your complete profile against company-specific hiring requirements.</p>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Select Target Company</label>
          <div className="grid grid-cols-2 gap-2">
            {COMPANIES.map(c => (
              <button
                key={c.name}
                onClick={() => setCompany(c.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all cursor-pointer text-left ${
                  company === c.name
                    ? 'bg-gradient-to-r from-nerox-indigo/40 to-nerox-violet/40 border-nerox-indigo/60 text-white'
                    : 'bg-white/4 border-white/8 text-gray-400 hover:text-white'
                }`}
              >
                <span>{c.logo}</span>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-[9px] opacity-60">{c.type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-3 cursor-pointer"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Profile...</> : <><Target className="w-4 h-4" /> Check Readiness Score</>}
        </button>
      </GlassCard>

      {/* Results */}
      <div className="lg:col-span-2 space-y-4">
        {!data && !loading && (
          <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[50vh] border-dashed text-center" hover={false}>
            <Target className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-400">Select a company and click "Check Readiness Score"</p>
            <p className="text-xs text-gray-600 mt-1">AI will evaluate your complete placement profile</p>
          </GlassCard>
        )}

        {loading && (
          <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[50vh]" hover={false}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-2 border-nerox-indigo/20 border-t-nerox-indigo mb-4"
            />
            <p className="text-xs font-mono text-gray-400 animate-pulse">Analyzing your profile against {company} requirements...</p>
          </GlassCard>
        )}

        {data && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score hero card */}
            <GlassCard className="p-6" glow hover={false}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ProgressRing percentage={data.readiness_percentage || data.overall_score} size={120} strokeWidth={10} label="Readiness" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black font-grotesk text-white">{company} Readiness Report</h3>
                    <span className={`text-sm font-bold ${bandColor[data.readiness_band] || 'text-gray-400'}`}>{data.readiness_band}</span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated {data.estimated_days_to_ready} days to be fully placement-ready
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.strong_areas?.slice(0, 3).map((s: string) => (
                      <span key={s} className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">✓ {s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Category scores */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(data.category_scores || {}).map(([key, val]: [string, any]) => (
                <GlassCard key={key} className="p-4" hover={false}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-mono text-gray-500">{key}</span>
                    <span className="text-sm font-black font-grotesk text-white">{val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-nerox-indigo to-nerox-cyan"
                    />
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Missing skills */}
            {data.missing_skills?.length > 0 && (
              <GlassCard className="p-5" hover={false}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white font-grotesk">MISSING SKILLS</span>
                </div>
                <div className="space-y-2">
                  {data.missing_skills.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/4 border border-white/6">
                      <span className="text-xs text-white font-medium">{s.skill || s}</span>
                      <div className="flex items-center gap-2">
                        {s.estimated_days && <span className="text-[10px] text-gray-500">{s.estimated_days}d</span>}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          s.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                          s.priority === 'high'     ? 'bg-amber-500/20 text-amber-400' :
                                                      'bg-gray-500/20 text-gray-400'
                        }`}>{s.priority || 'medium'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Preparation plan */}
            {data.preparation_plan && (
              <GlassCard className="p-5" hover={false}>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-nerox-indigo" />
                  <span className="text-xs font-bold text-white font-grotesk">PERSONALIZED PREPARATION PLAN</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {['immediate', 'short_term', 'long_term'].map(phase => (
                    <div key={phase} className="space-y-2">
                      <span className="text-[10px] uppercase font-mono text-gray-500">{phase.replace('_', ' ')}</span>
                      {(data.preparation_plan[phase] || []).map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-gray-300">
                          <CheckCircle2 className="w-3 h-3 text-nerox-indigo mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
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

export default ReadinessAgent;

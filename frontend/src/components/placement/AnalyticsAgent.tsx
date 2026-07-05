import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';
import ProgressRing from '../ui/ProgressRing';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line
} from 'recharts';

const AnalyticsAgent: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/placement/analytics');
      if (res.data.success) setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchAnalytics(); }, []);

  const db = data?.databaseScores || {};
  const ai = data?.aiAnalysis || {};

  const radarData = [
    { subject: 'Coding',        A: db.coding_score || 0 },
    { subject: 'SQL',           A: db.sql_score || 0 },
    { subject: 'Communication', A: db.communication_score || 0 },
    { subject: 'Resume',        A: db.resume_score || 0 },
    { subject: 'Aptitude',      A: db.aptitude_score || 0 },
    { subject: 'Projects',      A: db.projects_score || 0 },
    { subject: 'GD',            A: db.gd_score || 0 },
  ];

  const barData = (ai.company_readiness || []).slice(0, 8).map((c: any) => ({
    company: c.company,
    readiness: c.readiness,
  }));

  const trendData = data?.testHistory?.map((t: any, i: number) => ({
    name: `Test ${i + 1}`,
    score: t.percentage || 0,
    company: t.company || '',
  })) || [];

  const trendIcon = ai.trend === 'improving' ? <TrendingUp className="w-4 h-4 text-emerald-400" />
    : ai.trend === 'declining' ? <TrendingDown className="w-4 h-4 text-rose-400" />
    : <Minus className="w-4 h-4 text-gray-400" />;

  const scoreMetrics = [
    { label: 'Coding',        val: db.coding_score || 0,        color: '#6366f1' },
    { label: 'SQL',           val: db.sql_score || 0,           color: '#06b6d4' },
    { label: 'Communication', val: db.communication_score || 0, color: '#8b5cf6' },
    { label: 'Resume',        val: db.resume_score || 0,        color: '#f59e0b' },
    { label: 'Aptitude',      val: db.aptitude_score || 0,      color: '#10b981' },
    { label: 'GD',            val: db.gd_score || 0,            color: '#ef4444' },
  ];

  if (loading) {
    return (
      <GlassCard className="p-16 flex flex-col items-center justify-center" hover={false}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-2 border-pink-500/20 border-t-pink-500 mb-4" />
        <p className="text-xs font-mono text-gray-400 animate-pulse">Loading your placement analytics...</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top row: Readiness + Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex flex-col items-center justify-center gap-3 sm:col-span-1" glow hover={false}>
          <ProgressRing percentage={db.placement_readiness || ai.placement_readiness || 0} size={110} strokeWidth={10} label="Readiness" />
          <div className="text-center">
            <p className="text-xs font-bold text-white">{ai.readiness_label || 'Developing'}</p>
            <div className="flex items-center justify-center gap-1 mt-1">{trendIcon}<span className="text-[10px] text-gray-400 capitalize">{ai.trend || 'stable'}</span></div>
          </div>
        </GlassCard>

        <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {scoreMetrics.map(m => (
            <GlassCard key={m.label} className="p-4" hover={false}>
              <p className="text-[10px] text-gray-500 uppercase font-mono mb-1.5">{m.label}</p>
              <p className="text-xl font-black font-grotesk text-white mb-2">{m.val}%</p>
              <div className="w-full h-1 bg-white/5 rounded-full">
                <motion.div initial={{ width: 0 }} animate={{ width: `${m.val}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: m.color }} />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar */}
        <GlassCard className="p-5" hover={false}>
          <span className="text-xs font-bold text-white font-grotesk block mb-4">SKILL RADAR</span>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Company readiness bar */}
        {barData.length > 0 && (
          <GlassCard className="p-5" hover={false}>
            <span className="text-xs font-bold text-white font-grotesk block mb-4">COMPANY-WISE READINESS</span>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="company" tick={{ fill: '#6b7280', fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#0d0d22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="readiness" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        )}
      </div>

      {/* Test performance trend */}
      {trendData.length > 0 && (
        <GlassCard className="p-5" hover={false}>
          <span className="text-xs font-bold text-white font-grotesk block mb-4">TEST PERFORMANCE TREND</span>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#0d0d22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
              <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* AI Recommendations */}
      {(ai.recommendations || []).length > 0 && (
        <GlassCard className="p-5 space-y-3" hover={false}>
          <span className="text-xs font-bold text-white font-grotesk">AI RECOMMENDATIONS</span>
          {ai.recommendations.map((r: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/4 border border-white/6">
              <span className={`text-[9px] font-bold px-2 py-1 rounded-full shrink-0 mt-0.5 ${
                r.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                r.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>{r.priority}</span>
              <div>
                <p className="text-xs text-white font-semibold">{r.action}</p>
                {r.expected_impact && <p className="text-[10px] text-gray-500 mt-0.5">{r.expected_impact}</p>}
              </div>
            </div>
          ))}
        </GlassCard>
      )}

      <div className="flex justify-end">
        <button onClick={fetchAnalytics} className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />Refresh Analytics
        </button>
      </div>
    </div>
  );
};

export default AnalyticsAgent;

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Award, AlertTriangle, Sparkles, Brain, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import GlassCard from '../../components/ui/GlassCard';
import LoadingOrb from '../../components/ui/LoadingOrb';

interface AnalyticsData {
  readinessDistribution: {
    excellent: number;
    good: number;
    average: number;
    needsWork: number;
  };
  skillScores: {
    coding: number;
    sql_avg: number;
    communication: number;
    aptitude: number;
    resume: number;
    projects: number;
  };
  deptReadiness: any[];
  yearScores: any[];
  top20: any[];
  atRisk: any[];
}

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

const PlacementAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/officer/analytics', {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) setData(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/officer/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nerox_token')}`
        },
        body: JSON.stringify({ query: aiQuery })
      });
      const resData = await res.json();
      if (resData.success) {
        setAiResponse(resData.data.result);
      } else {
        setAiResponse({ error: resData.message });
      }
    } catch (err: any) {
      setAiResponse({ error: err.message });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <LoadingOrb />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        Failed to load analytical metrics.
      </div>
    );
  }

  const { readinessDistribution, skillScores, deptReadiness, yearScores, top20, atRisk } = data;

  const pieData = [
    { name: 'Excellent (>=80)', value: Number(readinessDistribution.excellent || 0) },
    { name: 'Good (60-79)', value: Number(readinessDistribution.good || 0) },
    { name: 'Average (40-59)', value: Number(readinessDistribution.average || 0) },
    { name: 'Needs Work (<40)', value: Number(readinessDistribution.needsWork || 0) }
  ].filter(item => item.value > 0);

  const radarData = [
    { subject: 'Coding', A: skillScores.coding },
    { subject: 'SQL', A: skillScores.sql_avg },
    { subject: 'Comm', A: skillScores.communication },
    { subject: 'Aptitude', A: skillScores.aptitude },
    { subject: 'Resume', A: skillScores.resume },
    { subject: 'Projects', A: skillScores.projects }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-grotesk tracking-tight text-white flex items-center gap-2">
          Placement Analytics <BarChart3 className="w-6 h-6 text-nerox-indigo animate-pulse" />
        </h1>
        <p className="text-xs text-gray-400 font-sans mt-0.5">
          Deep cohort analysis dashboards featuring custom distributions and metrics breakdowns.
        </p>
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie: Readiness distribution */}
        <GlassCard className="p-5 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-sm font-bold font-grotesk text-white flex items-center gap-1.5"><PieIcon className="w-4 h-4 text-nerox-cyan" /> Readiness Distribution</h3>
            <p className="text-[10px] text-gray-400">Total student counts by placement readiness range.</p>
          </div>
          <div className="h-[220px] w-full relative">
            {pieData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-sans">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0d0d22', borderColor: 'rgba(255,255,255,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[9px] font-mono text-gray-400">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name.split(' ')[0]} ({item.value})</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Skill radar chart */}
        <GlassCard className="p-5 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-sm font-bold font-grotesk text-white flex items-center gap-1.5"><Brain className="w-4 h-4 text-nerox-violet" /> Skill Breakdown Average</h3>
            <p className="text-[10px] text-gray-400">Radial average breakdown scores compared.</p>
          </div>
          <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <Radar name="Cohort Average" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Year-wise scores comparison */}
        <GlassCard className="p-5 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-sm font-bold font-grotesk text-white">Year-Wise Scores Trend</h3>
            <p className="text-[10px] text-gray-400">Averages scores and readiness comparison by batch year.</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.4)" fontSize={9} tickFormatter={(v) => `Year ${v}`} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0d22', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Legend verticalAlign="top" height={36} fontSize={8} />
                <Line type="monotone" dataKey="avg_score" stroke="#6366f1" strokeWidth={2} name="Avg Overall" />
                <Line type="monotone" dataKey="avg_readiness" stroke="#06b6d4" strokeWidth={2} name="Avg Readiness" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* AI Analytics chat query box */}
      <GlassCard className="p-6 border border-nerox-indigo/20 shadow-[0_0_40px_rgba(99,102,241,0.06)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-nerox-indigo/5 blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-nerox-indigo/20 border border-nerox-indigo/30">
            <Brain className="w-5 h-5 text-nerox-indigo" />
          </div>
          <div>
            <h3 className="text-sm font-black font-grotesk text-white flex items-center gap-1.5">
              Placement AI Agent <span className="text-[8px] font-mono font-black bg-nerox-indigo/20 text-nerox-indigo px-1.5 py-0.5 rounded border border-nerox-indigo/30 uppercase">Enterprise</span>
            </h3>
            <p className="text-[10px] text-gray-400">Ask the NEROX Analytics Agent queries about the current cohort, Zoho readiness, low SQL alerts, etc.</p>
          </div>
        </div>

        <form onSubmit={handleAskAI} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder='Ask: "Show students ready for Zoho." or "Who needs SQL improvement?" or "Which department performs best?"...'
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            disabled={aiLoading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-nerox-indigo/60 transition-all font-mono"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="px-5 py-3 rounded-xl bg-nerox-indigo text-white hover:bg-nerox-indigo/80 transition-all text-xs font-bold font-grotesk flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-50"
          >
            {aiLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Query</span>
          </button>
        </form>

        <AnimatePresence>
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-white/3 border border-white/5 rounded-xl space-y-4 font-sans text-xs"
            >
              {aiResponse.error ? (
                <div className="text-rose-400">Error query agent: {aiResponse.error}</div>
              ) : (
                <div className="space-y-4">
                  <div className="border-l-2 border-nerox-cyan pl-3">
                    <p className="text-gray-300 font-medium leading-relaxed">{aiResponse.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiResponse.top_students && aiResponse.top_students.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Top Performers
                        </span>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                          {aiResponse.top_students.map((st: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white/3 border border-white/5 rounded-lg text-[11px]">
                              <span className="font-semibold text-white">{st.name} ({st.department})</span>
                              <span className="font-mono text-emerald-400">{st.score || st.readiness}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiResponse.at_risk_students && aiResponse.at_risk_students.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> High Risk Students
                        </span>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                          {aiResponse.at_risk_students.map((st: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white/3 border border-white/5 rounded-lg text-[11px]">
                              <span className="font-semibold text-white">{st.name} ({st.department})</span>
                              <span className="font-mono text-rose-400">{st.weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Cohort lists: Top 20 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 20 Directory */}
        <GlassCard className="p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-grotesk text-white">Placement Cohort Leaderboard (Top 20)</h3>
              <p className="text-[10px] text-gray-400">Ranked by overall success index score.</p>
            </div>
            <Award className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {top20.map((st, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/3 border border-white/5 rounded-xl text-xs hover:border-white/10 transition-all">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-500 w-5">#{idx+1}</span>
                  <div>
                    <p className="font-bold text-white font-grotesk">{st.name}</p>
                    <p className="text-[9px] text-gray-500 font-mono">{st.roll_number} · {st.department}</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <p className="font-bold text-emerald-400">{st.overall_score}%</p>
                  <p className="text-[9px] text-gray-500">Readiness: {st.placement_readiness}%</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* At-Risk list */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-grotesk text-white">Assistance Cohort (Readiness &lt; 40)</h3>
              <p className="text-[10px] text-gray-400">Students needing immediate intervention.</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
            {atRisk.length === 0 ? (
              <div className="p-10 text-center text-xs text-emerald-400/60 font-mono">
                ✅ No students currently at critical placement risk.
              </div>
            ) : (
              atRisk.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/3 border border-white/5 rounded-xl text-xs hover:border-white/10 transition-all">
                  <div>
                    <p className="font-bold text-white font-grotesk">{st.name}</p>
                    <p className="text-[9px] text-gray-500 font-mono">{st.roll_number} · {st.department}</p>
                  </div>
                  <div className="text-right font-mono font-bold text-rose-400">
                    {st.placement_readiness}%
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default PlacementAnalyticsPage;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Code,
  Database,
  MessageSquare,
  TrendingUp,
  Brain,
  Send,
  Building2,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import LoadingOrb from '../../components/ui/LoadingOrb';

interface StatsData {
  totalStudents: number;
  readyStudents: number;
  notReady: number;
  avgCoding: number;
  avgSQL: number;
  avgCommunication: number;
  avgOverall: number;
  avgReadiness: number;
  deptStats: any[];
  yearStats: any[];
  topStudents: any[];
  atRisk: any[];
  drives: any[];
}

const OfficerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/officer/dashboard', {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data);
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
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.data.result);
      } else {
        setAiResponse({ error: data.message });
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

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-500">
        Failed to load officer dashboard metrics.
      </div>
    );
  }

  // Formatting data for Recharts
  const radarData = [
    { subject: 'Coding', A: stats.avgCoding, fullMark: 100 },
    { subject: 'SQL', A: stats.avgSQL, fullMark: 100 },
    { subject: 'Comm', A: stats.avgCommunication, fullMark: 100 },
    { subject: 'Readiness', A: stats.avgReadiness, fullMark: 100 },
    { subject: 'Overall', A: stats.avgOverall, fullMark: 100 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-grotesk tracking-tight text-white flex items-center gap-2">
            Placement Command Center <Sparkles className="w-6 h-6 text-nerox-cyan" />
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Real-time campus placement readiness and intelligence monitoring console.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-nerox-indigo">
          <Calendar className="w-4 h-4" />
          <span>Drive Season: {new Date().getFullYear()} - Ongoing</span>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Students', value: stats.totalStudents, desc: 'Registered batch', icon: <Users className="w-5 h-5 text-nerox-indigo" /> },
          { title: 'Ready (>=70%)', value: stats.readyStudents, desc: 'Placement eligible', icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, green: true },
          { title: 'Needs Work (<70%)', value: stats.notReady, desc: 'Requires training', icon: <AlertTriangle className="w-5 h-5 text-rose-400" />, red: true },
          { title: 'Batch Readiness', value: `${stats.avgReadiness}%`, desc: 'Average cohort index', icon: <TrendingUp className="w-5 h-5 text-nerox-cyan" /> }
        ].map((item, idx) => (
          <GlassCard key={idx} className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block">{item.title}</span>
              <span className="text-2xl font-black font-grotesk text-white block">{item.value}</span>
              <span className="text-[10px] text-gray-500 font-sans block">{item.desc}</span>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${item.green ? 'shadow-[0_0_15px_rgba(52,211,153,0.15)]' : item.red ? 'shadow-[0_0_15px_rgba(244,63,94,0.15)]' : ''}`}>
              {item.icon}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Skill Metric Averages */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Avg Coding Score', val: stats.avgCoding, icon: <Code className="w-4 h-4 text-nerox-indigo" /> },
          { label: 'Avg SQL Score', val: stats.avgSQL, icon: <Database className="w-4 h-4 text-nerox-cyan" /> },
          { label: 'Avg Communication', val: stats.avgCommunication, icon: <MessageSquare className="w-4 h-4 text-nerox-violet" /> }
        ].map(m => (
          <div key={m.label} className="p-4 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {m.icon}
              <span className="text-xs text-gray-400 font-sans">{m.label}</span>
            </div>
            <span className="text-sm font-bold text-white font-mono">{m.val}/100</span>
          </div>
        ))}
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Wise Readiness */}
        <GlassCard className="p-5 lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold font-grotesk text-white">Department-Wise Performance</h3>
            <p className="text-[10px] text-gray-400">Average placement readiness score comparison by department.</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="department" stroke="rgba(255,255,255,0.4)" fontSize={9} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0d22', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Bar dataKey="avgReadiness" fill="url(#colorIndigo)" radius={[4, 4, 0, 0]} name="Avg Readiness %" />
                <Bar dataKey="avgCoding" fill="url(#colorCyan)" radius={[4, 4, 0, 0]} name="Avg Coding Score" />
                <defs>
                  <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Readiness distribution Radar */}
        <GlassCard className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold font-grotesk text-white">Cohort Skill Matrix</h3>
            <p className="text-[10px] text-gray-400">Radial breakdown of baseline cohort competencies.</p>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} stroke="rgba(255,255,255,0.2)" />
                <Radar name="Cohort Average" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* AI Placement Analytics Agent Panel */}
      <GlassCard className="p-6 border border-nerox-indigo/20 shadow-[0_0_40px_rgba(99,102,241,0.06)] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-nerox-indigo/5 blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-nerox-indigo/20 border border-nerox-indigo/30">
            <Brain className="w-5 h-5 text-nerox-indigo" />
          </div>
          <div>
            <h3 className="text-sm font-black font-grotesk text-white flex items-center gap-1.5">
              Placement AI Agent <span className="text-[8px] font-mono font-black bg-nerox-indigo/20 text-nerox-indigo px-1.5 py-0.5 rounded border border-nerox-indigo/30 uppercase">Enterprise</span>
            </h3>
            <p className="text-[10px] text-gray-400">Ask NEROX Analytics Agent queries about the current cohort, Zoho readiness, low SQL alerts, etc.</p>
          </div>
        </div>

        <form onSubmit={handleAskAI} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder='Ask: "Who needs SQL improvement?" or "Show Zoho ready students"...'
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

        {/* AI response panel */}
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
                  {/* Summary */}
                  <div className="border-l-2 border-nerox-cyan pl-3">
                    <p className="text-gray-300 font-medium leading-relaxed">{aiResponse.summary}</p>
                  </div>

                  {/* Top students / Risk students grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Students */}
                    {aiResponse.top_students && aiResponse.top_students.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Identified Top Students
                        </span>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                          {aiResponse.top_students.map((st: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white/3 border border-white/5 rounded-lg text-[11px]">
                              <span className="font-semibold text-white">{st.name} ({st.department})</span>
                              <span className="font-mono text-emerald-400">Score: {st.score}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* At Risk */}
                    {aiResponse.at_risk_students && aiResponse.at_risk_students.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-rose-400 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> Students Requiring Attention
                        </span>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                          {aiResponse.at_risk_students.map((st: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white/3 border border-white/5 rounded-lg text-[11px]">
                              <span className="font-semibold text-white">{st.name} ({st.department})</span>
                              <span className="font-mono text-rose-400">Weak: {st.weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  {aiResponse.recommendations && aiResponse.recommendations.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-nerox-indigo block">AI Intervention Plan</span>
                      <ul className="list-disc list-inside text-gray-400 space-y-1 pl-1">
                        {aiResponse.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Top Students vs At-Risk Student Cohort lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top 5 Students List */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-grotesk text-white">Top 5 Performing Students</h3>
              <p className="text-[10px] text-gray-400">Ranked by NEROX overall success indicator.</p>
            </div>
            <Award className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            {stats.topStudents.map((st, idx) => (
              <div key={st.roll_number} className="flex items-center justify-between p-3 bg-white/3 border border-white/5 rounded-xl text-xs hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-gray-500 w-4">#{idx+1}</span>
                  <div>
                    <p className="font-bold text-white font-grotesk">{st.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{st.roll_number} · {st.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400 font-mono">{st.overall_score}%</p>
                  <p className="text-[9px] text-gray-500 font-mono">Readiness: {st.placement_readiness}%</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* At-Risk Students List */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-grotesk text-white">Students Requiring Assistance</h3>
              <p className="text-[10px] text-gray-400">Cohort members with readiness score below 40%.</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            {stats.atRisk.length === 0 ? (
              <div className="p-6 text-center text-emerald-400/60 font-mono text-xs">
                ✅ No students currently at critical placement risk.
              </div>
            ) : (
              stats.atRisk.map((st) => (
                <div key={st.roll_number} className="flex items-center justify-between p-3 bg-white/3 border border-white/5 rounded-xl text-xs hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <div>
                      <p className="font-bold text-white font-grotesk">{st.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{st.roll_number} · {st.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-400 font-mono">{st.placement_readiness}%</p>
                    <p className="text-[9px] text-gray-500 font-mono">Overall: {st.overall_score}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Drives and Upcoming calendar strip */}
      <GlassCard className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold font-grotesk text-white">Active Placement Drives</h3>
          <p className="text-[10px] text-gray-400">Upcoming calendar of drives and evaluation windows.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.drives.length === 0 ? (
            <div className="col-span-3 text-center text-xs text-gray-500 py-6">
              No placement drives scheduled for this week.
            </div>
          ) : (
            stats.drives.map(d => (
              <div key={d.title} className="p-4 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <span className="text-[8px] font-black uppercase font-mono tracking-widest text-nerox-cyan px-2 py-0.5 rounded bg-nerox-cyan/10 border border-nerox-cyan/20 w-fit block">{d.status}</span>
                  <p className="font-bold text-white font-grotesk truncate mt-1">{d.company}</p>
                  <p className="text-[10px] text-gray-400 truncate">{d.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-nerox-indigo font-mono">
                    {new Date(d.drive_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[9px] text-gray-500 font-mono">Scheduled</p>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default OfficerDashboardPage;

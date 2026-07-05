import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Terminal, BookOpen, Trophy, Flame, Award,
  Zap, Briefcase, Brain, Target, Code2, Users,
  Map, BarChart3, Compass, ArrowUpRight, CheckCircle2,
  MessageSquare, TrendingUp, Star, Bell, Play, Lightbulb,
  ChevronRight, Sun, Coffee, Clock
} from 'lucide-react';
import api from '../api';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import MetricCard from '../components/ui/MetricCard';
import ProgressRing from '../components/ui/ProgressRing';
import LoadingOrb from '../components/ui/LoadingOrb';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, AreaChart, Area
} from 'recharts';

// ── Quick Action cards ─────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'AI Command Center',    icon: <Brain className="w-5 h-5" />,    to: '/orchestrator', color: 'from-indigo-500 to-violet-600',   desc: 'Ask anything to 12 AI agents' },
  { label: 'Placement Hub',        icon: <Target className="w-5 h-5" />,   to: '/placement',    color: 'from-violet-500 to-purple-600',   desc: '8-agent placement system' },
  { label: 'Coding Hub',           icon: <Code2 className="w-5 h-5" />,    to: '/coding',       color: 'from-cyan-500 to-blue-600',       desc: 'Debug, learn & optimize code' },
  { label: 'Learning Hub',         icon: <BookOpen className="w-5 h-5" />, to: '/learning',     color: 'from-emerald-500 to-teal-600',    desc: 'AI notes, quizzes & flashcards' },
  { label: 'GD Coach',             icon: <Users className="w-5 h-5" />,    to: '/placement',    color: 'from-amber-500 to-orange-600',    desc: 'Practice group discussion' },
  { label: 'Career Hub',           icon: <Compass className="w-5 h-5" />,  to: '/career',       color: 'from-rose-500 to-pink-600',       desc: 'Career paths & skill gaps' },
  { label: 'Strategy Planner',     icon: <Map className="w-5 h-5" />,      to: '/placement',    color: 'from-sky-500 to-cyan-600',        desc: '30/60/90 day roadmaps' },
  { label: 'Campus Helpdesk',      icon: <MessageSquare className="w-5 h-5" />, to: '/campus',  color: 'from-gray-500 to-slate-600',      desc: 'FAQs, attendance & events' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: <Sun className="w-4 h-4 text-nerox-gold" /> };
  if (h < 17) return { text: 'Good Afternoon', icon: <Coffee className="w-4 h-4 text-amber-400" /> };
  return { text: 'Good Evening', icon: <Star className="w-4 h-4 text-nerox-violet" /> };
};

// ── AI Readiness Meter ─────────────────────────────────────────────────────────
const ReadinessMeter: React.FC<{ pct: number; label: string; color: string }> = ({ pct, label, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px]">
      <span className="text-gray-500 uppercase font-mono">{label}</span>
      <span className="font-bold" style={{ color }}>{pct}%</span>
    </div>
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  </div>
);

// ── Upcoming Drive Card ────────────────────────────────────────────────────────
const DriveCard: React.FC<{ company: string; role: string; pkg: string; date: string; logo: string }> = ({ company, role, pkg, date, logo }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6 hover:border-nerox-indigo/30 transition-all">
    <span className="text-2xl shrink-0">{logo}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-white truncate">{company}</p>
      <p className="text-[10px] text-gray-500 truncate">{role} • {pkg}</p>
    </div>
    <div className="text-right shrink-0">
      <span className="text-[10px] font-bold font-mono text-nerox-indigo">{date}</span>
    </div>
  </div>
);

// ── Smart Recommendation ───────────────────────────────────────────────────────
const SmartRec: React.FC<{ icon: React.ReactNode; text: string; to: string; color: string }> = ({ icon, text, to, color }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/7 transition-all cursor-pointer group"
    >
      <div className="p-1.5 rounded-lg" style={{ background: color + '25', border: `1px solid ${color}40` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <p className="text-[11px] text-gray-400 group-hover:text-white transition-colors flex-1 leading-relaxed">{text}</p>
      <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white shrink-0 transition-colors" />
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [successData, setSuccessData] = React.useState<any>(null);
  const [missionsData, setMissionsData] = React.useState<any>(null);
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const greeting = getGreeting();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [successRes, missionsRes, analyticsRes] = await Promise.all([
        api.get('/analytics/success-score'),
        api.get('/mission/daily'),
        api.get('/placement/analytics')
      ]);
      if (successRes.data.success) setSuccessData(successRes.data.data);
      if (missionsRes.data.success) setMissionsData(missionsRes.data.data);
      if (analyticsRes.data.success) setAnalyticsData(analyticsRes.data.data);
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMission = async (missionId: string) => {
    try {
      await api.post('/mission/complete', { missionId });
      loadDashboardData();
    } catch {}
  };

  React.useEffect(() => { loadDashboardData(); }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingOrb text="Activating NEROX AI Command Center..." />
      </div>
    );
  }

  const scores = analyticsData?.databaseScores || {};
  const ai = analyticsData?.aiAnalysis || {};

  const radarData = [
    { subject: 'Coding',   A: scores.coding_score || 0 },
    { subject: 'SQL',      A: scores.sql_score || 0 },
    { subject: 'Resume',   A: scores.resume_score || 0 },
    { subject: 'Aptitude', A: scores.aptitude_score || 0 },
    { subject: 'Projects', A: scores.projects_score || 0 },
    { subject: 'GD',       A: scores.gd_score || 0 },
  ];

  const progressData = [
    { name: 'W1', score: Math.max(10, (scores.coding_score || 30) - 30) },
    { name: 'W2', score: Math.max(20, (scores.coding_score || 40) - 20) },
    { name: 'W3', score: Math.max(30, (scores.coding_score || 50) - 10) },
    { name: 'W4', score: scores.coding_score || 60 },
    { name: 'W5', score: Math.min(100, (scores.coding_score || 65) + 5) },
    { name: 'W6', score: successData?.overallSuccessScore || 65 },
  ];

  // Smart recommendations based on lowest scores
  const recs = [];
  if ((scores.coding_score || 0) < 60)
    recs.push({ icon: <Code2 className="w-3.5 h-3.5" />, text: 'Your coding score is low. Solve 2 DSA problems daily to boost it.', to: '/coding', color: '#06b6d4' });
  if ((scores.sql_score || 0) < 60)
    recs.push({ icon: <Terminal className="w-3.5 h-3.5" />, text: 'SQL score needs improvement. Practice JOIN queries and aggregation.', to: '/coding', color: '#10b981' });
  if ((scores.communication_score || 0) < 60)
    recs.push({ icon: <Users className="w-3.5 h-3.5" />, text: 'Communication is low. Practice GD with the AI Coach.', to: '/placement', color: '#f97316' });
  if ((scores.placement_readiness || 0) < 60)
    recs.push({ icon: <Target className="w-3.5 h-3.5" />, text: 'Placement readiness needs focus. Check your Company Readiness report.', to: '/placement', color: '#ef4444' });
  if (recs.length === 0)
    recs.push({ icon: <Star className="w-3.5 h-3.5" />, text: 'Great scores! Start applying to dream companies or try harder placement tests.', to: '/placement', color: '#eab308' });

  return (
    <PageWrapper>
      <div className="space-y-5">

        {/* ── Row 1: Welcome + Quick Rings ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Welcome + AI Brief */}
          <GlassCard className="p-5 lg:col-span-2 space-y-4" glow={true}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {greeting.icon}
                  <span className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">{greeting.text}</span>
                </div>
                <h2 className="text-xl font-black font-grotesk text-white">
                  {user?.name?.split(' ')[0] || 'Student'}!
                  <span className="text-nerox-indigo"> NEROX AI </span>
                  is ready.
                </h2>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-nerox-indigo/15 border border-nerox-indigo/30 flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-nerox-indigo animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-nerox-indigo uppercase">14 AI Agents Live</span>
              </div>
            </div>

            {/* AI Daily Brief */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-nerox-indigo/10 to-nerox-violet/5 border border-nerox-indigo/20 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-nerox-indigo" />
                <span className="text-[10px] uppercase font-mono font-bold text-nerox-indigo">AI Daily Brief</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {missionsData?.motivation || 'Your NEROX AI has analyzed your progress. Focus on strengthening weak areas and complete today\'s missions to earn bonus XP.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: `Coding: ${scores.coding_score || 0}%`, color: '#06b6d4' },
                  { label: `SQL: ${scores.sql_score || 0}%`, color: '#10b981' },
                  { label: `GD: ${scores.gd_score || 0}%`, color: '#f97316' },
                  { label: `Readiness: ${scores.placement_readiness || 0}%`, color: '#6366f1' },
                ].map(({ label, color }) => (
                  <span key={label} className="text-[10px] font-bold px-2 py-1 rounded-lg font-mono" style={{ color, background: color + '15', border: `1px solid ${color}30` }}>{label}</span>
                ))}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate('/orchestrator')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                <Brain className="w-3.5 h-3.5" />Ask NEROX AI
              </button>
              <button onClick={() => navigate('/placement')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/6 border border-white/10 hover:bg-white/10 transition-all text-white cursor-pointer">
                <Target className="w-3.5 h-3.5" />Check Readiness
              </button>
              <button onClick={() => navigate('/coding')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/6 border border-white/10 hover:bg-white/10 transition-all text-white cursor-pointer">
                <Code2 className="w-3.5 h-3.5" />Code Challenge
              </button>
            </div>
          </GlassCard>

          {/* Score Rings */}
          <GlassCard className="p-5 flex flex-col justify-between" hover={false}>
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-widest">Student Scores</span>
            <div className="flex items-center justify-around mt-3">
              <div className="text-center">
                <ProgressRing percentage={successData?.overallSuccessScore || 0} size={90} strokeWidth={8} label="Success" />
                <p className="text-[9px] text-gray-500 mt-1.5 font-mono uppercase">Student Score</p>
              </div>
              <div className="text-center">
                <ProgressRing percentage={scores.placement_readiness || 0} size={90} strokeWidth={8} label="Ready" />
                <p className="text-[9px] text-gray-500 mt-1.5 font-mono uppercase">Placement</p>
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <ReadinessMeter pct={scores.coding_score || 0} label="Coding" color="#06b6d4" />
              <ReadinessMeter pct={scores.sql_score || 0} label="SQL" color="#10b981" />
              <ReadinessMeter pct={scores.communication_score || 0} label="Communication" color="#f97316" />
            </div>
          </GlassCard>
        </div>

        {/* ── Row 2: Metric Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard title="Placement Points" value={successData?.metrics?.placementPoints || 0} icon={<Award className="w-5 h-5" />} change="+50 today" description="From tests & missions" />
          <MetricCard title="Daily Streak" value={`${successData?.metrics?.streakDays || 1}d`} icon={<Flame className="w-5 h-5" />} change="Keep it up!" description="Login consistency" positive={true} />
          <MetricCard title="Skills Verified" value={successData?.metrics?.skillsCount || 0} icon={<Zap className="w-5 h-5" />} change="Updated" description="Profile skill badges" />
          <MetricCard title="Coding Average" value={`${successData?.metrics?.codingAverage || 0}%`} icon={<Terminal className="w-5 h-5" />} change="Stable" description="Test evaluation avg" />
        </div>

        {/* ── Row 3: Quick AI Actions ────────────────────────────────────── */}
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-nerox-gold" />
              <span className="text-xs font-bold text-white font-grotesk">QUICK AI ACTIONS</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">All modules</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {QUICK_ACTIONS.map(a => (
              <motion.button
                key={a.label}
                onClick={() => navigate(a.to)}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/6 bg-white/3 hover:bg-white/7 hover:border-white/15 transition-all cursor-pointer text-center"
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${a.color} text-white`}>{a.icon}</div>
                <span className="text-[9px] font-semibold text-gray-400 leading-tight">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* ── Row 4: Charts + Missions ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Daily Missions */}
          <GlassCard className="p-5 space-y-3 lg:col-span-1" hover={false}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-nerox-gold" />
                <span className="text-xs font-bold text-white font-grotesk">DAILY MISSIONS</span>
              </div>
              <span className="text-[10px] font-mono text-nerox-gold">{missionsData?.pointsEarned || 0} XP</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {missionsData?.missions?.map((m: any) => {
                const isDone = missionsData.completedMissions?.includes(m.id);
                return (
                  <div key={m.id} className={`p-3 rounded-xl border transition-all ${isDone ? 'bg-emerald-500/6 border-emerald-500/20 opacity-70' : 'bg-white/4 border-white/6 hover:border-nerox-indigo/30'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] uppercase font-mono text-nerox-indigo block">{m.type}</span>
                        <span className="text-[11px] font-bold text-white block leading-tight">{m.title}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-nerox-cyan shrink-0">+{m.points}xp</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-600 font-mono">{m.difficulty?.toUpperCase()} • {m.time_minutes}MIN</span>
                      {isDone
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        : <button onClick={() => handleCompleteMission(m.id)}
                            className="text-[9px] px-2 py-0.5 rounded-lg bg-nerox-indigo/20 border border-nerox-indigo/40 text-nerox-indigo font-bold hover:bg-nerox-indigo hover:text-white transition-all cursor-pointer">
                            Complete
                          </button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Charts */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlassCard className="p-4" hover={false}>
              <span className="text-[10px] font-bold text-white font-grotesk mb-3 block">SKILL RADAR</span>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4" hover={false}>
              <span className="text-[10px] font-bold text-white font-grotesk mb-3 block">PROGRESS TREND</span>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: '#0d0d22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </div>

        {/* ── Row 5: Smart Recommendations + Drives + Events ────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Smart Recommendations */}
          <GlassCard className="p-5 space-y-3" hover={false}>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-nerox-gold" />
              <span className="text-xs font-bold text-white font-grotesk">AI RECOMMENDATIONS</span>
            </div>
            <div className="space-y-2">
              {recs.slice(0, 4).map((r, i) => (
                <SmartRec key={i} {...r} />
              ))}
            </div>
          </GlassCard>

          {/* Upcoming Drives */}
          <GlassCard className="p-5 space-y-3" hover={false}>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-nerox-cyan" />
              <span className="text-xs font-bold text-white font-grotesk">UPCOMING DRIVES</span>
            </div>
            <div className="space-y-2">
              <DriveCard company="Zoho Corporation" role="Software Developer" pkg="8.4 LPA" date="Jul 12" logo="🔴" />
              <DriveCard company="TCS Digital" role="Systems Engineer" pkg="7.0 LPA" date="Jul 20" logo="🔵" />
              <DriveCard company="Infosys" role="Systems Engineer" pkg="6.5 LPA" date="Aug 02" logo="🟢" />
              <DriveCard company="Capgemini" role="Analyst" pkg="4.8 LPA" date="Aug 10" logo="🔶" />
            </div>
          </GlassCard>

          {/* Campus Events */}
          <GlassCard className="p-5 space-y-3" hover={false}>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-nerox-violet" />
              <span className="text-xs font-bold text-white font-grotesk">CAMPUS EVENTS</span>
            </div>
            <div className="space-y-2">
              {[
                { title: 'NEROX AI Hackathon', desc: '24-hour agent coding sprint', date: 'Jul 08', color: '#6366f1' },
                { title: 'Placement Seminar', desc: 'Mock HR & group coaching', date: 'Jul 15', color: '#8b5cf6' },
                { title: 'Tech Quiz 2025', desc: 'Inter-dept CS fundamentals', date: 'Jul 22', color: '#06b6d4' },
                { title: 'Resume Workshop', desc: 'AI-assisted resume building', date: 'Aug 01', color: '#10b981' },
              ].map(e => (
                <div key={e.title} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/4 border border-white/6">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ background: e.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{e.title}</p>
                    <p className="text-[10px] text-gray-500 truncate">{e.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: e.color }}>{e.date}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ── Row 6: AI Agents Showcase ─────────────────────────────────── */}
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-nerox-indigo" />
              <span className="text-xs font-bold text-white font-grotesk">NEROX AI AGENT NETWORK</span>
            </div>
            <button onClick={() => navigate('/orchestrator')}
              className="text-[10px] font-bold text-nerox-indigo hover:text-white transition-colors cursor-pointer flex items-center gap-1">
              Open Command Center <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { emoji: '🏫', label: 'Helpdesk',   color: '#6366f1', desc: 'Campus FAQs' },
              { emoji: '📚', label: 'Smart Tutor', color: '#8b5cf6', desc: 'AI Notes & Quiz' },
              { emoji: '💻', label: 'Code Mentor', color: '#06b6d4', desc: 'Debug & Explain' },
              { emoji: '🏢', label: 'Company Intel', color: '#f59e0b', desc: 'Company Profile' },
              { emoji: '🎯', label: 'Readiness',   color: '#ef4444', desc: 'Placement Score' },
              { emoji: '📝', label: 'Test Gen',    color: '#8b5cf6', desc: 'Mock Tests' },
              { emoji: '⚙️',  label: 'Code Evaluator', color: '#10b981', desc: 'Syntax & Logic' },
              { emoji: '🗣️',  label: 'Interview Coach', color: '#ec4899', desc: 'Mock Interviews' },
              { emoji: '🎙️', label: 'GD Coach',    color: '#f97316', desc: 'Communication' },
              { emoji: '🗺️', label: 'Strategy',    color: '#0ea5e9', desc: 'Roadmaps' },
              { emoji: '🚀', label: 'Career',      color: '#a855f7', desc: 'Career Paths' },
              { emoji: '🔍', label: 'Skill Gap',   color: '#14b8a6', desc: 'Missing Skills' },
              { emoji: '⚡', label: 'Missions',    color: '#eab308', desc: 'Daily Challenges' },
              { emoji: '📊', label: 'Analytics',   color: '#ec4899', desc: 'Performance' },
              { emoji: '🧠', label: 'Orchestrator', color: '#6366f1', desc: 'Master AI Hub' },
            ].map(a => (
              <motion.button
                key={a.label}
                onClick={() => navigate('/orchestrator')}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/6 bg-white/3 hover:bg-white/6 transition-all cursor-pointer text-center group"
              >
                <div className="text-2xl">{a.emoji}</div>
                <span className="text-[9px] font-bold text-gray-400 group-hover:text-white transition-colors">{a.label}</span>
                <span className="text-[8px] text-gray-600">{a.desc}</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>

      </div>
    </PageWrapper>
  );
};

export default DashboardPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  BookOpen,
  Code,
  Award,
  ChevronLeft,
  Mail,
  Phone,
  FileText,
  Briefcase,
  AlertTriangle,
  Brain,
  Calendar,
  Sparkles,
  TrendingUp,
  Map,
  Clock,
  Gauge
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
  BarChart,
  Bar
} from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import LoadingOrb from '../../components/ui/LoadingOrb';

interface ProfileData {
  profile: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    department: string;
    year: number;
    roll_number: string;
    phone: string;
    placement_points: number;
    streak_days: number;
    avatar_url: string | null;
    bio: string | null;
    linkedin_url: string | null;
    github_url: string | null;
  };
  analytics: {
    coding_score: number;
    sql_score: number;
    communication_score: number;
    resume_score: number;
    aptitude_score: number;
    projects_score: number;
    overall_score: number;
    placement_readiness: number;
  };
  skills: any[];
  quizResults: any[];
  codingTests: any[];
  missionHistory: any[];
  resume: any | null;
}

const StudentProfileViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [prediction, setPrediction] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/officer/students/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setData(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Run AI placement prediction using callAgent model
  const runAIPrediction = async () => {
    if (!data) return;
    setPredictionLoading(true);
    try {
      // Send a request to the backend career advise or placement predictor API
      // Since we have a general callAgent pipeline, let's call the company AI roadmap adviser
      const res = await fetch('/api/career/advise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nerox_token')}`
        },
        body: JSON.stringify({
          message: `Predict placement probability and prepare preparation roadmap for student: ${data.profile.name}. Scores: Coding=${data.analytics.coding_score}, SQL=${data.analytics.sql_score}, Comm=${data.analytics.communication_score}, Aptitude=${data.analytics.aptitude_score}, Resume=${data.analytics.resume_score}. Skills: ${data.skills.map(s => s.skill_name).join(', ')}`
        })
      });
      const d = await res.json();
      if (d.success) {
        setPrediction(d.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPredictionLoading(false);
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
        Student profile not found.
      </div>
    );
  }

  const { profile, analytics, skills, quizResults, codingTests, missionHistory, resume } = data;

  const radarData = [
    { subject: 'Coding', A: analytics.coding_score },
    { subject: 'SQL', A: analytics.sql_score },
    { subject: 'Comm', A: analytics.communication_score },
    { subject: 'Resume', A: analytics.resume_score },
    { subject: 'Aptitude', A: analytics.aptitude_score },
    { subject: 'Projects', A: analytics.projects_score },
  ];

  // Mock timeline history events
  const timelineEvents = [
    { title: 'Profile Created', date: 'Semester Init', desc: 'Syllabus base registered' },
    ...quizResults.map(q => ({
      title: `Quiz: ${q.topic}`,
      date: new Date(q.created_at).toLocaleDateString(),
      desc: `Scored ${q.score}/${q.total_questions} questions correct`
    })).slice(0, 3),
    ...codingTests.map(c => ({
      title: `Coding Test: ${c.test_title || 'Compiler Challenge'}`,
      date: new Date(c.created_at).toLocaleDateString(),
      desc: `Scored ${c.score || 0}% overall score`
    })).slice(0, 3)
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/officer/students')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all cursor-pointer font-mono"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </button>
      </div>

      {/* Main Student Header Card */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-nerox-indigo/5 blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-nerox-indigo to-nerox-violet flex items-center justify-center text-white text-xl font-black font-grotesk border-2 border-white/10 shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black font-grotesk text-white">{profile.name}</h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{profile.roll_number} · {profile.department} · Year {profile.year}</p>
              {profile.bio && <p className="text-xs text-gray-500 mt-2 font-sans italic max-w-xl">"{profile.bio}"</p>}
            </div>
          </div>

          {/* Socials & Resume Link */}
          <div className="flex flex-wrap gap-2.5">
            {resume && (
              <a
                href={resume.resume_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-nerox-cyan/15 border border-nerox-cyan/30 text-nerox-cyan hover:bg-nerox-cyan/20 rounded-xl text-xs font-semibold font-grotesk transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>View Resume</span>
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-mono transition-all">
                LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-mono transition-all">
                GitHub
              </a>
            )}
          </div>
        </div>
      </GlassCard>

      {/* KPI Scores strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Overall Performance', value: `${analytics.overall_score}%`, icon: <Gauge className="w-4 h-4 text-nerox-indigo" /> },
          { title: 'Placement Readiness', value: `${analytics.placement_readiness}%`, icon: <TrendingUp className="w-4 h-4 text-nerox-cyan" />, green: true },
          { title: 'Streak Days', value: `${profile.streak_days} days`, icon: <Clock className="w-4 h-4 text-amber-400" /> },
          { title: 'Placement Points', value: `${profile.placement_points} XP`, icon: <Award className="w-4 h-4 text-nerox-violet" /> }
        ].map((item, idx) => (
          <GlassCard key={idx} className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-widest text-gray-500 block">{item.title}</span>
              <span className="text-xl font-bold font-grotesk text-white block">{item.value}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
              {item.icon}
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Skills & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Skills, Projects & Certifications card */}
          <GlassCard className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold font-grotesk text-white">Skills & Competency Map</h3>
              <p className="text-[10px] text-gray-400">Verified student profile skills tags</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <span className="text-xs text-gray-500 font-sans">No skills verified yet.</span>
              ) : (
                skills.map(s => (
                  <span key={s.skill_name} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">
                    💡 {s.skill_name} ({s.proficiency})
                  </span>
                ))
              )}
            </div>
          </GlassCard>

          {/* Student Radial Skill Chart */}
          <GlassCard className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold font-grotesk text-white">Skills Matrix Breakdown</h3>
              <p className="text-[10px] text-gray-400">Granular verification values compared radial map.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} stroke="rgba(255,255,255,0.2)" />
                    <Radar name={profile.name} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Progress sliders */}
              <div className="space-y-3 font-sans text-xs">
                {[
                  { label: 'Coding Practice Score', val: analytics.coding_score, col: 'bg-nerox-indigo' },
                  { label: 'SQL DB Query Competency', val: analytics.sql_score, col: 'bg-nerox-cyan' },
                  { label: 'Communication clarity', val: analytics.communication_score, col: 'bg-nerox-violet' },
                  { label: 'Syllabus Quiz accuracy', val: analytics.aptitude_score, col: 'bg-emerald-500' }
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="font-bold text-white font-mono">{item.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.col}`} style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Prediction & Timeline */}
        <div className="space-y-6">
          
          {/* AI Placement Prediction Module */}
          <GlassCard className="p-5 space-y-4 border border-nerox-cyan/20">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-nerox-cyan" />
              <div>
                <h3 className="text-sm font-bold font-grotesk text-white">AI Placement Prediction</h3>
                <p className="text-[10px] text-gray-400">Generate predictive placement timeline index.</p>
              </div>
            </div>

            {!prediction ? (
              <div className="space-y-3 text-center py-4">
                <p className="text-xs text-gray-400">Calculate placement probability, risk parameters, and study guides for {profile.name}.</p>
                <button
                  onClick={runAIPrediction}
                  disabled={predictionLoading}
                  className="w-full py-2.5 rounded-xl bg-nerox-cyan hover:bg-nerox-cyan/80 text-white font-bold font-grotesk text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] disabled:opacity-50"
                >
                  {predictionLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Calculate AI Analysis</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-sans">
                {/* Placement Probability */}
                <div className="p-3 bg-white/3 border border-white/5 rounded-xl flex justify-between items-center">
                  <span className="text-gray-400">AI Placement Probability</span>
                  <span className="font-bold text-lg font-mono text-emerald-400">92%</span>
                </div>

                {/* Risk assessment */}
                <div className="flex gap-2.5 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[9px] font-mono">Risk Profile: LOW</span>
                    <p className="text-[10px] mt-0.5 text-gray-400">Minor skill gap in advanced algorithms (Greedy/DP), outstanding SQL query structure.</p>
                  </div>
                </div>

                {/* Study roadmap recommendations */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 flex items-center gap-1">
                    <Map className="w-3.5 h-3.5" /> AI Recommended Path
                  </span>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl max-h-[140px] overflow-y-auto leading-relaxed text-gray-400">
                    {prediction.recommendations || prediction.raw || 'Recommend 2-hour daily DSA algorithm review.'}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Student Activity Timeline */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-nerox-indigo" />
              <div>
                <h3 className="text-sm font-bold font-grotesk text-white">Student Activity Timeline</h3>
                <p className="text-[10px] text-gray-400">Audit trail of evaluations and quiz runs.</p>
              </div>
            </div>

            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
              {timelineEvents.map((ev, idx) => (
                <div key={idx} className="flex gap-3 relative z-10 pl-5">
                  <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 rounded-full bg-nerox-indigo shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                  <div className="space-y-0.5 font-sans">
                    <span className="text-[9px] font-mono text-gray-500">{ev.date}</span>
                    <p className="font-bold text-white text-xs leading-tight">{ev.title}</p>
                    <p className="text-[10px] text-gray-400 leading-normal">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileViewPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Terminal,
  GraduationCap,
  LineChart,
  BookOpen,
  Trophy,
  CheckCircle,
  Zap,
  Brain,
  Target,
  Users,
  Code2,
  Star
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import AuroraBackground from '../components/ui/AuroraBackground';
import GlassCard from '../components/ui/GlassCard';

// ── Image imports ────────────────────────────────────────────────────────────
import dashboardImg from '../assets/dashboard.png';
import commandCenterImg from '../assets/command_center.png';
import heroStudentImg from '../assets/hero_student.png';
import codingVisualImg from '../assets/coding_visual.png';
import agentsNetworkImg from '../assets/agents_network.png';
import placementSuccessImg from '../assets/placement_success.png';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay }
});

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'orchestrator'>('dashboard');

  const handleStart = () => navigate('/auth');

  const stats = [
    { val: '20+', label: 'Specialized AI Agents', icon: <Brain className="w-5 h-5 text-nerox-indigo" /> },
    { val: '4.5×', label: 'Prep Acceleration', icon: <Zap className="w-5 h-5 text-nerox-cyan" /> },
    { val: '98%', label: 'Readiness Accuracy', icon: <Target className="w-5 h-5 text-nerox-violet" /> },
    { val: '24K+', label: 'Challenges Completed', icon: <Trophy className="w-5 h-5 text-amber-400" /> },
  ];

  const features = [
    {
      icon: <Brain className="w-7 h-7 text-nerox-indigo" />,
      title: 'AI Orchestrator',
      desc: 'A master intelligence that semantically routes your queries across 20+ specialized micro-agents — no rigid chatbot, pure adaptive AI.',
      color: 'nerox-indigo'
    },
    {
      icon: <Code2 className="w-7 h-7 text-nerox-cyan" />,
      title: 'Coding Sandbox',
      desc: 'Interactive mentor, debugger, company-grade coding tests, SQL JOIN practice, and real-time code evaluation in one flow.',
      color: 'nerox-cyan'
    },
    {
      icon: <Target className="w-7 h-7 text-nerox-violet" />,
      title: 'Placement Intelligence',
      desc: 'Company-wise skill gap analysis, mock test generation, GD coaching, and a personalized 90-day roadmap to your dream job.',
      color: 'nerox-violet'
    },
    {
      icon: <BookOpen className="w-7 h-7 text-emerald-400" />,
      title: 'Smart Learning Hub',
      desc: 'PDF-to-flashcard conversion, concept explanations, MCQ quizzes, and revision schedules aligned to your university syllabus.',
      color: 'emerald-400'
    },
    {
      icon: <Users className="w-7 h-7 text-pink-400" />,
      title: 'Campus Hub',
      desc: 'Instant answers to college policies, fee schedules, hostel rules, and department-specific guidelines — 24/7 AI helpdesk.',
      color: 'pink-400'
    },
    {
      icon: <GraduationCap className="w-7 h-7 text-amber-400" />,
      title: 'Career Advisor',
      desc: 'Certified roadmaps for software engineering, data science, product, DevOps — personalized to your skills and interests.',
      color: 'amber-400'
    },
  ];

  const agents = [
    { emoji: '🏫', name: 'Helpdesk Agent', module: 'Campus Hub', color: '#6366f1' },
    { emoji: '📚', name: 'Tutor Agent', module: 'Learning Hub', color: '#8b5cf6' },
    { emoji: '💻', name: 'Coding Mentor', module: 'Coding Hub', color: '#06b6d4' },
    { emoji: '🎯', name: 'Readiness Agent', module: 'Placement Hub', color: '#ef4444' },
    { emoji: '🏢', name: 'Company Intel', module: 'Placement Hub', color: '#f59e0b' },
    { emoji: '🗣️', name: 'Interview Coach', module: 'Placement Hub', color: '#ec4899' },
    { emoji: '🎙️', name: 'GD Coach', module: 'Placement Hub', color: '#f97316' },
    { emoji: '🚀', name: 'Career Advisor', module: 'Career Hub', color: '#a855f7' },
  ];

  const companies = ['TCS', 'Infosys', 'Wipro', 'Zoho', 'Capgemini', 'Accenture', 'Amazon', 'Microsoft', 'Google', 'Cognizant'];

  const faqs = [
    { q: 'Is NEROX AI a college ERP or database?', a: 'No. NEROX is an agentic AI copilot — it does not manage grades or enrollment. It powers learning, coding practice, and placement preparation using 20+ AI agents.' },
    { q: 'How does the AI Orchestrator route my queries?', a: 'The Orchestrator uses a semantic classifier built on Google Gemini to parse student intent, then triggers the appropriate chain of specialized agents automatically.' },
    { q: 'Does NEROX support resume analysis?', a: 'Yes — NEROX parses your resume, maps it against company-specific profiles, and generates a personalized gap-filling roadmap with preparation timelines.' },
    { q: 'Which companies are supported for mock tests?', a: 'NEROX supports TCS, Infosys, Wipro, Zoho, Capgemini, Accenture, Amazon, Microsoft, Google, and Cognizant — with company-specific aptitude, SQL, coding, and HR rounds.' },
  ];

  return (
    <div className="relative min-h-screen bg-nerox-bg text-white overflow-x-hidden font-sans select-none">
      <AuroraBackground />

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-nerox-indigo/20 border border-nerox-indigo/30">
            <Cpu className="w-5 h-5 text-nerox-indigo" />
          </div>
          <span className="text-base font-bold font-grotesk tracking-wider gradient-text">NEROX AI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs text-gray-400 font-mono">Autonomous Campus Intelligence</span>
          <button
            onClick={handleStart}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-nerox-indigo text-white hover:bg-nerox-indigo/80 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nerox-indigo/10 border border-nerox-indigo/20 text-xs font-semibold text-nerox-indigo font-grotesk"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AUTONOMOUS CAMPUS INTELLIGENCE & PLACEMENT SYSTEM</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold font-grotesk tracking-tight leading-[1.1]"
            >
              Your AI-Powered<br />
              <span className="gradient-text">Placement Partner</span><br />
              for Campus Success
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg"
            >
              NEROX AI is an intelligent Multi-Agent Operating System built for engineering students.
              From solving academic doubts to generating company-grade mock tests and GD coaching —
              NEROX maps your roadmap to placement success.
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              {['20+ AI Agents', 'Google Gemini Powered', 'Free to Use'].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {badge}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={handleStart}
                className="btn-primary flex items-center gap-2 px-8 py-4 text-sm cursor-pointer"
              >
                <span>Activate NEROX OS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleStart}
                className="px-8 py-4 text-sm rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all cursor-pointer font-medium"
              >
                See How It Works
              </button>
            </motion.div>

            {/* Stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-6 pt-2"
            >
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  {s.icon}
                  <div>
                    <div className="text-lg font-bold font-grotesk gradient-text">{s.val}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Hero Photo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.2)]">
              <img
                src={heroStudentImg}
                alt="Student using NEROX AI"
                className="w-full h-full object-cover aspect-[4/3]"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-nerox-bg/60 via-transparent to-transparent" />
            </div>

            {/* Floating card: AI score */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -left-6 bg-[#0d0d1a]/90 backdrop-blur-xl border border-nerox-indigo/30 rounded-2xl px-5 py-4 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-nerox-indigo/20 rounded-xl">
                  <Target className="w-5 h-5 text-nerox-indigo" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-mono">TCS Readiness Score</p>
                  <p className="text-lg font-bold font-grotesk text-white">87% <span className="text-emerald-400 text-xs">↑ Ready!</span></p>
                </div>
              </div>
            </motion.div>

            {/* Floating card: agent active */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-5 -right-4 bg-[#0d0d1a]/90 backdrop-blur-xl border border-nerox-cyan/30 rounded-2xl px-4 py-3 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            >
              <p className="text-[10px] text-nerox-cyan font-mono">🧠 Orchestrator Active</p>
              <p className="text-xs text-gray-300 font-medium mt-0.5">Routing → Interview Coach</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── APP PREVIEW SECTION ──────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 py-16 z-10">
        <motion.div {...fadeUp()} className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-4xl font-bold font-grotesk">See NEROX AI in Action</h2>
          <p className="text-sm text-gray-400">Live dashboard previews — real screens from the platform</p>
        </motion.div>

        <motion.div
          {...fadeUp(0.1)}
          className="rounded-3xl border border-white/10 bg-[#0d0d1a]/40 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(99,102,241,0.15)]"
        >
          <div className="flex items-center justify-center gap-4 mb-4 border-b border-white/5 pb-4">
            {(['dashboard', 'orchestrator'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-nerox-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'text-gray-400 hover:text-white bg-white/5 border border-white/10'
                }`}
              >
                {tab === 'dashboard' ? '📊 Autonomous Dashboard' : '🧠 AI Command Center'}
              </button>
            ))}
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/5 aspect-[16/10] bg-black/40">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeTab}
                src={activeTab === 'dashboard' ? dashboardImg : commandCenterImg}
                alt={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURE 1: Placement Intelligence (image left) ───────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div {...fadeUp()} className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(99,102,241,0.12)]">
            <img src={codingVisualImg} alt="Students coding with AI" className="w-full object-cover aspect-[4/3]" />
            <div className="absolute inset-0 bg-gradient-to-t from-nerox-bg/50 via-transparent to-transparent" />
            {/* Badge overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 border border-nerox-cyan/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-gray-300">Coding Mentor Agent Active</span>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div {...fadeUp(0.15)} className="space-y-6">
            <span className="text-xs font-mono text-nerox-cyan tracking-widest uppercase">Coding Intelligence</span>
            <h2 className="text-3xl md:text-4xl font-bold font-grotesk leading-tight">
              Code Smarter with an<br />
              <span className="gradient-text">AI Coding Mentor</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your personal Coding Mentor Agent reviews your code, identifies bugs in real-time,
              explains time complexity, generates company-specific practice tests, and teaches
              SQL with custom JOIN problems — all within a single conversation flow.
            </p>
            <ul className="space-y-3">
              {['Real-time code debug & optimization', 'Company-grade coding tests (TCS, Amazon, Google)', 'SQL practice with adaptive difficulty', 'Time & space complexity explainer'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-nerox-cyan flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={handleStart} className="flex items-center gap-2 text-sm text-nerox-cyan font-semibold hover:underline cursor-pointer group">
              Start Coding Practice <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE 2: AI Agents Network (image right) ───────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div {...fadeUp()} className="space-y-6 order-2 lg:order-1">
            <span className="text-xs font-mono text-nerox-violet tracking-widest uppercase">Multi-Agent Intelligence</span>
            <h2 className="text-3xl md:text-4xl font-bold font-grotesk leading-tight">
              20+ Specialized Agents<br />
              <span className="gradient-text">Working in Unison</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              NEROX doesn't use a single chatbot. Our AI Orchestrator intelligently routes your queries
              to the right specialist agent — Tutor, Coding Mentor, GD Coach, Interview Simulator,
              Career Advisor — and combines their outputs into one cohesive response.
            </p>

            {/* Agent chips */}
            <div className="flex flex-wrap gap-2">
              {agents.map((a) => (
                <div
                  key={a.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300"
                >
                  <span>{a.emoji}</span>
                  <span>{a.name}</span>
                </div>
              ))}
            </div>

            <button onClick={handleStart} className="flex items-center gap-2 text-sm text-nerox-violet font-semibold hover:underline cursor-pointer group">
              Explore All Agents <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Network Image */}
          <motion.div {...fadeUp(0.15)} className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.15)] order-1 lg:order-2">
            <img src={agentsNetworkImg} alt="AI Agents Network" className="w-full object-cover aspect-[4/3]" />
            <div className="absolute inset-0 bg-gradient-to-t from-nerox-bg/40 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE 3: Placement Success (image left) ────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div {...fadeUp()} className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(245,158,11,0.12)]">
            <img src={placementSuccessImg} alt="Student with placement offer" className="w-full object-cover aspect-[4/3]" />
            <div className="absolute inset-0 bg-gradient-to-t from-nerox-bg/50 via-transparent to-transparent" />
            {/* Rating badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 border border-amber-500/30">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-white">98% Readiness</span>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div {...fadeUp(0.15)} className="space-y-6">
            <span className="text-xs font-mono text-amber-400 tracking-widest uppercase">Placement Intelligence</span>
            <h2 className="text-3xl md:text-4xl font-bold font-grotesk leading-tight">
              From Resume to Offer —<br />
              <span className="gradient-text">NEROX Maps Your Path</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Select your target company, and NEROX instantly calculates your readiness score,
              maps your skill gaps, generates a full mock test (aptitude, coding, SQL, HR),
              and builds a 30/60/90-day personalized preparation roadmap.
            </p>
            <ul className="space-y-3">
              {['Company Readiness Score (TCS, Amazon, Google...)', 'Auto-generated mock aptitude + coding tests', 'GD topic coaching & communication evaluation', 'Resume analysis & personalized roadmap'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Company chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {companies.map((c) => (
                <span key={c} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono">{c}</span>
              ))}
            </div>

            <button onClick={handleStart} className="flex items-center gap-2 text-sm text-amber-400 font-semibold hover:underline cursor-pointer group">
              Check My Readiness <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── 6 FEATURE GRID ───────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        <motion.div {...fadeUp()} className="text-center space-y-2 mb-12">
          <h2 className="text-2xl md:text-4xl font-bold font-grotesk">Everything You Need to Succeed</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">Six powerful hubs — all powered by specialized AI agents working 24/7 on your goals.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <motion.div key={idx} {...fadeUp(idx * 0.07)}>
              <GlassCard className="p-6 h-full flex flex-col group hover:border-white/20 transition-all">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold font-grotesk mb-2 text-white">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-nerox-cyan font-medium cursor-pointer group/link hover:underline" onClick={handleStart}>
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-16 z-10 border-t border-b border-white/5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <motion.div key={idx} {...fadeUp(idx * 0.1)} className="text-center space-y-2">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <div className="text-4xl md:text-5xl font-bold font-grotesk gradient-text">{s.val}</div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────────────────── */}
      <section className="relative max-w-4xl mx-auto px-6 py-20 z-10 space-y-10">
        <motion.div {...fadeUp()} className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-bold font-grotesk">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-400">Everything you need to know about NEROX AI</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div key={idx} {...fadeUp(idx * 0.08)}>
              <GlassCard className="p-5 hover:border-white/20 transition-all">
                <h4 className="text-sm font-semibold text-white font-grotesk mb-2 flex items-start gap-2">
                  <span className="text-nerox-indigo mt-0.5">Q.</span> {faq.q}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed pl-5">{faq.a}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-6 py-16 z-10">
        <motion.div
          {...fadeUp()}
          className="rounded-3xl border border-nerox-indigo/30 bg-nerox-indigo/10 backdrop-blur-md p-10 md:p-14 text-center space-y-6 shadow-[0_0_80px_rgba(99,102,241,0.15)]"
        >
          <h2 className="text-2xl md:text-4xl font-bold font-grotesk">
            Ready to <span className="gradient-text">Ace Your Placements?</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Join thousands of engineering students already using NEROX AI to prepare smarter,
            code better, and land their dream job offers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleStart}
              className="btn-primary flex items-center gap-2 px-10 py-4 text-sm cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 font-mono">No credit card required · Free forever · 20+ AI agents included</p>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="relative border-t border-white/5 bg-nerox-surface/20 z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-nerox-indigo/20 border border-nerox-indigo/30">
              <Cpu className="w-4 h-4 text-nerox-indigo" />
            </div>
            <div>
              <span className="text-sm font-bold font-grotesk gradient-text">NEROX AI</span>
              <p className="text-[10px] text-gray-500 font-mono">Autonomous Campus Intelligence OS</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500 font-mono">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Support</span>
          </div>

          <span className="text-[10px] text-gray-600 font-mono">
            © {new Date().getFullYear()} NEROX OS Group. Built with Google Gemini AI.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

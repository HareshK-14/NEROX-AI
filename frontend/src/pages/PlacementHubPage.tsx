import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Target, Briefcase, TestTube, Code2, Users, BarChart3, Map, Zap } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import PlacementAgentNav from '../components/placement/PlacementAgentNav';
import ReadinessAgent from '../components/placement/ReadinessAgent';
import CompanyExplorerAgent from '../components/placement/CompanyExplorerAgent';
import MockTestAgent from '../components/placement/MockTestAgent';
import CodeEvaluatorAgent from '../components/placement/CodeEvaluatorAgent';
import GDCoachAgent from '../components/placement/GDCoachAgent';
import AnalyticsAgent from '../components/placement/AnalyticsAgent';
import StrategyAgent from '../components/placement/StrategyAgent';
import DailyMissionsAgent from '../components/placement/DailyMissionsAgent';

type TabId = 'readiness' | 'explorer' | 'test' | 'evaluate' | 'gd' | 'analytics' | 'strategy' | 'missions';

const TAB_META: Record<TabId, { label: string; icon: React.ReactNode; desc: string; color: string }> = {
  readiness:  { label: 'Company Readiness',     icon: <Target className="w-4 h-4" />,      desc: 'Know your placement score for any company in seconds',   color: 'from-indigo-500 to-violet-600' },
  explorer:   { label: 'Company Explorer',       icon: <Briefcase className="w-4 h-4" />,   desc: 'Deep-dive into company profiles, salary & interview patterns', color: 'from-violet-500 to-purple-600' },
  test:       { label: 'Mock Test Generator',    icon: <TestTube className="w-4 h-4" />,    desc: 'Company-specific placement tests with instant grading',   color: 'from-cyan-500 to-blue-600' },
  evaluate:   { label: 'Code Evaluator',         icon: <Code2 className="w-4 h-4" />,       desc: 'Deep code quality analysis across 6 technical dimensions', color: 'from-emerald-500 to-teal-600' },
  gd:         { label: 'GD Coach',               icon: <Users className="w-4 h-4" />,       desc: 'Practice group discussions with AI communication coach',  color: 'from-amber-500 to-orange-600' },
  analytics:  { label: 'Placement Analytics',    icon: <BarChart3 className="w-4 h-4" />,   desc: 'Live performance dashboard with AI-powered insights',     color: 'from-pink-500 to-rose-600' },
  strategy:   { label: 'Strategy Planner',       icon: <Map className="w-4 h-4" />,         desc: 'Personalized 30/60/90-day preparation roadmaps',         color: 'from-sky-500 to-cyan-600' },
  missions:   { label: 'Daily Missions',          icon: <Zap className="w-4 h-4" />,         desc: 'Gamified daily challenges to keep your prep on track',   color: 'from-yellow-400 to-amber-500' },
};

const PlacementHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabId>('readiness');
  const meta = TAB_META[activeTab];

  const renderAgent = () => {
    const variants = {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      exit:    { opacity: 0, y: -8 },
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activeTab === 'readiness'  && <ReadinessAgent />}
          {activeTab === 'explorer'   && <CompanyExplorerAgent />}
          {activeTab === 'test'       && <MockTestAgent />}
          {activeTab === 'evaluate'   && <CodeEvaluatorAgent />}
          {activeTab === 'gd'         && <GDCoachAgent />}
          {activeTab === 'analytics'  && <AnalyticsAgent />}
          {activeTab === 'strategy'   && <StrategyAgent />}
          {activeTab === 'missions'   && <DailyMissionsAgent />}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <PageWrapper>
      <div className="space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-[#0e0e24] to-[#070713] p-6">
          {/* Background glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-32 rounded-full bg-nerox-indigo/15 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-24 rounded-full bg-nerox-violet/10 blur-[50px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-nerox-indigo to-nerox-violet border border-white/15 shadow-[0_0_32px_rgba(99,102,241,0.4)]">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-black font-grotesk text-white tracking-tight">Placement Intelligence Hub</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-nerox-indigo/20 border border-nerox-indigo/40 text-nerox-indigo text-[10px] font-mono uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-nerox-indigo animate-pulse" />8 AI Agents
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans">Autonomous Multi-Agent Placement Operating System — powered by Google Gemini</p>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              {[
                { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'AI-Powered' },
                { icon: <Target className="w-3.5 h-3.5" />, label: 'Personalized' },
                { icon: <Zap className="w-3.5 h-3.5" />, label: 'Real-Time' },
              ].map(b => (
                <span key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-[10px] text-gray-400">
                  {b.icon}{b.label}
                </span>
              ))}
            </div>
          </div>

          {/* 8 Quick-pick agent cards (mini) */}
          <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {(Object.entries(TAB_META) as [TabId, typeof meta][]).map(([id, m]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  activeTab === id
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/12'
                }`}
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${m.color} opacity-90`}>{m.icon}</div>
                <span className="text-[9px] font-semibold text-gray-400 text-center leading-tight">{m.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Active Agent Banner ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-white/[0.03]"
          >
            <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${meta.color}`}>{meta.icon}</div>
            <div>
              <span className="text-xs font-bold text-white font-grotesk">{meta.label}</span>
              <p className="text-[10px] text-gray-500">{meta.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Agent Nav ────────────────────────────────────────────────── */}
        <PlacementAgentNav activeTab={activeTab} onTabChange={(id) => setActiveTab(id as TabId)} />

        {/* ── Agent Panel ──────────────────────────────────────────────── */}
        {renderAgent()}

      </div>
    </PageWrapper>
  );
};

export default PlacementHubPage;

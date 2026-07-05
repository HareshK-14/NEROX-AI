import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Briefcase, TestTube, Code2, Users,
  BarChart3, Map, Zap, ChevronRight
} from 'lucide-react';

export interface AgentTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

const AGENT_TABS: AgentTab[] = [
  { id: 'readiness',  label: 'Readiness',  icon: <Target className="w-4 h-4" />,     color: 'from-indigo-500 to-violet-600',  badge: 'AI' },
  { id: 'explorer',   label: 'Explorer',   icon: <Briefcase className="w-4 h-4" />,  color: 'from-violet-500 to-purple-600',  badge: '' },
  { id: 'test',       label: 'Mock Test',  icon: <TestTube className="w-4 h-4" />,   color: 'from-cyan-500 to-blue-600',      badge: 'NEW' },
  { id: 'evaluate',   label: 'Code Eval',  icon: <Code2 className="w-4 h-4" />,      color: 'from-emerald-500 to-teal-600',   badge: '' },
  { id: 'gd',         label: 'GD Coach',   icon: <Users className="w-4 h-4" />,      color: 'from-amber-500 to-orange-600',   badge: '' },
  { id: 'analytics',  label: 'Analytics',  icon: <BarChart3 className="w-4 h-4" />,  color: 'from-pink-500 to-rose-600',      badge: '' },
  { id: 'strategy',   label: 'Strategy',   icon: <Map className="w-4 h-4" />,        color: 'from-sky-500 to-cyan-600',       badge: '' },
  { id: 'missions',   label: 'Missions',   icon: <Zap className="w-4 h-4" />,        color: 'from-yellow-400 to-amber-500',   badge: 'XP' },
];

interface Props {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const PlacementAgentNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {AGENT_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isActive
                ? `bg-gradient-to-r ${tab.color} text-white border-white/20 shadow-lg`
                : 'bg-white/4 border-white/8 text-gray-400 hover:text-white hover:bg-white/8'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/25 text-white' : 'bg-nerox-indigo/30 text-nerox-indigo'
              }`}>
                {tab.badge}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="agent-underline"
                className="absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-white/50"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default PlacementAgentNav;

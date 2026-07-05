import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, Loader2, ChevronRight, Zap, Clock } from 'lucide-react';

export interface AgentPipelineStep {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'error';
  durationMs?: number;
}

interface Props {
  pipeline: AgentPipelineStep[];
  isRunning: boolean;
  primaryAgent?: string;
  summary?: string;
}

const AgentActivityPanel: React.FC<Props> = ({ pipeline, isRunning, primaryAgent, summary }) => {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [completedSet, setCompletedSet] = React.useState<Set<number>>(new Set());

  // Simulate step-by-step completion as agents run
  React.useEffect(() => {
    if (!isRunning || pipeline.length === 0) {
      if (!isRunning && pipeline.length > 0) {
        // Mark all done when finished
        setCompletedSet(new Set(pipeline.map((_, i) => i)));
        setActiveIdx(pipeline.length);
      }
      return;
    }

    setActiveIdx(0);
    setCompletedSet(new Set());

    let idx = 0;
    const interval = setInterval(() => {
      setCompletedSet(prev => new Set([...prev, idx]));
      idx++;
      setActiveIdx(idx);
      if (idx >= pipeline.length) clearInterval(interval);
    }, 900);

    return () => clearInterval(interval);
  }, [isRunning, pipeline]);

  if (pipeline.length === 0 && !isRunning) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-nerox-indigo/20 bg-[#08081a] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/6 bg-nerox-indigo/8">
        <div className="relative">
          <Brain className="w-4 h-4 text-nerox-indigo" />
          {isRunning && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-nerox-indigo animate-ping" />
          )}
        </div>
        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-nerox-indigo font-bold">
          NEROX AI Orchestrator
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {isRunning ? (
            <>
              <Loader2 className="w-3 h-3 text-nerox-cyan animate-spin" />
              <span className="text-[9px] font-mono text-nerox-cyan">Processing</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-mono text-emerald-400">Complete</span>
            </>
          )}
        </div>
      </div>

      {/* Pipeline */}
      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Orchestrator chip (always first) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-nerox-indigo/20 border border-nerox-indigo/40">
            <Brain className="w-3 h-3 text-nerox-indigo" />
            <span className="text-[10px] font-bold text-nerox-indigo">Orchestrator</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>

          {pipeline.map((step, i) => {
            const isDone = completedSet.has(i);
            const isActive = activeIdx === i && isRunning;
            const isPending = !isDone && !isActive;

            return (
              <React.Fragment key={step.id}>
                {/* Arrow */}
                <ChevronRight className="w-3.5 h-3.5 text-gray-700 shrink-0" />

                {/* Agent chip */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.12 }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all ${
                    isDone
                      ? 'bg-emerald-500/15 border-emerald-500/30'
                      : isActive
                      ? 'border-current/50'
                      : 'bg-white/4 border-white/8'
                  }`}
                  style={isActive ? { borderColor: step.color + '60', background: step.color + '15' } : {}}
                >
                  <span className="text-sm leading-none">{step.emoji}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-gray-500'
                    }`}
                    style={isActive ? { color: step.color } : {}}
                  >
                    {step.label}
                  </span>

                  {/* Status icon */}
                  {isActive && <Loader2 className="w-3 h-3 animate-spin" style={{ color: step.color }} />}
                  {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {isPending && !isRunning && <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />}
                </motion.div>
              </React.Fragment>
            );
          })}

          {!isRunning && pipeline.length > 0 && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-700 shrink-0" />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-nerox-indigo/20 border border-nerox-indigo/40"
              >
                <Zap className="w-3 h-3 text-nerox-gold" />
                <span className="text-[10px] font-bold text-nerox-gold">Final Response</span>
              </motion.div>
            </>
          )}
        </div>

        {/* Active agent description */}
        <AnimatePresence mode="wait">
          {isRunning && pipeline[activeIdx] && (
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 text-[10px] font-mono"
              style={{ color: pipeline[activeIdx]?.color || '#6366f1' }}
            >
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              {pipeline[activeIdx]?.label}: {pipeline[activeIdx]?.description}...
            </motion.div>
          )}
          {!isRunning && summary && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-[10px] text-gray-500 font-sans leading-relaxed"
            >
              {summary}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AgentActivityPanel;

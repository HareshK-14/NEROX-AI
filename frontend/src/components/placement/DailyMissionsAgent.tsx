import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Clock, Trophy, Star, Loader2, RefreshCw, Flame } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';

const typeEmoji: Record<string, string> = {
  coding:       '💻',
  aptitude:     '🧩',
  sql:          '🗄️',
  interview:    '🎙️',
  communication:'💬',
  reading:      '📚',
};

const typeColor: Record<string, string> = {
  coding:       'from-indigo-500 to-violet-600',
  aptitude:     'from-cyan-500 to-blue-600',
  sql:          'from-teal-500 to-cyan-600',
  interview:    'from-amber-500 to-orange-600',
  communication:'from-pink-500 to-rose-600',
  reading:      'from-emerald-500 to-teal-600',
};

const diffBadge: Record<string, string> = {
  easy:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard:   'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const DailyMissionsAgent: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [completing, setCompleting] = React.useState<string | null>(null);
  const [totalXP, setTotalXP] = React.useState(0);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/placement/missions');
      if (res.data.success) {
        const d = res.data.data;
        setData(d);
        setCompleted(d.completedMissions || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchMissions(); }, []);

  const handleComplete = async (mission: any) => {
    if (completed.includes(mission.id)) return;
    setCompleting(mission.id);
    try {
      const res = await api.post('/placement/missions/complete', { missionId: mission.id, points: mission.points });
      if (res.data.success) {
        setCompleted(res.data.data.completedMissions || []);
        setTotalXP(p => p + (mission.xp || mission.points || 0));
      }
    } catch (e) { console.error(e); }
    finally { setCompleting(null); }
  };

  const missions = data?.missions || [];
  const completedCount = completed.length;
  const totalMissions = missions.length;
  const progressPct = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  if (loading) {
    return (
      <GlassCard className="p-16 flex flex-col items-center justify-center" hover={false}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-2 border-yellow-500/20 border-t-yellow-400 mb-4" />
        <p className="text-xs font-mono text-gray-400 animate-pulse">Loading your daily missions...</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <GlassCard className="p-5" glow hover={false}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white font-grotesk">{data?.greeting || 'Daily Mission Board'}</h3>
            </div>
            <p className="text-xs text-gray-400">{data?.motivation || 'Complete missions to earn XP and badges'}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <div className="text-xl font-black font-grotesk text-nerox-gold">{totalXP + (data?.pointsEarned || 0)}</div>
              <div className="text-[9px] text-gray-500 uppercase font-mono">XP Earned</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black font-grotesk text-white">{completedCount}/{totalMissions}</div>
              <div className="text-[9px] text-gray-500 uppercase font-mono">Completed</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Today's Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
          </div>
        </div>

        {data?.daily_tip && (
          <div className="mt-3 p-2.5 rounded-xl bg-nerox-indigo/10 border border-nerox-indigo/20 text-[10px] text-nerox-indigo">
            💡 Tip: {data.daily_tip}
          </div>
        )}
      </GlassCard>

      {/* Mission cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {missions.map((mission: any) => {
          const isDone = completed.includes(mission.id);
          const isExpanded = expandedId === mission.id;
          const isCompleting = completing === mission.id;
          const gradient = typeColor[mission.type] || 'from-indigo-500 to-violet-600';

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                isDone ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/8 bg-white/[0.03] hover:border-white/15'
              }`}
              onClick={() => setExpandedId(isExpanded ? null : mission.id)}
            >
              {/* Top gradient bar */}
              <div className={`h-1 bg-gradient-to-r ${gradient} ${isDone ? 'opacity-50' : ''}`} />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-tr ${gradient} opacity-80 shrink-0`}>
                    {typeEmoji[mission.type] || '⚡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white truncate">{mission.title}</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${diffBadge[mission.difficulty] || diffBadge.medium}`}>
                        {mission.difficulty}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{mission.time_minutes}m
                      </span>
                      <span className="text-[10px] text-nerox-gold ml-auto">+{mission.xp || mission.points} XP</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{mission.description}</p>

                {/* Expand */}
                {isExpanded && mission.content && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/6 space-y-2"
                  >
                    <p className="text-xs text-gray-300 leading-relaxed">{mission.content}</p>
                    {mission.badge && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-nerox-gold" />
                        <span className="text-[10px] text-nerox-gold font-bold">{mission.badge} Badge</span>
                      </div>
                    )}
                    {(mission.resources || []).map((r: string, i: number) => (
                      <p key={i} className="text-[10px] text-nerox-cyan">📎 {r}</p>
                    ))}
                  </motion.div>
                )}

                {/* Complete button */}
                <div className="mt-3" onClick={e => e.stopPropagation()}>
                  {isDone ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />Mission Complete!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleComplete(mission)}
                      disabled={!!completing}
                      className={`w-full py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-all border bg-gradient-to-r ${gradient} text-white border-transparent hover:opacity-90`}
                    >
                      {isCompleting ? <><Loader2 className="inline w-3 h-3 animate-spin mr-1" />Completing...</> : '⚡ Mark Complete & Earn XP'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bonus section */}
      {progressPct === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-nerox-gold/10 to-amber-500/10 border border-nerox-gold/30 text-center space-y-2"
        >
          <Trophy className="w-8 h-8 text-nerox-gold mx-auto" />
          <h3 className="text-base font-black text-white font-grotesk">🎉 All Missions Complete!</h3>
          <p className="text-xs text-gray-400">Streak bonus +{data?.streak_bonus || 50} XP awarded. Come back tomorrow for new missions!</p>
        </motion.div>
      )}

      <div className="flex justify-end">
        <button onClick={fetchMissions} className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />Refresh Missions
        </button>
      </div>
    </div>
  );
};

export default DailyMissionsAgent;

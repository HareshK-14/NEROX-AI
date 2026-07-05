import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Bell, Calendar, Brain, ArrowRight, CornerDownLeft, Play, Cpu, AlertCircle } from 'lucide-react';
import api from '../../api';
import GlassCard from '../ui/GlassCard';
import LoadingOrb from '../ui/LoadingOrb';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showAIModal, setShowAIModal] = React.useState(false);
  
  // AI Orchestrator State
  const [query, setQuery] = React.useState('');
  const [isOrchestrating, setIsOrchestrating] = React.useState(false);
  const [orchestratorResult, setOrchestratorResult] = React.useState<any | null>(null);
  const [aiError, setAIError] = React.useState<string | null>(null);

  // Get Page Title from Location
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Command Center';
      case '/orchestrator': return '🧠 AI Command Center';
      case '/campus': return 'Campus Hub';
      case '/learning': return 'Smart Learning Hub';
      case '/coding': return 'Coding Hub';
      case '/placement': return 'Placement Intelligence';
      case '/career': return 'Career Advisor';
      case '/profile': return 'Student Profile';
      case '/settings': return 'System Settings';
      default: return 'NEROX AI';
    }
  };

  // Clock Update
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/profile/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, [location.pathname]);

  // Execute AI Orchestrator routing
  const handleOrchestrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsOrchestrating(true);
    setOrchestratorResult(null);
    setAIError(null);

    try {
      const res = await api.post('/orchestrator/query', { message: query });
      if (res.data.success) {
        setOrchestratorResult(res.data.data);
      } else {
        setAIError(res.data.message || 'Routing failed.');
      }
    } catch (err: any) {
      console.error(err);
      setAIError(err.response?.data?.message || 'Failed to connect to NEROX AI Orchestrator.');
    } finally {
      setIsOrchestrating(false);
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <>
      <header className="h-16 border-b border-nerox-border bg-nerox-bg/80 backdrop-blur-md px-6 flex items-center justify-between relative z-10 shrink-0 select-none">
        
        {/* Left Page Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold font-grotesk tracking-wide text-white">{getPageTitle()}</h2>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Clock Ticker */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-nerox-cyan" />
            <span>{formattedDate}</span>
            <span className="text-nerox-indigo font-bold">{formattedTime}</span>
          </div>

          {/* Quick AI Orchestrator Command Trigger */}
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-nerox-indigo to-nerox-violet hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all cursor-pointer border border-white/10 hover:-translate-y-0.5 duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Command Center</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-nerox-pink animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-nerox-surface border border-nerox-border rounded-2xl shadow-2xl p-4 overflow-hidden z-30">
                <div className="flex items-center justify-between pb-2 border-b border-nerox-border mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Notifications</span>
                  <span className="text-[10px] text-nerox-cyan font-mono cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <span className="text-xs text-gray-500 block text-center py-4">No recent campus notifications.</span>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-nerox-indigo/30 transition-all text-xs">
                        <span className="font-semibold text-white block font-grotesk">{n.title}</span>
                        <span className="text-gray-400 block mt-1 line-clamp-2">{n.message}</span>
                        <span className="text-[9px] text-gray-500 font-mono block mt-1">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AI COMMAND CENTER MODAL (ORCHESTRATOR DETECTOR) */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
          <GlassCard className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl" glow={true} hover={false}>
            
            {/* Modal Header */}
            <div className="p-4 border-b border-nerox-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-nerox-indigo/20 text-nerox-indigo border border-nerox-indigo/30">
                  <Brain className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-grotesk text-white">AI OPERATING SYSTEM ORCHESTRATOR</h3>
                  <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">Natural language multi-agent query compiler</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAIModal(false);
                  setQuery('');
                  setOrchestratorResult(null);
                  setAIError(null);
                }}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10 transition-all cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleOrchestrate} className="p-4 border-b border-nerox-border bg-nerox-surface/20 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. 'I want to prepare for Zoho' or 'Summarize AVL Tree rotations'..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-glass pr-10 font-sans"
                  disabled={isOrchestrating}
                  autoFocus
                />
                <div className="absolute right-3 top-3.5 flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  <span>Enter</span>
                  <CornerDownLeft className="w-3 h-3" />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isOrchestrating}
                className="btn-primary flex items-center justify-center gap-2 px-5 py-3 cursor-pointer shrink-0"
              >
                {isOrchestrating ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run</span>
                  </>
                )}
              </button>
            </form>

            {/* Execution / Orchestration Display */}
            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4">
              {isOrchestrating && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-nerox-indigo/10 border border-nerox-indigo/20 rounded-xl">
                    <Cpu className="w-5 h-5 text-nerox-indigo animate-spin" />
                    <div>
                      <span className="text-xs font-semibold text-white font-grotesk block">AI Orchestrator Thinking...</span>
                      <span className="text-[10px] text-gray-400 block font-mono">Parsing semantic request intent → resolving target agent</span>
                    </div>
                  </div>
                  <LoadingOrb text="Compiling agent outputs" />
                </div>
              )}

              {aiError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block font-grotesk">Orchestrator Compiler Error</span>
                    <span className="mt-1 block">{aiError}</span>
                  </div>
                </div>
              )}

              {orchestratorResult && (
                <div className="space-y-4">
                  {/* Routing Card */}
                  <div className="flex flex-col gap-2.5 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-white font-grotesk">Agent Routed Successfully</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="bg-nerox-bg/60 p-2 rounded-lg border border-nerox-border text-center">
                        <span className="text-[8px] text-gray-500 block font-mono">MODULE</span>
                        <span className="text-xs font-semibold font-grotesk text-nerox-cyan block uppercase tracking-wider">
                          {orchestratorResult.orchestration?.module}
                        </span>
                      </div>
                      <div className="bg-nerox-bg/60 p-2 rounded-lg border border-nerox-border text-center">
                        <span className="text-[8px] text-gray-500 block font-mono">ACTIVE AGENT</span>
                        <span className="text-xs font-semibold font-grotesk text-nerox-indigo block uppercase tracking-wider">
                          {orchestratorResult.orchestration?.agent}
                        </span>
                      </div>
                      <div className="bg-nerox-bg/60 p-2 rounded-lg border border-nerox-border text-center">
                        <span className="text-[8px] text-gray-500 block font-mono">CONFIDENCE</span>
                        <span className="text-xs font-semibold font-grotesk text-emerald-400 block font-mono">
                          {Math.round(orchestratorResult.orchestration?.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-normal mt-1 italic pl-1">
                      "{orchestratorResult.orchestration?.reasoning}"
                    </p>
                  </div>

                  {/* Final Response Display */}
                  <div className="border-t border-nerox-border pt-4">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                      <ArrowRight className="w-3.5 h-3.5 text-nerox-indigo" />
                      <span>Result output</span>
                    </div>

                    <div className="space-y-4">
                      {typeof orchestratorResult.response === 'object' ? (
                        Object.entries(orchestratorResult.response).map(([k, v]: any) => (
                          <div key={k} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block mb-1">
                              {k.replace(/_/g, ' ')}
                            </span>
                            {Array.isArray(v) ? (
                              <ul className="list-disc pl-4 space-y-1 text-sm text-gray-200">
                                {v.map((item: any, idx: number) => (
                                  <li key={idx}>
                                    {typeof item === 'object' ? JSON.stringify(item) : item}
                                  </li>
                                ))}
                              </ul>
                            ) : typeof v === 'object' && v !== null ? (
                              <pre className="text-xs font-mono text-gray-300 overflow-x-auto bg-black/40 p-2 rounded-lg">
                                {JSON.stringify(v, null, 2)}
                              </pre>
                            ) : (
                              <p className="text-sm text-gray-200 whitespace-pre-line">{String(v)}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-200 whitespace-pre-line bg-white/5 border border-white/5 p-3 rounded-xl">
                          {orchestratorResult.response}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!orchestratorResult && !isOrchestrating && !aiError && (
                <div className="text-center py-8 space-y-3">
                  <Brain className="w-10 h-10 text-nerox-indigo/30 mx-auto" />
                  <p className="text-xs text-gray-500 font-sans max-w-sm mx-auto leading-relaxed">
                    Enter any student inquiry, code challenge, placement training intent, or campus handbook query. NEROX AI Orchestrator compiles and executes across 20 agent nodes automatically.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
};

export default Navbar;

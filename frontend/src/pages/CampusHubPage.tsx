import React from 'react';
import { Building2, Calendar, BookOpen, Trophy, Send, BrainCircuit, Terminal } from 'lucide-react';
import api from '../api';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import AgentResponseCard from '../components/ui/AgentResponseCard';

const CampusHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'helpdesk' | 'timetable' | 'library' | 'events'>('helpdesk');
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [agentResponse, setAgentResponse] = React.useState<any | null>(null);

  const tabs = [
    { id: 'helpdesk', name: 'Student Helpdesk', icon: <Building2 className="w-4 h-4" /> },
    { id: 'timetable', name: 'Timetable Assistant', icon: <Calendar className="w-4 h-4" /> },
    { id: 'library', name: 'Library Assistant', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'events', name: 'Event Assistant', icon: <Trophy className="w-4 h-4" /> }
  ];

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAgentResponse(null);

    try {
      const endpoint = `/campus/${activeTab}`;
      const res = await api.post(endpoint, { 
        message: query,
        query: query 
      });
      if (res.data.success) {
        setAgentResponse(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setQuery('');
    setAgentResponse(null);
  }, [activeTab]);

  return (
    <PageWrapper>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-nerox-border">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-white">Campus Hub</h1>
          <p className="text-xs text-gray-400">Resolve college handbook FAQs, academic schedules, libraries, and workshop registration.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-nerox-cyan/15 border border-nerox-cyan/30 text-nerox-cyan text-xs font-mono font-medium">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Campus Fleet Connected</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-grotesk transition-all cursor-pointer border ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-nerox-indigo to-nerox-violet border-white/20 text-white shadow-lg' 
                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Interaction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Panel */}
        <GlassCard className="p-5 lg:col-span-1 space-y-4" hover={false}>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block mb-1">
              Active Agent Command
            </span>
            <h3 className="text-sm font-bold font-grotesk text-white">
              {activeTab === 'helpdesk' && 'Query handbook / CIA policies'}
              {activeTab === 'timetable' && 'Check specific schedules'}
              {activeTab === 'library' && 'Search textbook resources'}
              {activeTab === 'events' && 'Resolve upcoming workshops'}
            </h3>
          </div>

          <form onSubmit={handleQuery} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Your Prompt</label>
              <textarea
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  activeTab === 'helpdesk' 
                    ? "e.g. What are the attendance rules for semester exams and how many ODs can I claim?"
                    : activeTab === 'timetable' 
                    ? "e.g. Show today's classes and highlight assignment deadlines."
                    : activeTab === 'library' 
                    ? "e.g. Recommend textbooks for Data Structures and Algorithms with author details."
                    : "e.g. List any upcoming CSE hackathons with prize money."
                }
                className="input-glass font-sans text-xs resize-none"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer py-2.5 text-xs"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Invoke Agent</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Handbooks */}
          <div className="border-t border-nerox-border pt-4 text-xs space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">Agent Knowledge Base</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
              <span className="p-2 rounded bg-white/5 border border-white/5 font-mono">CSE lab rules</span>
              <span className="p-2 rounded bg-white/5 border border-white/5 font-mono">CIA weightage</span>
              <span className="p-2 rounded bg-white/5 border border-white/5 font-mono">OD policies</span>
              <span className="p-2 rounded bg-white/5 border border-white/5 font-mono">Exam timings</span>
            </div>
          </div>
        </GlassCard>

        {/* Response Panel */}
        <div className="lg:col-span-2 space-y-4">
          {loading && (
            <GlassCard className="p-10 flex items-center justify-center min-h-[40vh]" hover={false}>
              <div className="flex flex-col items-center gap-3">
                <Terminal className="w-6 h-6 animate-pulse text-nerox-indigo" />
                <span className="text-xs font-mono tracking-wider text-gray-400 animate-pulse">Invoking campus micro-agent...</span>
              </div>
            </GlassCard>
          )}

          {agentResponse && (
            <AgentResponseCard 
              agentName={activeTab.toUpperCase()}
              moduleName="CAMPUS"
              response={agentResponse}
            />
          )}

          {!agentResponse && !loading && (
            <GlassCard className="p-10 flex flex-col items-center justify-center min-h-[40vh] text-center border-dashed" hover={false}>
              <Building2 className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-xs font-sans text-gray-400 max-w-xs">
                Select an agent tab, fill in your query, and NEROX will load the compiled knowledge block.
              </span>
            </GlassCard>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default CampusHubPage;

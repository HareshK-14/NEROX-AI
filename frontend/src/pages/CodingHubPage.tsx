import React from 'react';
import { Code2, Terminal, Play, Bug, FileCode, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../api';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import AgentResponseCard from '../components/ui/AgentResponseCard';

const CodingHubPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = React.useState<'sandbox' | 'sql' | 'test'>('sandbox');
  const [code, setCode] = React.useState('');
  const [language, setLanguage] = React.useState('Java');
  const [loading, setLoading] = React.useState(false);
  const [agentResponse, setAgentResponse] = React.useState<any | null>(null);

  // SQL Assistant State
  const [sqlTask, setSqlTask] = React.useState('');

  // Coding Test State
  const [testLanguage, setTestLanguage] = React.useState('Java');
  const [testDifficulty, setTestDifficulty] = React.useState('easy');
  const [testActive, setTestActive] = React.useState(false);
  const [testPayload, setTestPayload] = React.useState<any | null>(null);
  const [testAnswers, setTestAnswers] = React.useState<any>({});
  const [testScore, setTestScore] = React.useState<number | null>(null);
  const [testFeedback, setTestFeedback] = React.useState<string | null>(null);

  const handleAction = async (operation: 'explain' | 'debug' | 'optimize' | 'dry_run') => {
    if (!code.trim()) return;

    setLoading(true);
    setAgentResponse(null);

    try {
      const endpoint = operation === 'debug' ? '/coding/debug' : '/coding/mentor';
      const res = await api.post(endpoint, {
        code,
        language,
        operation,
        question: operation === 'dry_run' ? 'Dry run this code line by line and show state.' : ''
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

  const handleSQLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sqlTask.trim()) return;

    setLoading(true);
    setAgentResponse(null);

    try {
      const res = await api.post('/coding/sql', { task: sqlTask });
      if (res.data.success) {
        setAgentResponse(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate Adaptive Test
  const generateCodingTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestPayload(null);
    setTestAnswers({});
    setTestScore(null);
    setTestFeedback(null);

    try {
      const res = await api.post('/coding/test', {
        language: testLanguage,
        difficulty: testDifficulty
      });
      if (res.data.success) {
        setTestPayload(res.data.data);
        setTestActive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit test
  const submitCodingTest = async () => {
    if (!testPayload || !testPayload.questions) return;
    setLoading(true);

    try {
      const questions = testPayload.questions;
      let score = 0;

      questions.forEach((q: any) => {
        const studentAns = testAnswers[q.id] || '';
        // Basic match grading
        if (q.expected_output && String(studentAns).trim().toLowerCase().includes(String(q.expected_output).trim().toLowerCase())) {
          score += q.marks;
        } else {
          // If student answered starter code or not empty, give partial marks
          if (studentAns.length > q.starter_code?.length + 10) {
            score += Math.round(q.marks * 0.5);
          }
        }
      });

      const totalMarks = questions.reduce((sum: number, q: any) => sum + q.marks, 0);

      const res = await api.post('/coding/test/submit', {
        testType: 'Coding Test',
        language: testLanguage,
        difficulty: testDifficulty,
        questions,
        answers: testAnswers,
        score,
        totalMarks
      });

      if (res.data.success) {
        setTestScore(score);
        setTestFeedback(res.data.data.feedback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setAgentResponse(null);
    setTestActive(false);
    setTestPayload(null);
    setTestScore(null);
  }, [activeSubTab]);

  return (
    <PageWrapper>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-nerox-border">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-white">Coding Hub</h1>
          <p className="text-xs text-gray-400">Coding mentor compiler, runtime bug solver, adaptive placement coding tests, and database designer.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
          <Code2 className="w-3.5 h-3.5" />
          <span>Debugger Node Active</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setActiveSubTab('sandbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-grotesk cursor-pointer transition-all border ${
            activeSubTab === 'sandbox' 
              ? 'bg-gradient-to-r from-nerox-indigo to-nerox-violet text-white border-white/20' 
              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Coding Sandbox</span>
        </button>
        <button
          onClick={() => setActiveSubTab('sql')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-grotesk cursor-pointer transition-all border ${
            activeSubTab === 'sql' 
              ? 'bg-gradient-to-r from-nerox-indigo to-nerox-violet text-white border-white/20' 
              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>SQL Designer</span>
        </button>
        <button
          onClick={() => setActiveSubTab('test')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-grotesk cursor-pointer transition-all border ${
            activeSubTab === 'test' 
              ? 'bg-gradient-to-r from-nerox-indigo to-nerox-violet text-white border-white/20' 
              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Adaptive AI Test</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Sandbox Panel */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Sandbox Editor Tab */}
          {activeSubTab === 'sandbox' && (
            <GlassCard className="p-4 flex flex-col h-[60vh]" hover={false}>
              <div className="flex items-center justify-between pb-3 border-b border-nerox-border mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white font-grotesk">
                  <Terminal className="w-4 h-4 text-nerox-cyan" />
                  <span>Sandbox Code Editor</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-nerox-surface border border-nerox-border text-xs px-2.5 py-1 rounded-lg text-white"
                >
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="C">C</option>
                  <option value="C++">C++</option>
                  <option value="SQL">SQL</option>
                </select>
              </div>

              {/* Editor Textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Paste your ${language} code here...\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Optimize logic");\n    }\n}`}
                className="flex-1 w-full bg-black/40 border border-nerox-border p-4 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-nerox-indigo/60 resize-none overflow-y-auto"
              />

              {/* Sandbox Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                <button
                  onClick={() => handleAction('explain')}
                  disabled={loading || !code}
                  className="px-3 py-2 text-xs font-semibold bg-white/5 border border-white/5 hover:border-nerox-indigo/30 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Explain Code
                </button>
                <button
                  onClick={() => handleAction('debug')}
                  disabled={loading || !code}
                  className="px-3 py-2 text-xs font-semibold bg-white/5 border border-white/5 hover:border-nerox-pink/30 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Bug className="w-3.5 h-3.5 text-nerox-pink" />
                  <span>Find Bugs</span>
                </button>
                <button
                  onClick={() => handleAction('optimize')}
                  disabled={loading || !code}
                  className="px-3 py-2 text-xs font-semibold bg-white/5 border border-white/5 hover:border-nerox-cyan/30 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Optimize Complexity
                </button>
                <button
                  onClick={() => handleAction('dry_run')}
                  disabled={loading || !code}
                  className="px-3 py-2 text-xs font-semibold bg-white/5 border border-white/5 hover:border-nerox-violet/30 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Dry Run Code
                </button>
              </div>
            </GlassCard>
          )}

          {/* SQL Designer Tab */}
          {activeSubTab === 'sql' && (
            <GlassCard className="p-5 space-y-4" hover={false}>
              <div className="flex items-center gap-2 pb-2 border-b border-nerox-border mb-1">
                <FileCode className="w-4 h-4 text-nerox-cyan" />
                <h3 className="text-sm font-bold font-grotesk text-white">SQL Query Compiler & DBA Assistant</h3>
              </div>

              <form onSubmit={handleSQLSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Describe table schema / query requirements</label>
                  <textarea
                    rows={4}
                    value={sqlTask}
                    onChange={(e) => setSqlTask(e.target.value)}
                    placeholder="e.g. Write a SQL query to select all students who have completed > 5 coding tests. The database tables are users(id, email), student_profiles(user_id, name), and coding_tests(user_id, id)."
                    className="input-glass text-xs resize-none"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary text-xs py-2.5 px-6">
                  {loading ? 'Synthesizing SQL query...' : 'Generate & Explain SQL'}
                </button>
              </form>
            </GlassCard>
          )}

          {/* Adaptive AI test practice */}
          {activeSubTab === 'test' && testActive && testPayload && (
            <GlassCard className="p-5 space-y-4" hover={false}>
              <div className="flex items-center justify-between pb-2 border-b border-nerox-border">
                <span className="text-xs font-bold font-grotesk text-white">ADAPTIVE PLACEMENT CODING ASSESSMENT</span>
                {testScore !== null && (
                  <span className="text-xs font-mono font-bold text-nerox-cyan">
                    Score: {testScore} / {testPayload.total_marks || 100}
                  </span>
                )}
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {testPayload.questions?.map((q: any, idx: number) => (
                  <div key={q.id || idx} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 text-xs">
                    <span className="font-semibold text-white block">Q{idx + 1}. {q.question}</span>
                    
                    {q.starter_code && (
                      <pre className="p-2.5 rounded bg-black/40 border border-nerox-border text-[10px] font-mono text-emerald-400 overflow-x-auto select-all">
                        {q.starter_code}
                      </pre>
                    )}

                    <textarea
                      rows={5}
                      value={testAnswers[q.id] || ''}
                      onChange={(e) => {
                        if (testScore === null) {
                          setTestAnswers({ ...testAnswers, [q.id]: e.target.value });
                        }
                      }}
                      placeholder="Write your executable answer code here..."
                      className="input-glass font-mono text-[10px] bg-black/30 mt-2 resize-none"
                      disabled={testScore !== null}
                    />

                    {testScore !== null && q.expected_output && (
                      <div className="mt-2.5 p-2 bg-nerox-indigo/5 border border-nerox-indigo/10 rounded-lg text-[10px] text-gray-400">
                        <span className="font-bold text-nerox-cyan block">EXPECTED OUTPUT</span>
                        "{q.expected_output}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {testScore === null ? (
                <button
                  type="button"
                  onClick={submitCodingTest}
                  disabled={loading}
                  className="btn-primary w-full py-2 text-xs"
                >
                  Submit Code Answers
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block font-grotesk">AI Evaluation Summary</span>
                      <span className="block mt-1 leading-normal font-sans text-gray-300">{testFeedback}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTestActive(false);
                      setTestPayload(null);
                      setTestScore(null);
                    }}
                    className="btn-ghost w-full py-2 text-xs"
                  >
                    Take another test
                  </button>
                </div>
              )}
            </GlassCard>
          )}

          {activeSubTab === 'test' && !testActive && (
            <GlassCard className="p-5 space-y-4" hover={false}>
              <div className="pb-2 border-b border-nerox-border">
                <h3 className="text-sm font-bold font-grotesk text-white">Start Adaptive Placement Assessment</h3>
                <p className="text-xs text-gray-400 mt-1">The AI will generate questions adjusting in difficulty based on your coding history.</p>
              </div>

              <form onSubmit={generateCodingTest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Language</label>
                  <select
                    value={testLanguage}
                    onChange={(e) => setTestLanguage(e.target.value)}
                    className="input-glass text-xs"
                  >
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="SQL">SQL</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Initial Difficulty</label>
                  <select
                    value={testDifficulty}
                    onChange={(e) => setTestDifficulty(e.target.value)}
                    className="input-glass text-xs"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn-primary md:col-span-2 text-xs py-2.5 mt-2">
                  {loading ? 'Compiling test paper...' : 'Launch Assessment'}
                </button>
              </form>
            </GlassCard>
          )}
        </div>

        {/* AI Agent Console logs */}
        <div className="lg:col-span-1 space-y-4">
          
          {loading && (
            <GlassCard className="p-10 flex items-center justify-center min-h-[40vh]" hover={false}>
              <div className="flex flex-col items-center gap-3">
                <Terminal className="w-6 h-6 animate-pulse text-nerox-indigo" />
                <span className="text-xs font-mono tracking-wider text-gray-400 animate-pulse font-light">
                  Querying Gemini coding parser...
                </span>
              </div>
            </GlassCard>
          )}

          {agentResponse && (
            <AgentResponseCard 
              agentName="CODING_MENTOR"
              moduleName="CODING"
              response={agentResponse}
            />
          )}

          {!agentResponse && !loading && (
            <GlassCard className="p-10 flex flex-col items-center justify-center min-h-[40vh] text-center border-dashed" hover={false}>
              <Code2 className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-xs font-sans text-gray-400 max-w-xs">
                Write code or tasks in the editor on the left and select an action to fetch compiler explanations.
              </span>
            </GlassCard>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default CodingHubPage;

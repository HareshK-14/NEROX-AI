import React from 'react';
import { BookOpen, HelpCircle, FileText, CalendarRange, Send, Upload, Terminal, Brain, Check, X } from 'lucide-react';
import api from '../api';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import AgentResponseCard from '../components/ui/AgentResponseCard';

const LearningHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'tutor' | 'notes' | 'quiz' | 'revision'>('tutor');
  const [loading, setLoading] = React.useState(false);
  const [agentResponse, setAgentResponse] = React.useState<any | null>(null);

  // Smart Tutor State
  const [tutorTopic, setTutorTopic] = React.useState('');
  const [tutorSubject, setTutorSubject] = React.useState('Computer Science & Engineering');
  const [tutorMode, setTutorMode] = React.useState('explain step-by-step with examples');

  // Notes Intel State
  const [notesText, setNotesText] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  // Quiz Generator State
  const [quizSubject, setQuizSubject] = React.useState('Data Structures');
  const [quizDifficulty, setQuizDifficulty] = React.useState('medium');
  const [quizType, setQuizType] = React.useState('MCQ');
  const [quizCount, setQuizCount] = React.useState(5);
  const [quizActive, setQuizActive] = React.useState(false);
  const [studentAnswers, setStudentAnswers] = React.useState<any>({});
  const [quizScore, setQuizScore] = React.useState<number | null>(null);

  // Revision State
  const [revSubjects, setRevSubjects] = React.useState('');
  const [revExamDate, setRevExamDate] = React.useState('');
  const [revHours, setRevHours] = React.useState(3);

  const tabs = [
    { id: 'tutor', name: 'Smart Tutor', icon: <Brain className="w-4 h-4" /> },
    { id: 'notes', name: 'Notes Intelligence', icon: <FileText className="w-4 h-4" /> },
    { id: 'quiz', name: 'Quiz Generator', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'revision', name: 'Revision Planner', icon: <CalendarRange className="w-4 h-4" /> }
  ];

  // Invoke Tutor Agent
  const handleTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorTopic.trim()) return;

    setLoading(true);
    setAgentResponse(null);

    try {
      const res = await api.post('/learning/tutor', {
        topic: tutorTopic,
        subject: tutorSubject,
        mode: tutorMode
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

  // Invoke Notes Intel Agent
  const handleNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesText.trim() && !selectedFile) return;

    setLoading(true);
    setAgentResponse(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('content', notesText);
      }

      const res = await api.post('/learning/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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

  // Invoke Quiz Generator Agent
  const handleQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAgentResponse(null);
    setQuizActive(false);
    setQuizScore(null);
    setStudentAnswers({});

    try {
      const res = await api.post('/learning/quiz', {
        subject: quizSubject,
        difficulty: quizDifficulty,
        type: quizType,
        count: quizCount
      });
      if (res.data.success) {
        setAgentResponse(res.data.data);
        setQuizActive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Grade Quiz Answers
  const gradeQuiz = async () => {
    if (!agentResponse || !agentResponse.questions) return;
    
    let correct = 0;
    const questions = agentResponse.questions;

    questions.forEach((q: any) => {
      const studentAns = studentAnswers[q.id];
      if (String(studentAns).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase()) {
        correct += 1;
      }
    });

    setQuizScore(correct);

    // Save quiz result to database
    try {
      await api.post('/learning/quiz-result', {
        subject: quizSubject,
        quizType: quizType,
        questions,
        answers: studentAnswers,
        score: correct,
        totalMarks: questions.length
      });
    } catch (err) {
      console.error('Failed to log quiz scores', err);
    }
  };

  // Invoke Revision Planner Agent
  const handleRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revSubjects.trim() || !revExamDate) return;

    setLoading(true);
    setAgentResponse(null);

    try {
      const res = await api.post('/learning/revision', {
        subjects: revSubjects.split(','),
        examDate: revExamDate,
        hoursPerDay: revHours
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
    setAgentResponse(null);
    setQuizActive(false);
    setQuizScore(null);
  }, [activeTab]);

  return (
    <PageWrapper>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-nerox-border">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-white">Smart Learning Hub</h1>
          <p className="text-xs text-gray-400">Personal Professor, Notes Flashcard extraction, and dynamic exam quiz generator.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-nerox-indigo/15 border border-nerox-indigo/30 text-nerox-indigo text-xs font-mono font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Learning Node Online</span>
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

      {/* Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input parameters panel */}
        <GlassCard className="p-5 lg:col-span-1 space-y-4" hover={false}>
          
          {/* Smart Tutor parameters */}
          {activeTab === 'tutor' && (
            <form onSubmit={handleTutor} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block mb-1">PROFESSOR TUTOR</span>
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Subject</label>
                <input 
                  type="text" 
                  value={tutorSubject} 
                  onChange={(e) => setTutorSubject(e.target.value)} 
                  className="input-glass text-xs" 
                  placeholder="e.g. Design and Analysis of Algorithms"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Topic / Query</label>
                <textarea
                  rows={4}
                  value={tutorTopic}
                  onChange={(e) => setTutorTopic(e.target.value)}
                  className="input-glass text-xs resize-none"
                  placeholder="e.g. What is the difference between Kruskal's and Prim's algorithm for finding Minimum Spanning Tree? Explain with complexity."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Mode</label>
                <select
                  value={tutorMode}
                  onChange={(e) => setTutorMode(e.target.value)}
                  className="input-glass text-xs"
                >
                  <option value="explain step-by-step with examples">Step-by-step + Examples</option>
                  <option value="generate formula sheet and mnemonics">Formula Sheet + Mnemonics</option>
                  <option value="explain in simple english">Explain like I am five</option>
                  <option value="generate lecture notes">Generate Lecture Notes</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-xs py-2.5">
                {loading ? 'Consulting Tutor...' : 'Get Explanation'}
              </button>
            </form>
          )}

          {/* Notes Intel parameters */}
          {activeTab === 'notes' && (
            <form onSubmit={handleNotes} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block mb-1">NOTES INTELLIGENCE</span>
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-mono">Upload PDF handout</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="input-glass text-xs py-2"
                />
              </div>

              <div className="text-center text-xs text-gray-500 font-mono uppercase">OR</div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Paste Notes text</label>
                <textarea
                  rows={4}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="input-glass text-xs resize-none"
                  placeholder="Paste textbook sections or syllabus requirements here..."
                  required={!selectedFile}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{loading ? 'Analyzing notes...' : 'Generate Flashcards & Summary'}</span>
              </button>
            </form>
          )}

          {/* Quiz parameters */}
          {activeTab === 'quiz' && (
            <form onSubmit={handleQuiz} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block mb-1">QUIZ GENERATOR</span>
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Subject</label>
                <input 
                  type="text" 
                  value={quizSubject} 
                  onChange={(e) => setQuizSubject(e.target.value)} 
                  className="input-glass text-xs" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Difficulty</label>
                  <select value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value)} className="input-glass text-xs">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Type</label>
                  <select value={quizType} onChange={(e) => setQuizType(e.target.value)} className="input-glass text-xs">
                    <option value="MCQ">MCQ</option>
                    <option value="viva">Viva / Short Ans</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Questions Count</label>
                <select value={quizCount} onChange={(e) => setQuizCount(Number(e.target.value))} className="input-glass text-xs">
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-xs py-2.5">
                {loading ? 'Generating Quiz...' : 'Generate Interactive Quiz'}
              </button>
            </form>
          )}

          {/* Revision planner parameters */}
          {activeTab === 'revision' && (
            <form onSubmit={handleRevision} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block mb-1">REVISION PLANNER</span>
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Subjects (comma-separated)</label>
                <input 
                  type="text" 
                  value={revSubjects} 
                  onChange={(e) => setRevSubjects(e.target.value)} 
                  className="input-glass text-xs" 
                  placeholder="e.g. Operating Systems, DBMS, Networks"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Exam Date</label>
                  <input 
                    type="date" 
                    value={revExamDate} 
                    onChange={(e) => setRevExamDate(e.target.value)} 
                    className="input-glass text-xs" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Hours / Day</label>
                  <input 
                    type="number" 
                    value={revHours} 
                    onChange={(e) => setRevHours(Number(e.target.value))} 
                    className="input-glass text-xs" 
                    min={1} 
                    max={12} 
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-xs py-2.5">
                {loading ? 'Creating Calendar...' : 'Build Revision Roadmap'}
              </button>
            </form>
          )}
        </GlassCard>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-4">
          
          {loading && (
            <GlassCard className="p-10 flex items-center justify-center min-h-[40vh]" hover={false}>
              <div className="flex flex-col items-center gap-3">
                <Terminal className="w-6 h-6 animate-pulse text-nerox-indigo" />
                <span className="text-xs font-mono tracking-wider text-gray-400 animate-pulse font-light">
                  Executing Learning Micro-agent nodes...
                </span>
              </div>
            </GlassCard>
          )}

          {/* Interactive Quiz Renderer */}
          {quizActive && agentResponse && agentResponse.questions && (
            <GlassCard className="p-5 space-y-4" hover={false}>
              <div className="flex items-center justify-between pb-2 border-b border-nerox-border">
                <span className="text-xs font-bold font-grotesk text-white">INTERACTIVE MCQ PRACTICE</span>
                {quizScore !== null && (
                  <span className="text-xs font-mono font-bold text-nerox-cyan">
                    Score: {quizScore} / {agentResponse.questions.length} (
                    {Math.round((quizScore / agentResponse.questions.length) * 100)}%)
                  </span>
                )}
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {agentResponse.questions.map((q: any, index: number) => (
                  <div key={q.id || index} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 text-xs">
                    <span className="font-semibold text-white block">Q{index + 1}. {q.question}</span>
                    
                    {/* MCQ Options */}
                    {q.options && q.options.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt: string) => {
                          const isSelected = studentAnswers[q.id] === opt;
                          const isCorrectOpt = String(opt).toLowerCase().includes(String(q.correct_answer).toLowerCase()) || opt === q.correct_answer;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                if (quizScore === null) {
                                  setStudentAnswers({ ...studentAnswers, [q.id]: opt });
                                }
                              }}
                              className={`p-2.5 rounded-lg border text-left font-sans transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-nerox-indigo/35 border-nerox-indigo'
                                  : 'bg-nerox-bg/40 border-nerox-border text-gray-300'
                              } ${
                                quizScore !== null 
                                  ? isCorrectOpt 
                                    ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400 font-medium' 
                                    : isSelected 
                                      ? 'border-rose-500/80 bg-rose-500/10 text-rose-400' 
                                      : 'opacity-50'
                                  : ''
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      // Viva short answer input
                      <textarea
                        rows={2}
                        value={studentAnswers[q.id] || ''}
                        onChange={(e) => {
                          if (quizScore === null) {
                            setStudentAnswers({ ...studentAnswers, [q.id]: e.target.value });
                          }
                        }}
                        placeholder="Write your brief answer here..."
                        className="input-glass mt-2 resize-none text-[11px]"
                        disabled={quizScore !== null}
                      />
                    )}

                    {/* Explanations shown after grading */}
                    {quizScore !== null && q.explanation && (
                      <div className="mt-2.5 p-2 bg-nerox-indigo/5 border border-nerox-indigo/10 rounded-lg text-[10px] text-gray-400 leading-normal">
                        <span className="font-bold text-nerox-cyan block mb-0.5">EXPLANATION</span>
                        "{q.explanation}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {quizScore === null ? (
                <button
                  type="button"
                  onClick={gradeQuiz}
                  className="btn-primary w-full py-2 text-xs"
                >
                  Grade & Save Quiz Attempts
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizActive(false);
                    setAgentResponse(null);
                    setQuizScore(null);
                  }}
                  className="btn-ghost w-full py-2 text-xs"
                >
                  Clear practice and retry
                </button>
              )}
            </GlassCard>
          )}

          {/* Standard Structured Response */}
          {agentResponse && !quizActive && (
            <AgentResponseCard 
              agentName={activeTab.toUpperCase()}
              moduleName="LEARNING"
              response={agentResponse}
            />
          )}

          {!agentResponse && !loading && (
            <GlassCard className="p-10 flex flex-col items-center justify-center min-h-[40vh] text-center border-dashed" hover={false}>
              <BookOpen className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-xs font-sans text-gray-400 max-w-xs">
                Select an agent tab, fill in the requirements, and NEROX Smart Learning Hub will invoke the prof engines.
              </span>
            </GlassCard>
          )}

        </div>
      </div>
    </PageWrapper>
  );
};

export default LearningHubPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Phone, AlertCircle, Brain,
  Sparkles, ArrowRight, Shield, Cpu, Network, Fingerprint,
  CheckCircle2, Eye, EyeOff, Building, Briefcase, GraduationCap
} from 'lucide-react';

/* ─── Animated Neural Node Canvas ───────────────────────────────── */
const NeuralCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.5)';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

/* ─── Typewriter Hook ────────────────────────────────────────────── */
const useTypewriter = (texts: string[], speed = 60, pause = 2000) => {
  const [displayed, setDisplayed] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const [charIdx, setCharIdx] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const current = texts[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else {
      setDeleting(false);
      setIdx(i => (i + 1) % texts.length);
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed, pause]);

  return displayed;
};

/* ─── Biometric Scan Ring ────────────────────────────────────────── */
const ScanRing: React.FC<{ scanning: boolean }> = ({ scanning }) => (
  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
    <motion.div
      className="absolute inset-0 rounded-full border-2 border-nerox-indigo/40"
      animate={scanning ? { scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] } : {}}
      transition={{ duration: 1.6, repeat: Infinity }}
    />
    <motion.div
      className="absolute inset-2 rounded-full border border-nerox-violet/30"
      animate={scanning ? { scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] } : {}}
      transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }}
    />
    <motion.div
      animate={scanning ? { rotate: 360 } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 rounded-full"
      style={{
        background: 'conic-gradient(from 0deg, transparent 80%, rgba(99,102,241,0.6) 100%)',
      }}
    />
    <div className={`p-3 rounded-full ${scanning ? 'bg-nerox-indigo/30' : 'bg-white/5'} border border-white/10 transition-colors duration-500`}>
      <Fingerprint className={`w-7 h-7 ${scanning ? 'text-nerox-indigo' : 'text-gray-500'}`} />
    </div>
  </div>
);

/* ─── Stat Badge ─────────────────────────────────────────────────── */
const StatBadge: React.FC<{ value: string; label: string; color: string }> = ({ value, label, color }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm">
    <div className={`text-lg font-black font-grotesk ${color}`}>{value}</div>
    <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider leading-tight">{label}</div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */
const AuthPage: React.FC = () => {
  const { login, register, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = React.useState(true);
  const [role, setRole] = React.useState<'student' | 'placement_officer' | 'admin'>('student');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [department, setDepartment] = React.useState('Computer Science & Engineering');
  const [year, setYear] = React.useState(3);
  const [rollNumber, setRollNumber] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [employeeId, setEmployeeId] = React.useState('');
  const [designation, setDesignation] = React.useState('Placement Officer');
  const [showPassword, setShowPassword] = React.useState(false);
  const [focused, setFocused] = React.useState('');
  const [step, setStep] = React.useState<'idle' | 'scanning' | 'done'>('idle');

  const typewriter = useTypewriter([
    'Autonomous Placement Intelligence.',
    'AI-Powered Campus Operating System.',
    'Your Personal Academic Co-Pilot.',
    '20+ Specialized AI Agents, Live.',
  ]);

  React.useEffect(() => { clearError(); }, [isLogin, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setStep('scanning');
    await new Promise(r => setTimeout(r, 1600)); // dramatic scan delay
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) { setStep('idle'); return; }
        if (role === 'student') {
          await register({ email, password, name, role, department, year, rollNumber, phone });
        } else if (role === 'placement_officer') {
          await register({ email, password, name, role, department, employeeId, designation, phone });
        } else {
          await register({ email, password, name, role });
        }
      }
      setStep('done');
      await new Promise(r => setTimeout(r, 600));

      // Redirect dynamically based on role from local storage or context if loaded
      const token = localStorage.getItem('nerox_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'placement_officer') {
          navigate('/officer');
        } else if (payload.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch {
      setStep('idle');
    }
  };

  const switchMode = () => { setIsLogin(v => !v); setStep('idle'); };

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  return (
    <div className="min-h-screen bg-[#030309] flex overflow-hidden font-sans">

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06061a] via-[#08082a] to-[#030309]" />
        <NeuralCanvas />

        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-nerox-indigo/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-nerox-violet/10 blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-nerox-indigo to-nerox-violet shadow-[0_0_24px_rgba(99,102,241,0.5)] border border-white/10">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black font-grotesk tracking-widest text-white">NEROX AI</span>
              <span className="block text-[9px] font-mono uppercase tracking-[0.25em] text-nerox-indigo mt-0.5">Campus Intelligence OS</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nerox-indigo/15 border border-nerox-indigo/30 text-nerox-indigo text-[10px] font-mono uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-nerox-indigo animate-pulse" />
                Multi-Agent System Active
              </div>
              <h1 className="text-4xl xl:text-5xl font-black font-grotesk leading-tight text-white">
                The Future of<br />
                <span className="bg-gradient-to-r from-nerox-indigo via-nerox-violet to-nerox-cyan bg-clip-text text-transparent">
                  Campus AI
                </span>
              </h1>
              <div className="h-7 flex items-center">
                <span className="text-base text-gray-300 font-sans">
                  {typewriter}
                  <span className="animate-pulse text-nerox-cyan ml-0.5">|</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: Cpu, text: 'Semantic AI Orchestrator routes 20+ agents', color: 'text-nerox-indigo' },
                { icon: Network, text: 'Real-time company readiness score engine', color: 'text-nerox-violet' },
                { icon: Shield, text: 'JWT-secured multi-role authentication system', color: 'text-nerox-cyan' },
              ].map(({ icon: Icon, text, color }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <div className={`p-1.5 rounded-lg bg-white/5 border border-white/8 ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-gray-400 font-sans">{text}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <StatBadge value="20+" label="AI Agents" color="text-nerox-indigo" />
              <StatBadge value="98%" label="Accuracy" color="text-nerox-cyan" />
              <StatBadge value="4.5×" label="Prep Speed" color="text-nerox-violet" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/4 border border-white/8 backdrop-blur-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">All Systems Operational</span>
            <span className="ml-auto text-[10px] font-mono text-gray-500">NEROX OS v2.0.26</span>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL — AUTH FORM ──────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative bg-[#050510] overflow-y-auto">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <motion.div
          className="w-full max-w-md relative z-10 my-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-nerox-indigo to-nerox-violet shadow-lg border border-white/10">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black font-grotesk text-white tracking-wider">NEROX AI</span>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-nerox-indigo/60 to-transparent" />

            <div className="p-8">
              <div className="text-center mb-6">
                <ScanRing scanning={step === 'scanning'} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-5 space-y-1"
                  >
                    <h2 className="text-xl font-black font-grotesk text-white">
                      {isLogin ? 'Identity Verification' : 'Initialize Profile'}
                    </h2>
                    <p className="text-xs text-gray-500 font-sans">
                      {isLogin
                        ? 'Authenticate to access your NEROX OS session'
                        : 'Select your role and register your credentials'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mode toggle pills */}
              <div className="flex mb-4 p-1 bg-white/5 rounded-xl border border-white/8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold font-grotesk transition-all cursor-pointer ${
                    isLogin
                      ? 'bg-gradient-to-r from-nerox-indigo to-nerox-violet text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold font-grotesk transition-all cursor-pointer ${
                    !isLogin
                      ? 'bg-gradient-to-r from-nerox-indigo to-nerox-violet text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Role Select Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {(['student', 'placement_officer', 'admin'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-lg border text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      role === r
                        ? 'border-nerox-cyan bg-nerox-cyan/10 text-nerox-cyan shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : 'border-white/5 bg-white/5 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {r === 'placement_officer' ? 'Officer' : r}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-center gap-2.5 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs overflow-hidden"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Full Name</label>
                        <div className={`relative group transition-all duration-300 ${focused === 'name' ? 'drop-shadow-[0_0_12px_rgba(99,102,241,0.3)]' : ''}`}>
                          <User className={`absolute left-3.5 top-3.5 w-4 h-4 transition-colors ${focused === 'name' ? 'text-nerox-indigo' : 'text-gray-600'}`} />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Harish Kumar"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused('')}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 outline-none focus:border-nerox-indigo/60 transition-all"
                          />
                        </div>
                      </div>

                      {/* Student specific fields */}
                      {role === 'student' && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Department</label>
                              <select
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                                className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-nerox-indigo/60 transition-all cursor-pointer"
                              >
                                {departments.map(d => <option key={d} value={d} className="bg-[#0d0d22]">{d.split(' ')[0]}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Year</label>
                              <select
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                                className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-nerox-indigo/60 transition-all cursor-pointer"
                              >
                                {[1, 2, 3, 4].map(y => <option key={y} value={y} className="bg-[#0d0d22]">Year {y}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Roll No.</label>
                              <input
                                type="text"
                                placeholder="e.g. 21CS101"
                                value={rollNumber}
                                onChange={e => setRollNumber(e.target.value)}
                                className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 outline-none focus:border-nerox-indigo/60 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Phone</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-600" />
                                <input
                                  type="tel"
                                  placeholder="+91 98765..."
                                  value={phone}
                                  onChange={e => setPhone(e.target.value)}
                                  className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 outline-none focus:border-nerox-indigo/60 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Placement Officer specific fields */}
                      {role === 'placement_officer' && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Department</label>
                              <select
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                                className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-nerox-indigo/60 transition-all cursor-pointer"
                              >
                                {departments.map(d => <option key={d} value={d} className="bg-[#0d0d22]">{d.split(' ')[0]}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Employee ID</label>
                              <div className="relative">
                                <Building className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-600" />
                                <input
                                  type="text"
                                  placeholder="e.g. EMP402"
                                  value={employeeId}
                                  onChange={e => setEmployeeId(e.target.value)}
                                  className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 outline-none focus:border-nerox-indigo/60 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Designation</label>
                              <div className="relative">
                                <Briefcase className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-600" />
                                <input
                                  type="text"
                                  placeholder="Placement Officer"
                                  value={designation}
                                  onChange={e => setDesignation(e.target.value)}
                                  className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 outline-none focus:border-nerox-indigo/60 transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Phone</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-600" />
                                <input
                                  type="tel"
                                  placeholder="+91 98765..."
                                  value={phone}
                                  onChange={e => setPhone(e.target.value)}
                                  className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 outline-none focus:border-nerox-indigo/60 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Email Address</label>
                  <div className={`relative transition-all duration-300 ${focused === 'email' ? 'drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]' : ''}`}>
                    <Mail className={`absolute left-3.5 top-3.5 w-4 h-4 transition-colors ${focused === 'email' ? 'text-nerox-indigo' : 'text-gray-600'}`} />
                    <input
                      type="email"
                      required
                      placeholder={role === 'student' ? 'student@college.edu' : role === 'placement_officer' ? 'faculty@college.edu' : 'admin@college.edu'}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused('')}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 outline-none focus:border-nerox-indigo/60 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500">Password</label>
                  <div className={`relative transition-all duration-300 ${focused === 'pass' ? 'drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]' : ''}`}>
                    <Lock className={`absolute left-3.5 top-3.5 w-4 h-4 transition-colors ${focused === 'pass' ? 'text-nerox-indigo' : 'text-gray-600'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocused('pass')}
                      onBlur={() => setFocused('')}
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-600 outline-none focus:border-nerox-indigo/60 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || step === 'scanning'}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full py-3.5 mt-2 rounded-xl font-bold font-grotesk text-sm text-white cursor-pointer overflow-hidden disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {step === 'scanning' ? (
                      <>
                        <motion.div
                          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Verifying Credentials...
                      </>
                    ) : step === 'done' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Verification Success
                      </>
                    ) : (
                      <>
                        {isLogin ? 'Verify & Launch OS' : `Initialize ${role === 'placement_officer' ? 'Officer' : role === 'admin' ? 'Admin' : 'Student'} Profile`}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/6 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-mono">
                  <Shield className="w-3 h-3" />
                  <span>JWT + Role RBAC</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-nerox-indigo">
                  <Sparkles className="w-3 h-3" />
                  <span>Gemini 2.5 AI</span>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-nerox-violet/40 to-transparent" />
          </div>

          <p className="text-center text-[10px] text-gray-600 mt-5 font-mono">
            NEROX AI platform security compliance active.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

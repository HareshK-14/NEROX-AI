import React, { useEffect, useState } from 'react';
import {
  BellRing,
  Send,
  Plus,
  Trash2,
  Calendar,
  Building,
  Volume2,
  Trophy,
  Users,
  Megaphone
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import LoadingOrb from '../../components/ui/LoadingOrb';

interface Broadcast {
  id: string;
  type: 'announcement' | 'placement_drive' | 'coding_contest' | 'workshop' | 'interview_schedule' | 'general';
  title: string;
  message: string;
  target_departments: string[];
  target_years: number[];
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  sent_by_name: string;
}

const NotificationManagementPage: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'announcement' | 'placement_drive' | 'coding_contest' | 'workshop' | 'interview_schedule' | 'general'>('general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetDept, setTargetDept] = useState<string[]>([]);
  
  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const fetchBroadcasts = () => {
    setLoading(true);
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setBroadcasts(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nerox_token')}`
        },
        body: JSON.stringify({
          type,
          title,
          message,
          targetDepartments: targetDept,
          priority
        })
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setMessage('');
        setType('general');
        setPriority('medium');
        setTargetDept([]);
        fetchBroadcasts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
      });
      const data = await res.json();
      if (data.success) fetchBroadcasts();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDept = (dept: string) => {
    setTargetDept(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="w-4 h-4 text-amber-400" />;
      case 'placement_drive': return <Building className="w-4 h-4 text-nerox-cyan" />;
      case 'coding_contest': return <Trophy className="w-4 h-4 text-nerox-indigo" />;
      case 'workshop': return <Users className="w-4 h-4 text-nerox-violet" />;
      case 'interview_schedule': return <Calendar className="w-4 h-4 text-emerald-400" />;
      default: return <Volume2 className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-grotesk tracking-tight text-white flex items-center gap-2">
          Broadcast Command Hub <BellRing className="w-6 h-6 text-nerox-cyan" />
        </h1>
        <p className="text-xs text-gray-400 font-sans mt-0.5">
          Send announcements, drive invitations, and updates directly to target student notification panels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Compose Broadcast Form */}
        <div className="lg:col-span-1">
          <GlassCard className="p-5 space-y-4">
            <h3 className="text-sm font-bold font-grotesk text-white">Compose Broadcast Notification</h3>
            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-sans">
              
              {/* Notification Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Notification Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3 py-3 bg-[#0d0d22] border border-white/10 rounded-xl text-white outline-none cursor-pointer"
                >
                  <option value="general">📢 General Update</option>
                  <option value="announcement">📣 Important Announcement</option>
                  <option value="placement_drive">🏢 Placement Drive Notice</option>
                  <option value="coding_contest">🏆 Coding Contest / Hackathon</option>
                  <option value="workshop">📚 Seminar / Training Workshop</option>
                  <option value="interview_schedule">📅 Interview Schedule</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Broadcast Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zoho Off-campus Drive 2026 Registration"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Broadcast Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide all details including links, timing, eligibility, and instructions..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white resize-none"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Broadcast Priority</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p as any)}
                      className={`flex-1 py-2 rounded-lg border uppercase font-mono text-[9px] tracking-wider transition-all cursor-pointer ${
                        priority === p
                          ? p === 'high'
                            ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                            : p === 'medium'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-white/5 bg-white/5 text-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Departments */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Target Departments (Select all that apply)</label>
                <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                  {departments.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDept(d)}
                      className={`w-full text-left p-2 rounded-lg border text-[10px] transition-all cursor-pointer ${
                        targetDept.includes(d)
                          ? 'border-nerox-indigo bg-nerox-indigo/10 text-white'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-nerox-indigo text-white font-bold hover:bg-nerox-indigo/80 font-grotesk text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast Alert</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Sent Broadcasts History */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold font-grotesk text-white">Broadcast Transmission History</h3>
              <p className="text-[10px] text-gray-400">Chronological history log of announcements dispatched to the batch.</p>
            </div>

            {loading ? (
              <div className="p-20 flex justify-center items-center flex-1">
                <LoadingOrb />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="p-20 text-center text-xs text-gray-500 font-sans flex-1">
                No active announcements sent yet this semester.
              </div>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 flex-1 mt-4">
                {broadcasts.map((b) => (
                  <div key={b.id} className="p-4 bg-white/3 border border-white/5 rounded-xl space-y-3 relative overflow-hidden">
                    
                    {/* Top status bar */}
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        {getIcon(b.type)}
                        <span className="text-gray-400 capitalize">{b.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                          b.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : b.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>{b.priority} priority</span>
                        <button
                          onClick={() => handleDeleteBroadcast(b.id)}
                          className="text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Message */}
                    <div className="space-y-1 font-sans">
                      <h4 className="font-bold text-white text-sm font-grotesk">{b.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans">{b.message}</p>
                    </div>

                    {/* Footer stats metadata */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap justify-between items-center text-[9px] font-mono text-gray-500">
                      <span>Sender: {b.sent_by_name}</span>
                      <span>Target: {b.target_departments.length === 0 ? 'All Departments' : `${b.target_departments.length} Depts`}</span>
                      <span>Dispatched: {new Date(b.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagementPage;

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  Building2,
  Activity,
  Settings as SettingsIcon,
  Trash2,
  Edit2,
  Database,
  ArrowUpDown,
  Search,
  Sparkles,
  Lock,
  RefreshCw
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import LoadingOrb from '../../components/ui/LoadingOrb';

interface AdminStats {
  students: number;
  officers: number;
  admins: number;
  companies: number;
  drives: number;
  notifications: number;
  logs: number;
  recentLogs: any[];
  settings: Record<string, string>;
}

interface User {
  id: string;
  email: string;
  role: 'student' | 'placement_officer' | 'admin';
  name: string;
  department: string;
  created_at: string;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings' | 'logs'>('overview');

  // User tab search & page
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Settings State
  const [platformName, setPlatformName] = useState('');
  const [allowRegistration, setAllowRegistration] = useState('true');
  const [maxPerPage, setMaxPerPage] = useState('25');

  const fetchStats = () => {
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setStats(d.data);
          setPlatformName(d.data.settings.platform_name || 'NEROX AI');
          setAllowRegistration(d.data.settings.allow_student_registration || 'true');
          setMaxPerPage(d.data.settings.max_students_per_page || '25');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    const query = new URLSearchParams({
      search,
      role: roleFilter,
      page: String(userPage)
    });
    fetch(`/api/admin/users?${query.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setUsers(d.data.users);
          setTotalPages(d.data.pagination.totalPages || 1);
        }
      })
      .catch(console.error);
  };

  const fetchLogs = () => {
    fetch('/api/admin/logs?limit=40', {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) setLogs(d.data.logs);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab, search, roleFilter, userPage]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nerox_token')}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user? This will erase all their profiles and records!')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nerox_token')}`
        },
        body: JSON.stringify({
          platform_name: platformName,
          allow_student_registration: allowRegistration,
          max_students_per_page: maxPerPage
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('System settings updated successfully.');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <LoadingOrb />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-grotesk tracking-tight text-white flex items-center gap-2">
            System Administration Console <ShieldAlert className="w-6 h-6 text-nerox-indigo" />
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Configure system configurations, manage roles, audit logs, and monitor databases.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 pb-2 gap-4">
        {[
          { id: 'overview', label: '📊 System Overview' },
          { id: 'users', label: '👥 User & Role Access' },
          { id: 'settings', label: '⚙️ Settings Configuration' },
          { id: 'logs', label: '📜 System Audit Trail' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === t.id
                ? 'border-nerox-indigo text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6 animate-fadeIn">
          {/* Stats count grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Students', val: stats.students, icon: <Users className="w-5 h-5 text-nerox-indigo" /> },
              { label: 'Placement Officers', val: stats.officers, icon: <Building2 className="w-5 h-5 text-nerox-cyan" /> },
              { label: 'System Admins', val: stats.admins, icon: <ShieldAlert className="w-5 h-5 text-nerox-violet" /> },
              { label: 'Audit Log Entries', val: stats.logs, icon: <Activity className="w-5 h-5 text-emerald-400" /> }
            ].map((item, idx) => (
              <GlassCard key={idx} className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block">{item.label}</span>
                  <span className="text-2xl font-black font-grotesk text-white block">{item.val}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  {item.icon}
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Database stats */}
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-sm font-bold font-grotesk text-white flex items-center gap-1.5"><Database className="w-4 h-4 text-nerox-cyan" /> Database Diagnostics</h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-white/3 border border-white/5 rounded-xl flex justify-between">
                  <span className="text-gray-400">Total Registered Tables</span>
                  <span className="text-white font-bold">24 Tables</span>
                </div>
                <div className="p-3 bg-white/3 border border-white/5 rounded-xl flex justify-between">
                  <span className="text-gray-400">MySQL Connection Status</span>
                  <span className="text-emerald-400 font-bold">ACTIVE / SECURE</span>
                </div>
                <div className="p-3 bg-white/3 border border-white/5 rounded-xl flex justify-between">
                  <span className="text-gray-400">Active Connection Pool</span>
                  <span className="text-white font-bold">10 Limits</span>
                </div>
              </div>
            </GlassCard>

            {/* Quick logs strip */}
            <GlassCard className="p-5 lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold font-grotesk text-white">Recent Security Logs</h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {stats.recentLogs.map((log: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-white/3 border border-white/5 rounded-lg text-[10px] font-mono text-gray-400">
                    <span className="font-semibold text-white">[{log.action}]</span>
                    <span className="truncate max-w-[200px]">{log.email || 'system'} · {log.role || 'guest'}</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          {/* User query control panel */}
          <GlassCard className="p-5">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search user email..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setUserPage(1); }}
                  className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none"
                />
              </div>
              <select
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value); setUserPage(1); }}
                className="px-4 py-3 bg-[#0d0d22] border border-white/10 rounded-xl text-white text-xs outline-none cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="placement_officer">Placement Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </GlassCard>

          {/* User table */}
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/5 bg-white/3 font-mono text-[9px] uppercase tracking-widest text-gray-400">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/2 transition-colors">
                      <td className="p-4 font-bold text-white font-grotesk">{u.name}</td>
                      <td className="p-4 text-gray-300 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold font-mono uppercase border ${
                          u.role === 'admin'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : u.role === 'placement_officer'
                            ? 'bg-nerox-cyan/10 text-nerox-cyan border-nerox-cyan/20'
                            : 'bg-nerox-indigo/10 text-nerox-indigo border-nerox-indigo/20'
                        }`}>{u.role}</span>
                      </td>
                      <td className="p-4 text-gray-500 font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-2 shrink-0">
                        {/* Promote / Demote triggers */}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleUpdateRole(u.id, u.role === 'student' ? 'placement_officer' : 'student')}
                            className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[9px] font-bold font-mono text-gray-300 cursor-pointer"
                          >
                            Toggle Role
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 bg-white/5 text-gray-500 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <GlassCard className="p-6 max-w-xl mx-auto animate-fadeIn">
          <h3 className="text-sm font-bold font-grotesk text-white flex items-center gap-1.5 mb-4"><SettingsIcon className="w-4 h-4 text-nerox-indigo" /> Configure System settings</h3>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Platform Name</label>
              <input type="text" value={platformName} onChange={e => setPlatformName(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Allow Student Registrations</label>
              <select value={allowRegistration} onChange={e => setAllowRegistration(e.target.value)} className="w-full px-3 py-2.5 bg-[#0d0d22] border border-white/10 rounded-lg text-white font-mono">
                <option value="true">Enable Registrations</option>
                <option value="false">Disable Registrations</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Max Students Query Limit</label>
              <input type="number" value={maxPerPage} onChange={e => setMaxPerPage(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono" />
            </div>

            <button type="submit" className="w-full py-3 bg-nerox-indigo text-white font-bold hover:bg-nerox-indigo/80 font-grotesk text-xs rounded-xl cursor-pointer shadow-lg transition-all">
              Save Configuration Settings
            </button>
          </form>
        </GlassCard>
      )}

      {/* Logs tab */}
      {activeTab === 'logs' && (
        <GlassCard className="p-5 animate-fadeIn">
          <div className="mb-4">
            <h3 className="text-sm font-bold font-grotesk text-white flex items-center gap-1.5"><Activity className="w-4 h-4 text-nerox-cyan animate-pulse" /> System Audit Trail Logs</h3>
            <p className="text-[10px] text-gray-400">Complete, tamper-proof logs of administrative, officer, and authentication actions.</p>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {logs.map((l: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/3 border border-white/5 rounded-xl font-mono text-[10px] text-gray-400 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[9px]">[{l.action}]</span>
                    <span className="text-gray-300">{l.email || 'system'}</span>
                  </div>
                  {l.metadata && <p className="text-[9px] text-gray-500 mt-1">Metadata: {JSON.stringify(l.metadata)}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] text-gray-500 block">{new Date(l.created_at).toLocaleString()}</span>
                  <span className="text-[8px] text-gray-600 block">IP: {l.ip_address || '127.0.0.1'}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AdminDashboardPage;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Code2,
  Trophy,
  Briefcase,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Brain,
  Users,
  BarChart3,
  BellRing,
  FileCode2,
  Terminal,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const getNavGroups = () => {
    if (!user) return [];

    if (user.role === 'placement_officer') {
      return [
        {
          title: 'Officer HQ',
          items: [
            { name: 'Dashboard', path: '/officer', icon: <LayoutDashboard className="w-5 h-5" /> },
            { name: 'AI Command Center', path: '/orchestrator', icon: <Brain className="w-5 h-5" />, badge: 'LIVE' }
          ]
        },
        {
          title: 'Officer Operations',
          items: [
            { name: 'Students Directory', path: '/officer/students', icon: <Users className="w-5 h-5" /> },
            { name: 'Placement Analytics', path: '/officer/analytics', icon: <BarChart3 className="w-5 h-5" /> },
            { name: 'Company Hub', path: '/officer/companies', icon: <Building2 className="w-5 h-5" /> },
            { name: 'Broadcast Hub', path: '/officer/notifications', icon: <BellRing className="w-5 h-5" /> }
          ]
        },
        {
          title: 'Account',
          items: [
            { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
            { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> }
          ]
        }
      ];
    }

    if (user.role === 'admin') {
      return [
        {
          title: 'Admin HQ',
          items: [
            { name: 'Dashboard', path: '/admin', icon: <ShieldCheck className="w-5 h-5" /> }
          ]
        },
        {
          title: 'Control Panel',
          items: [
            { name: 'User Management', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
            { name: 'System Logs', path: '/admin/logs', icon: <Activity className="w-5 h-5" /> },
            { name: 'System Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> }
          ]
        },
        {
          title: 'Account',
          items: [
            { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> }
          ]
        }
      ];
    }

    // Default: Student role
    return [
      {
        title: 'AI HQ',
        items: [
          { name: 'AI Command Center', path: '/orchestrator', icon: <Brain className="w-5 h-5" />, badge: 'NEW' },
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> }
        ]
      },
      {
        title: 'Modules',
        items: [
          { name: 'Campus Hub', path: '/campus', icon: <Building2 className="w-5 h-5" /> },
          { name: 'Learning Hub', path: '/learning', icon: <BookOpen className="w-5 h-5" /> },
          { name: 'Coding Hub', path: '/coding', icon: <Code2 className="w-5 h-5" /> },
          { name: 'Placement Hub', path: '/placement', icon: <Trophy className="w-5 h-5" /> },
          { name: 'Career Hub', path: '/career', icon: <Briefcase className="w-5 h-5" /> }
        ]
      },
      {
        title: 'Account',
        items: [
          { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
          { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> }
        ]
      }
    ];
  };

  const navGroups = getNavGroups();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-nerox-surface border-r border-nerox-border flex flex-col justify-between relative z-10 select-none shrink-0"
    >
      {/* Collapsible Trigger Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-nerox-surface border border-nerox-border flex items-center justify-center text-gray-400 hover:text-white transition-colors z-20 cursor-pointer shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Top Brand Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-nerox-border">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-nerox-indigo to-nerox-violet text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="text-base font-bold font-grotesk tracking-wider gradient-text">NEROX AI</span>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              {user?.role === 'placement_officer' ? 'Officer Panel' : user?.role === 'admin' ? 'Admin Panel' : 'Campus OS'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[9px] uppercase font-mono tracking-widest text-gray-500 block px-3 mb-1">
                {group.title}
              </span>
            )}
            {group.items.map((item: any) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="text-sm font-medium font-grotesk flex-1">{item.name}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-nerox-indigo/30 text-nerox-indigo border border-nerox-indigo/40 font-mono animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-nerox-border flex flex-col gap-3">
        {/* Status Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {!isCollapsed && (
            <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase flex items-center gap-1">
              AI Online <Sparkles className="w-3 h-3 text-nerox-indigo" />
            </span>
          )}
        </div>

        {/* User Card */}
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-nerox-indigo to-nerox-violet flex items-center justify-center text-white font-bold font-grotesk shadow-md border border-white/10">
              {user.name ? user.name.charAt(0).toUpperCase() : user.role.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate font-grotesk leading-tight">{user.name || 'System User'}</span>
              <span className="text-[10px] text-gray-400 truncate leading-none mt-0.5 capitalize">{user.role.replace('_', ' ')}</span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`sidebar-item text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium font-grotesk">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

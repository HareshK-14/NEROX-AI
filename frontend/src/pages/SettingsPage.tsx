import React from 'react';
import { Settings, Shield, Bell, HardDrive, Info } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';

const SettingsPage: React.FC = () => {
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [notifySystem, setNotifySystem] = React.useState(true);
  const [accentColor, setAccentColor] = React.useState('indigo');

  return (
    <PageWrapper>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-nerox-border">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-white">System Settings</h1>
          <p className="text-xs text-gray-400">Configure theme variables, auth credentials, and toggle system notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Preferences */}
        <div className="space-y-6">
          {/* Notifications */}
          <GlassCard className="p-5 space-y-4" hover={false}>
            <div className="flex items-center gap-2 pb-2 border-b border-nerox-border">
              <Bell className="w-4 h-4 text-nerox-cyan" />
              <h3 className="text-sm font-bold font-grotesk text-white">Notification Rules</h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Email Alerts</span>
                  <span className="text-gray-400 block mt-0.5">Receive reports after mock placement tests.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyEmail} 
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-nerox-indigo"
                />
              </div>

              <div className="flex items-center justify-between border-t border-nerox-border pt-4">
                <div>
                  <span className="font-semibold text-white block">System Broadcasts</span>
                  <span className="text-gray-400 block mt-0.5">Show notifications panel updates from HODs.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifySystem} 
                  onChange={(e) => setNotifySystem(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-nerox-indigo"
                />
              </div>
            </div>
          </GlassCard>

          {/* Account Security */}
          <GlassCard className="p-5 space-y-4" hover={false}>
            <div className="flex items-center gap-2 pb-2 border-b border-nerox-border">
              <Shield className="w-4 h-4 text-nerox-pink" />
              <h3 className="text-sm font-bold font-grotesk text-white">Credentials Security</h3>
            </div>

            <form className="space-y-3 text-xs font-sans" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Current Password</label>
                <input type="password" placeholder="••••••••" className="input-glass" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">New Password</label>
                <input type="password" placeholder="••••••••" className="input-glass" />
              </div>
              <button type="submit" className="btn-primary py-2 px-6 text-xs cursor-pointer mt-1">
                Change Password
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Theme & Info */}
        <div className="space-y-6">
          {/* Theme customization */}
          <GlassCard className="p-5 space-y-4" hover={false}>
            <div className="flex items-center gap-2 pb-2 border-b border-nerox-border">
              <Settings className="w-4 h-4 text-nerox-violet" />
              <h3 className="text-sm font-bold font-grotesk text-white">Theme Customization</h3>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">Select Accent Accentuation</span>
              <div className="flex gap-2">
                {['indigo', 'violet', 'cyan', 'pink'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`px-3 py-2 rounded-xl font-mono text-[10px] uppercase font-bold border transition-all cursor-pointer ${
                      accentColor === color 
                        ? 'bg-gradient-to-tr from-nerox-indigo to-nerox-violet text-white border-white/20'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-gray-500 font-mono block mt-2">
                * NEROX AI defaults to dark-theme layouts for optimal code contrast.
              </span>
            </div>
          </GlassCard>

          {/* Database System details */}
          <GlassCard className="p-5 space-y-4" hover={false}>
            <div className="flex items-center gap-2 pb-2 border-b border-nerox-border">
              <HardDrive className="w-4 h-4 text-nerox-indigo" />
              <h3 className="text-sm font-bold font-grotesk text-white">System Information</h3>
            </div>

            <div className="space-y-2 text-xs font-sans text-gray-400">
              <div className="flex justify-between items-center py-1.5 border-b border-nerox-border/60">
                <span>OS Name</span>
                <span className="font-semibold text-white font-grotesk">NEROX AI Core</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-nerox-border/60">
                <span>Core Framework</span>
                <span className="font-mono text-white text-[10px]">React 18 + Vite (TypeScript)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-nerox-border/60">
                <span>Backend Gateway</span>
                <span className="font-mono text-white text-[10px]">Express REST APIs</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-nerox-border/60">
                <span>Database Client</span>
                <span className="font-mono text-white text-[10px]">MySQL 8.0</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span>AI Language Model</span>
                <span className="font-mono text-emerald-400 text-[10px] font-bold">Google Gemini 1.5 Flash</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SettingsPage;

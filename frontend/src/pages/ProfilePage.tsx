import React from 'react';
import { User, Phone, Github, Linkedin, Upload, FileCode, CheckCircle, Plus, Trash2, Award } from 'lucide-react';
import api from '../api';
import PageWrapper from '../components/layout/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import LoadingOrb from '../components/ui/LoadingOrb';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<any>(null);
  const [skills, setSkills] = React.useState<any[]>([]);

  // Update profile inputs
  const [name, setName] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [year, setYear] = React.useState(3);
  const [rollNumber, setRollNumber] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [linkedinUrl, setLinkedinUrl] = React.useState('');
  const [githubUrl, setGithubUrl] = React.useState('');

  // Skill input
  const [newSkillName, setNewSkillName] = React.useState('');
  const [newSkillProficiency, setNewSkillProficiency] = React.useState('intermediate');
  const [newSkillCategory, setNewSkillCategory] = React.useState('Technical');

  // File Uploads
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.success) {
        const data = res.data.data;
        setProfile(data.profile);
        setSkills(data.skills || []);

        // Load inputs
        setName(data.profile.name || '');
        setDepartment(data.profile.department || '');
        setYear(data.profile.year || 3);
        setRollNumber(data.profile.roll_number || '');
        setPhone(data.profile.phone || '');
        setBio(data.profile.bio || '');
        setLinkedinUrl(data.profile.linkedin_url || '');
        setGithubUrl(data.profile.github_url || '');
      }
    } catch (err) {
      console.error('Failed to load profile details', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    try {
      const res = await api.put('/profile', {
        name,
        department,
        year,
        rollNumber,
        phone,
        bio,
        linkedinUrl,
        githubUrl
      });
      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update student profile', err);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await api.post('/profile/skill', {
        skillName: newSkillName,
        proficiency: newSkillProficiency,
        category: newSkillCategory
      });
      if (res.data.success) {
        setSkills([...skills, res.data.data]);
        setNewSkillName('');
      }
    } catch (err) {
      console.error('Failed to add skill badge', err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      const res = await api.delete(`/profile/skill/${id}`);
      if (res.data.success) {
        setSkills(skills.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete skill badge', err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setAvatarFile(file);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfile({ ...profile, avatar_url: res.data.data.avatarUrl });
      }
    } catch (err) {
      console.error('Failed to upload avatar', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingOrb text="Parsing profile attributes..." />
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-nerox-border">
        <div>
          <h1 className="text-xl font-bold font-grotesk text-white">Student Profile</h1>
          <p className="text-xs text-gray-400">Configure personal settings, upload resumes, and audit verified skills catalog.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar and Info Summary */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 text-center space-y-4" hover={false}>
            {/* Avatar image representation */}
            <div className="relative w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-nerox-indigo to-nerox-violet flex items-center justify-center text-white text-3xl font-bold font-grotesk border-2 border-white/10 overflow-hidden shadow-lg">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{name ? name.charAt(0).toUpperCase() : 'S'}</span>
              )}

              {/* Upload Input Overlay */}
              <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-xs font-mono font-semibold">
                <Upload className="w-4 h-4 mr-1" />
                <span>Upload</span>
                <input type="file" onChange={handleAvatarUpload} className="hidden" accept="image/*" />
              </label>
            </div>

            <div>
              <h3 className="text-base font-bold font-grotesk text-white leading-tight">{name}</h3>
              <span className="text-xs text-gray-400 font-sans block mt-1">{department} • Year {year}</span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-gray-400 font-sans italic">
              "{bio || 'Add a short bio to highlight your coding interests or engineering target roles.'}"
            </div>

            {/* Achievements Showcase */}
            <div className="border-t border-nerox-border pt-4 space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block text-left">Earned Badges</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center">
                  <Award className="w-5 h-5 text-nerox-gold mb-1" />
                  <span className="text-[9px] font-mono text-gray-400 font-semibold uppercase">Streak</span>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center">
                  <FileCode className="w-5 h-5 text-nerox-cyan mb-1" />
                  <span className="text-[9px] font-mono text-gray-400 font-semibold uppercase">Coder</span>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-nerox-green mb-1" />
                  <span className="text-[9px] font-mono text-gray-400 font-semibold uppercase">Verified</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Inputs & Skills Edit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <GlassCard className="p-5" hover={false}>
            <div className="pb-3 border-b border-nerox-border mb-4 flex justify-between items-center">
              <span className="text-xs font-bold font-grotesk text-white">PROFILE DETAILS</span>
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Profile Saved</span>
                </span>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-glass" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Roll Number</label>
                  <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="input-glass" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Department</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="input-glass" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Year of Study</label>
                  <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-glass">
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-glass" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">LinkedIn URL</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input type="text" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="input-glass pl-9" placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">GitHub URL</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="input-glass pl-9" placeholder="https://github.com/..." />
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Short Bio</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="input-glass resize-none" placeholder="Describe your coding portfolio highlights..." />
              </div>

              <button type="submit" className="btn-primary py-2 px-6 text-xs cursor-pointer">
                Save Profile Information
              </button>
            </form>
          </GlassCard>

          {/* Skills Management */}
          <GlassCard className="p-5" hover={false}>
            <div className="pb-3 border-b border-nerox-border mb-4">
              <span className="text-xs font-bold font-grotesk text-white">SKILL BADGES REGISTRY</span>
            </div>

            {/* Current Skills Grid */}
            <div className="flex flex-wrap gap-2 mb-6">
              {skills.length === 0 ? (
                <span className="text-xs text-gray-500 italic">No skills added yet. Register below.</span>
              ) : (
                skills.map((skill) => (
                  <div 
                    key={skill.id} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white group"
                  >
                    <span className="font-semibold">{skill.skill_name}</span>
                    <span className="text-[9px] text-nerox-indigo uppercase font-mono">({skill.proficiency})</span>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-gray-500 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end border-t border-nerox-border pt-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Skill Name</label>
                <input 
                  type="text" 
                  value={newSkillName} 
                  onChange={(e) => setNewSkillName(e.target.value)} 
                  className="input-glass py-2 text-xs" 
                  placeholder="e.g. Java, React, SQL"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Proficiency</label>
                <select 
                  value={newSkillProficiency} 
                  onChange={(e) => setNewSkillProficiency(e.target.value)} 
                  className="input-glass py-2 text-xs"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-primary flex items-center justify-center gap-1 py-2 text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;

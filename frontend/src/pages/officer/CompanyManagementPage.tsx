import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  Award,
  CheckCircle,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import LoadingOrb from '../../components/ui/LoadingOrb';

interface Company {
  id: string;
  name: string;
  sector: string;
  min_cgpa: number;
  min_coding_score: number;
  required_skills: string[];
  package_lpa: number;
  drive_date: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  interview_pattern: string;
  coding_pattern: string;
  eligibility_criteria: string;
}

const CompanyManagementPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [minCgpa, setMinCgpa] = useState('6.0');
  const [minCodingScore, setMinCodingScore] = useState('50');
  const [packageLpa, setPackageLpa] = useState('8.0');
  const [driveDate, setDriveDate] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');
  const [interviewPattern, setInterviewPattern] = useState('');
  const [codingPattern, setCodingPattern] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');

  // AI Plan State
  const [aiPlan, setAiPlan] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const fetchCompanies = () => {
    setLoading(true);
    fetch('/api/companies', {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCompanies(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nerox_token')}`
        },
        body: JSON.stringify({
          name,
          sector,
          minCgpa: Number(minCgpa),
          minCodingScore: Number(minCodingScore),
          packageLpa: Number(packageLpa),
          driveDate: driveDate || null,
          status,
          interviewPattern,
          codingPattern,
          eligibilityCriteria,
          requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        resetForm();
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this company record?')) return;
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
      });
      const data = await res.json();
      if (data.success) fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  const generateAIPrepPlan = async (company: Company) => {
    setAiLoading(company.id);
    setAiPlan(null);
    try {
      const res = await fetch('/api/companies/ai-prep-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nerox_token')}`
        },
        body: JSON.stringify({
          companyName: company.name,
          targetStudents: `Students with CGPA >= ${company.min_cgpa}`,
          timelineWeeks: 6
        })
      });
      const d = await res.json();
      if (d.success) {
        setAiPlan({ companyId: company.id, plan: d.data });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const resetForm = () => {
    setName('');
    setSector('');
    setMinCgpa('6.0');
    setMinCodingScore('50');
    setPackageLpa('8.0');
    setDriveDate('');
    setStatus('upcoming');
    setInterviewPattern('');
    setCodingPattern('');
    setEligibilityCriteria('');
    setRequiredSkills('');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-grotesk tracking-tight text-white flex items-center gap-2">
            Company Management
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Register visiting companies, establish eligibility rules, and design evaluation patterns.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-nerox-indigo text-white hover:bg-nerox-indigo/80 rounded-xl text-xs font-bold font-grotesk cursor-pointer transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <LoadingOrb />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <GlassCard key={c.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-white/15 transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-nerox-cyan">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black font-grotesk text-white leading-none">{c.name}</h3>
                      <span className="text-[10px] text-gray-400 font-sans">{c.sector || 'SaaS / Tech'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCompany(c.id)}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Eligibility parameters */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-gray-400">
                  <div className="p-2 bg-white/3 border border-white/5 rounded-lg">
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-gray-500">Min CGPA</span>
                    <span className="font-bold text-white font-mono text-xs">{c.min_cgpa}</span>
                  </div>
                  <div className="p-2 bg-white/3 border border-white/5 rounded-lg">
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-gray-500">Min Coding</span>
                    <span className="font-bold text-white font-mono text-xs">{c.min_coding_score}</span>
                  </div>
                  <div className="p-2 bg-white/3 border border-white/5 rounded-lg">
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-gray-500">Package LPA</span>
                    <span className="font-bold text-nerox-indigo font-mono text-xs">{c.package_lpa} LPA</span>
                  </div>
                  <div className="p-2 bg-white/3 border border-white/5 rounded-lg">
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-gray-500">Drive Date</span>
                    <span className="font-bold text-white font-mono text-xs">{c.drive_date ? new Date(c.drive_date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                </div>

                {/* Patterns */}
                <div className="space-y-1.5 text-[10px] font-sans text-gray-400">
                  {c.interview_pattern && (
                    <div className="p-2.5 bg-white/3 border border-white/5 rounded-lg">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-gray-500">Interview Pattern</span>
                      <p className="text-gray-300 font-sans mt-0.5 max-h-[50px] overflow-y-auto leading-relaxed">{c.interview_pattern}</p>
                    </div>
                  )}
                  {c.coding_pattern && (
                    <div className="p-2.5 bg-white/3 border border-white/5 rounded-lg">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-gray-500">Coding Test Format</span>
                      <p className="text-gray-300 font-sans mt-0.5 max-h-[50px] overflow-y-auto leading-relaxed">{c.coding_pattern}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI generator triggers */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => generateAIPrepPlan(c)}
                  disabled={aiLoading !== null}
                  className="w-full py-2.5 rounded-xl bg-nerox-cyan/15 hover:bg-nerox-cyan/20 border border-nerox-cyan/30 text-nerox-cyan text-[10px] font-bold font-grotesk cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {aiLoading === c.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-nerox-cyan/30 border-t-nerox-cyan rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Generate AI preparation plan</span>
                </button>

                {aiPlan && aiPlan.companyId === c.id && (
                  <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-[10px] text-gray-300 font-mono leading-relaxed max-h-[140px] overflow-y-auto">
                    {aiPlan.plan.roadmap || aiPlan.plan.raw || 'Standard 6-week drive algorithm practice plan generated.'}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold font-grotesk text-white mb-4">Add Visiting Company</h3>
            <form onSubmit={handleAddCompany} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Company Name</label>
                  <input type="text" required placeholder="e.g. Zoho" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Sector</label>
                  <input type="text" placeholder="e.g. IT Product / SaaS" value={sector} onChange={e => setSector(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Min CGPA</label>
                  <input type="number" step="0.1" value={minCgpa} onChange={e => setMinCgpa(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Min Coding Score</label>
                  <input type="number" value={minCodingScore} onChange={e => setMinCodingScore(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Package LPA</label>
                  <input type="number" step="0.1" value={packageLpa} onChange={e => setPackageLpa(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Drive Date</label>
                  <input type="date" value={driveDate} onChange={e => setDriveDate(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Required Skills (Comma separated)</label>
                  <input type="text" placeholder="e.g. Java, DBMS, SQL" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Eligibility Criteria Description</label>
                <textarea rows={2} value={eligibilityCriteria} onChange={e => setEligibilityCriteria(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Interview Pattern</label>
                <textarea rows={2} placeholder="e.g. Round 1: Aptitude MCQ, Round 2: Technical Interview..." value={interviewPattern} onChange={e => setInterviewPattern(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Coding Test Pattern</label>
                <textarea rows={2} placeholder="e.g. 2 array questions, 1 string algorithm question..." value={codingPattern} onChange={e => setCodingPattern(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-nerox-indigo text-white hover:bg-nerox-indigo/80 font-bold cursor-pointer">Save Company</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default CompanyManagementPage;

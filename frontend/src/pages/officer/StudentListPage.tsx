import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  BarChart,
  Eye,
  Download
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import LoadingOrb from '../../components/ui/LoadingOrb';

interface Student {
  id: string;
  name: string;
  roll_number: string;
  department: string;
  year: number;
  phone: string;
  email: string;
  coding_score: number;
  sql_score: number;
  communication_score: number;
  overall_score: number;
  placement_readiness: number;
  avatar_url: string | null;
}

const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [minReadiness, setMinReadiness] = useState('0');
  const [maxReadiness, setMaxReadiness] = useState('100');

  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [sortBy, setSortBy] = useState('overall_score');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const fetchStudents = () => {
    setLoading(true);
    const query = new URLSearchParams({
      search,
      department,
      year,
      minReadiness,
      maxReadiness,
      page: String(page),
      limit: String(limit),
      sortBy,
      sortOrder
    });

    fetch(`/api/officer/students?${query.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('nerox_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.data.students);
          setTotalPages(data.data.pagination.totalPages || 1);
          setTotalStudents(data.data.pagination.total || 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [page, limit, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(o => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setPage(1);
  };

  const handleExportCSV = () => {
    // Generate simple client-side CSV download
    const headers = 'Name,Register No,Department,Year,Email,Phone,Overall Score,Readiness %,Coding Score,SQL Score,Comm Score\n';
    const rows = students.map(s => 
      `"${s.name}","${s.roll_number}","${s.department}",${s.year},"${s.email}","${s.phone}",${s.overall_score},${s.placement_readiness},${s.coding_score},${s.sql_score},${s.communication_score}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NEROX_AI_Students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-grotesk tracking-tight text-white flex items-center gap-2">
            Student Directory
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Query and filter the student cohort. Access individual student analytical profiles.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter / Query Form Panel */}
      <GlassCard className="p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          {/* Search box */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search name, register no, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-nerox-indigo/60 transition-all"
              />
            </div>
          </div>

          {/* Department filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-3 bg-[#0d0d22] border border-white/10 rounded-xl text-white text-xs outline-none cursor-pointer focus:border-nerox-indigo/60"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d.split(' ')[0]}</option>
              ))}
            </select>
          </div>

          {/* Year filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Year</label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full px-3 py-3 bg-[#0d0d22] border border-white/10 rounded-xl text-white text-xs outline-none cursor-pointer focus:border-nerox-indigo/60"
            >
              <option value="">All Years</option>
              {[1, 2, 3, 4].map(y => (
                <option key={y} value={String(y)}>Year {y}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-nerox-indigo text-white hover:bg-nerox-indigo/80 text-xs font-bold font-grotesk cursor-pointer transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            Filter Directory
          </button>
        </form>

        {/* Readiness Range Filter Slider Panel */}
        <div className="flex flex-wrap gap-6 items-center pt-4 mt-4 border-t border-white/5 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-sans">Min Readiness: <b className="text-nerox-cyan font-mono">{minReadiness}%</b></span>
            <input
              type="range"
              min="0"
              max="100"
              value={minReadiness}
              onChange={e => setMinReadiness(e.target.value)}
              className="w-32 accent-nerox-cyan cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-sans">Max Readiness: <b className="text-nerox-violet font-mono">{maxReadiness}%</b></span>
            <input
              type="range"
              min="0"
              max="100"
              value={maxReadiness}
              onChange={e => setMaxReadiness(e.target.value)}
              className="w-32 accent-nerox-violet cursor-pointer"
            />
          </div>
        </div>
      </GlassCard>

      {/* Main Student Directory Table */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center items-center">
            <LoadingOrb />
          </div>
        ) : students.length === 0 ? (
          <div className="p-20 text-center text-gray-500 font-sans text-xs">
            No students found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/5 bg-white/3">
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px] cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
                    <span className="flex items-center gap-1.5">Student <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px]">Department</th>
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px]">Year</th>
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px]">Email/Phone</th>
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px] cursor-pointer hover:text-white" onClick={() => toggleSort('overall_score')}>
                    <span className="flex items-center gap-1.5">Overall <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px] cursor-pointer hover:text-white" onClick={() => toggleSort('placement_readiness')}>
                    <span className="flex items-center gap-1.5">Readiness % <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px] cursor-pointer hover:text-white" onClick={() => toggleSort('coding_score')}>
                    <span className="flex items-center gap-1.5">Coding <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px] cursor-pointer hover:text-white" onClick={() => toggleSort('communication_score')}>
                    <span className="flex items-center gap-1.5">Comm <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 font-bold text-gray-400 uppercase tracking-widest font-mono text-[9px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-white/2 transition-colors">
                    {/* User profile details */}
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-nerox-indigo/25 flex items-center justify-center text-white font-bold font-grotesk border border-white/10 shrink-0">
                        {st.avatar_url ? (
                          <img src={st.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          st.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate text-sm font-grotesk">{st.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono tracking-wider">{st.roll_number}</p>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4 text-gray-300 font-grotesk">{st.department}</td>

                    {/* Year */}
                    <td className="p-4 font-mono text-gray-400">Year {st.year}</td>

                    {/* Email/Phone */}
                    <td className="p-4 space-y-0.5">
                      <p className="text-gray-400 truncate">{st.email}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{st.phone || 'N/A'}</p>
                    </td>

                    {/* Overall Success score */}
                    <td className="p-4 font-bold text-white font-mono">{st.overall_score}%</td>

                    {/* Placement readiness index */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${st.placement_readiness >= 70 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : st.placement_readiness >= 40 ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'}`} />
                        <span className="font-bold font-mono text-white">{st.placement_readiness}%</span>
                      </div>
                    </td>

                    {/* Coding score */}
                    <td className="p-4 font-mono text-nerox-cyan">{st.coding_score}/100</td>

                    {/* Communication score */}
                    <td className="p-4 font-mono text-nerox-violet">{st.communication_score}/100</td>

                    {/* Action buttons */}
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => navigate(`/officer/students/${st.id}`)}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Strip */}
        {!loading && totalStudents > 0 && (
          <div className="p-4 bg-white/3 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <span className="text-gray-500">
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalStudents)} of {totalStudents} students
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-white">Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default StudentListPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Alert from '../../components/Alert';
import { adminService } from '../../services/adminService';
import {
  ShieldCheck,
  Users,
  FileText,
  TrendingUp,
  Briefcase,
  Layers,
  ArrowRight,
  Clock,
  Trash2
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getStatistics();
        setStats(data);
      } catch (err) {
        setError('Failed to load administrator statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="admin" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0 space-y-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Administrator Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              System Operations & Metrics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Global overview of registered candidates, uploaded documents, ATS scoring trends, and platform usage.
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* KPI Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                {stats?.total_users ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Registered accounts</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resumes</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                {stats?.total_resumes ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">PDF & DOCX stored</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Analyses</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                {stats?.total_analyses ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Reports generated</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Matches</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                {stats?.total_job_matches ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Target comparisons</p>
            </div>
          </div>

          {/* Tables: Recent Users & Recent Analyses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Recently Registered Users</span>
                </h3>
                <Link to="/admin/users" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Manage All →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {(stats?.recent_users || []).map((u) => (
                  <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-slate-500 text-[11px]">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Analyses */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Recent Resume Evaluations</span>
                </h3>
                <Link to="/admin/resumes" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  View All →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {(stats?.recent_analyses || []).map((ra) => (
                  <div key={ra.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-900 truncate">{ra.file_name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{ra.user_name} ({ra.user_email})</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                        ATS: {ra.ats_score}%
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(ra.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

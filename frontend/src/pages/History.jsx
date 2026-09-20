import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import { resumeService } from '../services/resumeService';
import { formatFileSize } from '../utils/helpers';
import {
  History as HistoryIcon,
  FileText,
  Trash2,
  Eye,
  Briefcase,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';

export default function History() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await resumeService.getResumes();
      setResumes(data);
    } catch (err) {
      setError('Failed to fetch analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and its associated analyses?`)) {
      return;
    }

    try {
      await resumeService.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setSuccess('Resume record deleted successfully.');
    } catch (err) {
      setError('Failed to delete resume record.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="user" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <HistoryIcon className="w-6 h-6 text-indigo-600" />
              <span>Analysis History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View and manage your previous resume uploads, ATS evaluations, and job matches.
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              Loading your analysis history...
            </div>
          ) : resumes.length === 0 ? (
            <EmptyState
              icon={HistoryIcon}
              title="No Analysis History Found"
              description="Upload your first resume to see your complete evaluation report and history here."
              actionText="Upload Resume"
              actionLink="/upload"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold text-slate-500">
                    <tr>
                      <th className="py-3.5 px-6">Resume Name</th>
                      <th className="py-3.5 px-6">Format</th>
                      <th className="py-3.5 px-6">Date Analyzed</th>
                      <th className="py-3.5 px-6">ATS Compatibility</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resumes.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] uppercase">
                            {r.file_type}
                          </div>
                          <span className="truncate max-w-xs">{r.file_name}</span>
                        </td>

                        <td className="py-4 px-6 uppercase font-bold text-[10px] text-slate-400">
                          {r.file_type}
                        </td>

                        <td className="py-4 px-6 text-slate-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-6">
                          {r.latest_ats_score !== null && r.latest_ats_score !== undefined ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {r.latest_ats_score}%
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Pending</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            Completed
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/analysis/${r.id}`}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors"
                              title="View Analysis"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/job-match?resumeId=${r.id}`}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors"
                              title="Match with Job"
                            >
                              <Briefcase className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDelete(r.id, r.file_name)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

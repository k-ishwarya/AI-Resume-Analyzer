import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Alert from '../../components/Alert';
import { adminService } from '../../services/adminService';
import { Files, Trash2, Search, FileText } from 'lucide-react';

export default function ResumeManagement() {
  const [resumes, setResumes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await adminService.getResumes();
      setResumes(data);
    } catch (err) {
      setError('Failed to fetch resumes list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDelete = async (r) => {
    if (!window.confirm(`Are you sure you want to delete resume "${r.file_name}" uploaded by ${r.user_email}?`)) {
      return;
    }

    try {
      await adminService.deleteResume(r.id);
      setResumes((prev) => prev.filter((item) => item.id !== r.id));
      setSuccess(`Resume "${r.file_name}" deleted.`);
    } catch (err) {
      setError('Failed to delete resume.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filtered = resumes.filter(
    (r) =>
      r.file_name.toLowerCase().includes(search.toLowerCase()) ||
      r.user_email.toLowerCase().includes(search.toLowerCase()) ||
      r.user_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="admin" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Files className="w-6 h-6 text-indigo-600" />
                <span>Resume & Analysis Records</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Inspect document metadata, storage sizes, and delete orphaned or inappropriate uploads.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by file or candidate..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              Loading resume records...
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold text-slate-500">
                    <tr>
                      <th className="py-3.5 px-6">File Name</th>
                      <th className="py-3.5 px-6">Candidate</th>
                      <th className="py-3.5 px-6">File Size</th>
                      <th className="py-3.5 px-6">ATS Compatibility</th>
                      <th className="py-3.5 px-6">Uploaded Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] uppercase">
                            {r.file_type}
                          </div>
                          <span className="truncate max-w-xs">{r.file_name}</span>
                        </td>

                        <td className="py-4 px-6 text-slate-700">
                          <p className="font-semibold text-slate-900">{r.user_name}</p>
                          <p className="text-[11px] text-slate-400">{r.user_email}</p>
                        </td>

                        <td className="py-4 px-6 text-slate-500">
                          {formatFileSize(r.file_size)}
                        </td>

                        <td className="py-4 px-6">
                          {r.ats_score !== null && r.ats_score !== undefined ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {r.ats_score}%
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No score</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-slate-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Resume"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

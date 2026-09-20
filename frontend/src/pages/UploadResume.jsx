import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { resumeService } from '../services/resumeService';
import { analysisService } from '../services/analysisService';
import { Sparkles, ShieldCheck, FileCheck, CheckCircle } from 'lucide-react';

export default function UploadResume() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a PDF or DOCX resume to upload.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Upload & Extract text on backend
      const uploaded = await resumeService.uploadResume(selectedFile);

      // 2. Perform AI Analysis + ATS Scoring
      await analysisService.analyzeResume(uploaded.id);

      // 3. Redirect to analysis dashboard
      navigate(`/analysis/${uploaded.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to analyze resume. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="user" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Resume</h1>
              <p className="text-xs text-slate-500 mt-1">
                Select your resume to begin comprehensive ATS grading, skill detection, and AI review.
              </p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <LoadingSpinner
                  title="Extracting and Analyzing Resume..."
                  subtitle="Our system is running PyMuPDF extraction, evaluating section structure, and generating AI improvements."
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <FileUpload
                  selectedFile={selectedFile}
                  onFileSelect={(f) => {
                    setSelectedFile(f);
                    setError('');
                  }}
                  onClear={() => setSelectedFile(null)}
                />

                {selectedFile && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      File ready: <span className="font-semibold text-slate-800">{selectedFile.name}</span>
                    </div>

                    <button
                      onClick={handleUploadAndAnalyze}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Start Analysis</span>
                    </button>
                  </div>
                )}

                {/* Information cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-indigo-600" />
                      What will be analyzed?
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Personal info, degree/CGPA, categorized skills taxonomy, projects, work experience, certifications, and bullet point action verbs.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ATS & Privacy Guarantee
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      All scores reflect transparent ATS compatibility factors. Your data is stored securely and never shared with external recruiters.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

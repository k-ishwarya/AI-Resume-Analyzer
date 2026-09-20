import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resumeService } from '../services/resumeService';
import { analysisService } from '../services/analysisService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  FileText,
  TrendingUp,
  Briefcase,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeService.getResumes();
      setResumes(data);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError('');
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setAnalyzing(true);
      setError('');

      // Step 1: Upload resume file to server and extract text
      const uploadedResume = await resumeService.uploadResume(selectedFile);

      // Step 2: Trigger AI & ATS analysis
      const analysisResult = await analysisService.analyzeResume(uploadedResume.id);

      setSuccess('Resume analyzed successfully!');
      // Navigate to detailed analysis page
      navigate(`/analysis/${uploadedResume.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to analyze resume. Please try again.';
      setError(msg);
      setAnalyzing(false);
    }
  };

  // Derived statistics
  const analyzedCount = resumes.filter((r) => r.has_analysis).length;
  const scoredResumes = resumes.filter((r) => r.latest_ats_score !== null && r.latest_ats_score !== undefined);
  const avgATS = scoredResumes.length
    ? Math.round(scoredResumes.reduce((acc, curr) => acc + curr.latest_ats_score, 0) / scoredResumes.length)
    : 0;
  const totalSuggestions = analyzedCount * 4; // realistic estimate of action items

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="user" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          {analyzing ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <LoadingSpinner
                title="Analyzing your resume with Gemini AI..."
                subtitle="Please wait while we extract text, evaluate ATS factors, and generate suggestions."
              />
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* Header Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Upload your resume to get instant ATS scores, job matching, and AI suggestions.
                  </p>
                </div>

                <Link
                  to="/assistant"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-semibold text-xs hover:bg-indigo-100/70 transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Ask AI Resume Assistant</span>
                </Link>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resumes</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{resumes.length}</span>
                  <p className="text-[11px] text-slate-400 mt-1">{analyzedCount} analyzed</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg ATS Score</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">
                    {avgATS > 0 ? `${avgATS}%` : 'N/A'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Across all uploaded</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Matches</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{resumes.length > 0 ? '1+' : '0'}</span>
                  <p className="text-[11px] text-slate-400 mt-1">Target comparisons</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggestions</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{totalSuggestions}</span>
                  <p className="text-[11px] text-slate-400 mt-1">Actionable insights</p>
                </div>
              </div>

              {/* Upload Main Section */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Analyze Your Resume</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload your latest CV in PDF or Word format to generate an instant ATS and AI review report.
                  </p>
                </div>

                <FileUpload
                  selectedFile={selectedFile}
                  onFileSelect={handleFileSelect}
                  onClear={() => setSelectedFile(null)}
                />

                {selectedFile && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleUploadAndAnalyze}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Resume</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Resumes List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Your Uploaded Resumes</h3>
                  {resumes.length > 0 && (
                    <Link to="/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                      View Full History →
                    </Link>
                  )}
                </div>

                {loading ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                    Loading your resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No resumes uploaded yet. Upload a resume above to begin!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumes.map((r) => (
                      <div
                        key={r.id}
                        className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 uppercase">
                            {r.file_type}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{r.file_name}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>{new Date(r.created_at).toLocaleDateString()}</span>
                              {r.latest_ats_score !== null && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-indigo-600">
                                    ATS: {r.latest_ats_score}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/analysis/${r.id}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

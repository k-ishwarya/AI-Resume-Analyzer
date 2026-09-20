import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { resumeService } from '../services/resumeService';
import { analysisService } from '../services/analysisService';
import {
  Sparkles,
  Copy,
  Check,
  Wand2,
  FileEdit,
  ArrowRight,
  Info,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

export default function Suggestions() {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState('');

  // Project Improver Tool state (Section 14)
  const [projectName, setProjectName] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [improvingProject, setImprovingProject] = useState(false);
  const [improvedProjectResult, setImprovedProjectResult] = useState(null);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState(null);

  useEffect(() => {
    const fetchResumesAndAnalysis = async () => {
      try {
        setLoading(true);
        const list = await resumeService.getResumes();
        setResumes(list);

        let targetId = preselectedResumeId;
        if (!targetId && list.length > 0) {
          targetId = list[0].id;
        }

        if (targetId) {
          setSelectedResumeId(targetId.toString());
          try {
            const data = await analysisService.getLatestAnalysis(targetId);
            setAnalysis(data);
          } catch {
            // Not analyzed yet
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumesAndAnalysis();
  }, [preselectedResumeId]);

  const handleResumeChange = async (e) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    if (!id) {
      setAnalysis(null);
      return;
    }
    try {
      setLoading(true);
      const data = await analysisService.getLatestAnalysis(id);
      setAnalysis(data);
    } catch {
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyBullet = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIndex(index);
    setTimeout(() => setCopiedBulletIndex(null), 2000);
  };

  const handleImproveProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !technologies.trim() || !currentDescription.trim()) {
      setError('Please fill in all project fields.');
      return;
    }

    try {
      setImprovingProject(true);
      setError('');
      const result = await analysisService.improveProject(
        projectName.trim(),
        technologies.trim(),
        currentDescription.trim()
      );
      setImprovedProjectResult(result);
    } catch (err) {
      setError('Failed to improve project description. Please try again.');
    } finally {
      setImprovingProject(false);
    }
  };

  const fillSampleProject = () => {
    setProjectName('Campus Placement Portal');
    setTechnologies('React, Node.js, Express, PostgreSQL, Tailwind CSS');
    setCurrentDescription('I made a website for college placement drives where students can log in, view available companies, and apply for recruitment rounds.');
    setError('');
  };

  const suggestionsList = analysis?.suggestions || [
    {
      current: "Made a website using React and backend with Python.",
      suggested: "Architected a responsive full-stack web application leveraging React.js, FastAPI, and PostgreSQL with JWT-authenticated endpoints.",
      reason: "Uses stronger action verbs ('Architected', 'Leveraging') and specifies key architectural frameworks."
    },
    {
      current: "Worked with team on bug fixing and features.",
      suggested: "Collaborated in an agile scrum team of 5 engineers to debug regression issues and ship key feature releases ahead of sprint deadlines.",
      reason: "Replaces vague phrasing with concrete team collaboration, methodologies, and sprint delivery context."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="user" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0 space-y-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Resume Suggestions & Improver
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Refine passive bullet points into high-impact, professional phrasing and enhance your project descriptions without hallucination.
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Section 13: Sentence-by-sentence Weak vs Suggested */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <span>Resume Sentence Revisions</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Detected weak or passive phrases transformed into punchy, metric-oriented bullet points.
                </p>
              </div>

              {resumes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-medium">Resume:</span>
                    <select
                      value={selectedResumeId}
                      onChange={handleResumeChange}
                      className="text-xs py-1.5 px-3 border border-slate-300 rounded-lg bg-white outline-hidden font-medium"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.file_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Link
                    to={`/editor?resumeId=${selectedResumeId}`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Apply in Resume Editor</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {suggestionsList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Version */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                        Current Phrasing (Needs Improvement)
                      </span>
                      <p className="text-xs text-slate-700 italic">"{item.current}"</p>
                    </div>

                    {/* AI Suggested Version */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-1 relative">
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                        AI Recommended Version
                      </span>
                      <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                        "{item.suggested}"
                      </p>
                    </div>
                  </div>

                  {/* Reason & Copy button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800">Why this works:</strong> {item.reason}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(item.suggested, idx)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Suggestion</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 14: Project Description Improvement Tool */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-600" />
                  <span>Improve Project Description</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input your project details and let AI formulate professional resume bullet points with action verbs and technical keywords.
                </p>
              </div>

              <button
                type="button"
                onClick={fillSampleProject}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline self-start sm:self-auto"
              >
                Fill Sample Project
              </button>
            </div>

            <form onSubmit={handleImproveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. AI Placement Portal"
                    required
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Technologies Used *</label>
                  <input
                    type="text"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="e.g. React, Node.js, PostgreSQL, Docker"
                    required
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Description / Raw Draft *
                </label>
                <textarea
                  rows={4}
                  value={currentDescription}
                  onChange={(e) => setCurrentDescription(e.target.value)}
                  placeholder="Explain what the project does, your role, and what features were built..."
                  required
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 italic">
                  * AI is strictly instructed not to hallucinate fake metrics or unlisted technologies.
                </span>

                <button
                  type="submit"
                  disabled={improvingProject}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{improvingProject ? 'Improving with AI...' : 'Generate Improvements'}</span>
                </button>
              </div>
            </form>

            {/* Improvement Output */}
            {improvedProjectResult && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-5 animate-fade-in">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Synthesized Summary Description
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {improvedProjectResult.improved_description}
                  </p>
                </div>

                {/* 2-4 Resume Bullet Points with copy button */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Resume Ready Bullet Points (Click to Copy)
                  </span>
                  <div className="space-y-2">
                    {improvedProjectResult.bullet_points.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-800 leading-relaxed">{bullet}</span>
                        </div>
                        <button
                          onClick={() => handleCopyBullet(bullet, idx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 flex-shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBulletIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{copiedBulletIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Action Verbs & Keywords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Suggested Action Verbs
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {improvedProjectResult.suggested_action_verbs.map((verb, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {verb}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Relevant Technical Keywords
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {improvedProjectResult.technical_keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 text-slate-700">
                          {kw}
                        </span>
                      ))}
                    </div>
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

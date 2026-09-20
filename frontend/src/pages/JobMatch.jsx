import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ScoreCard from '../components/ScoreCard';
import SkillBadge from '../components/SkillBadge';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import {
  Briefcase,
  Building2,
  FileText,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';

export default function JobMatch() {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const list = await resumeService.getResumes();
        setResumes(list);

        if (preselectedResumeId) {
          setSelectedResumeId(preselectedResumeId);
        } else if (list.length > 0) {
          setSelectedResumeId(list[0].id.toString());
        }

        // Also check if any recent match exists for this resume
        if (preselectedResumeId || (list.length > 0)) {
          const resId = preselectedResumeId || list[0].id;
          try {
            const matches = await jobService.getResumeJobMatches(resId);
            if (matches && matches.length > 0) {
              setMatchResult(matches[0]);
              setJobTitle(matches[0].job_title);
              setCompany(matches[0].company || '');
              setJobDescription(matches[0].job_description);
            }
          } catch {
            // No prior matches, fine
          }
        }
      } catch (err) {
        console.error('Error fetching resumes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [preselectedResumeId]);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select a resume to match.');
      return;
    }
    if (!jobTitle.trim()) {
      setError('Please enter the target job title.');
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError('Please paste a substantial job description (at least 30 characters).');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      const result = await jobService.matchJob(
        parseInt(selectedResumeId),
        jobTitle.trim(),
        company.trim(),
        jobDescription.trim()
      );
      setMatchResult(result);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to match resume with job description.';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const sampleJdFill = () => {
    setJobTitle('Full Stack Software Engineer');
    setCompany('TechCorp Global');
    setJobDescription(`We are seeking an ambitious Junior or Associate Full Stack Engineer.
Key Responsibilities:
- Build responsive, interactive web interfaces using React.js and modern CSS frameworks.
- Architect backend services with Python/FastAPI or Node.js.
- Work with relational databases like PostgreSQL.
- Containerize services with Docker and use Git for collaborative code reviews.
- Knowledge of AWS, CI/CD, and REST APIs is highly desirable.`);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="user" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0 space-y-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Match Resume With Job
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Compare your resume against any real job description to measure candidate alignment and uncover missing skill gaps.
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleMatch} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Select Resume */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Analyzed Resume *
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    required
                    className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  >
                    {resumes.length === 0 && <option value="">No resumes found - upload one first</option>}
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.file_name} {r.latest_ats_score ? `(ATS: ${r.latest_ats_score}%)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer, Frontend Dev"
                    required
                    className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company Name <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Startup, TechCorp"
                    className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Job Description Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Job Description *
                  </label>
                  <button
                    type="button"
                    onClick={sampleJdFill}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 underline"
                  >
                    Paste Sample JD
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the requirements, responsibilities, and qualifications from the target job posting..."
                  required
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-400">
                  AI will analyze keyword overlap, required tools, and experience seniority.
                </p>

                <button
                  type="submit"
                  disabled={analyzing || resumes.length === 0}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{analyzing ? 'Analyzing Match...' : 'Analyze Match'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Match Analysis Results */}
          {analyzing ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <LoadingSpinner
                title="Comparing Resume with Job Description..."
                subtitle="Calculating skill overlap, identifying keyword alignment, and evaluating experience depth."
              />
            </div>
          ) : matchResult ? (
            <div className="space-y-6">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Score Gauge */}
                <div className="lg:col-span-4">
                  <ScoreCard
                    score={matchResult.match_score}
                    title="Overall Job Match"
                    subtitle={`Compatibility for ${matchResult.job_title}`}
                    size="lg"
                  />
                </div>

                {/* Experience & Keywords Summary */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">Job Fit Evaluation</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {matchResult.company ? `${matchResult.company} • ` : ''}{matchResult.job_title}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Experience Level Match</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${
                            matchResult.experience_match === 'Good' ? 'text-emerald-600' :
                            matchResult.experience_match === 'Partial' ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {matchResult.experience_match} Fit
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Calculated against required seniority and years of experience indicators.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Relevant Industry Keywords</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(matchResult.keywords || []).map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-200 text-slate-700">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Resume matcher compares concrete skills directly mentioned in your CV. You can refine your project descriptions to better reflect these keywords!
                    </span>
                  </div>
                </div>
              </div>

              {/* Skill Gap Analysis Section (Section 12) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      <span>Skill Gap Analysis</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Comparison between your verified resume skills and the job's stated requirements.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Section 12 Standard</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matched Skills */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Already Have ({matchResult.matched_skills?.length || 0})</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(matchResult.matched_skills || []).length > 0 ? (
                        matchResult.matched_skills.map((s, i) => (
                          <SkillBadge key={i} name={s} variant="matched" />
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No exact skill matches detected.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
                    <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Missing / Recommended to Learn ({matchResult.missing_skills?.length || 0})</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(matchResult.missing_skills || []).length > 0 ? (
                        matchResult.missing_skills.map((s, i) => (
                          <SkillBadge key={i} name={s} variant="missing" />
                        ))
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold">
                          Excellent! You cover all required skills.
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-rose-700 italic pt-1">
                      Important: Only add these skills if you genuinely possess hands-on knowledge. Never fabricate qualifications.
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Strategic Match Recommendations</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(matchResult.suggestions || []).map((sugg, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span className="leading-relaxed">{sugg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

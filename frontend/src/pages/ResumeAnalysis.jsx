import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ScoreCard from '../components/ScoreCard';
import ProgressBar from '../components/ProgressBar';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import { analysisService } from '../services/analysisService';
import { resumeService } from '../services/resumeService';
import {
  FileText,
  User,
  GraduationCap,
  Wrench,
  FolderGit2,
  Briefcase,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileEdit,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe
} from 'lucide-react';

export default function ResumeAnalysis() {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [resumeList, setResumeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const resumes = await resumeService.getResumes();
        setResumeList(resumes);

        let targetId = resumeId;
        if (!targetId && resumes.length > 0) {
          // If no ID in URL, pick user's latest resume
          targetId = resumes[0].id;
        }

        if (targetId) {
          try {
            const data = await analysisService.getLatestAnalysis(targetId);
            setAnalysis(data);
          } catch (err) {
            // If resume has not been analyzed yet, analyze it
            const newAnalysis = await analysisService.analyzeResume(targetId);
            setAnalysis(newAnalysis);
          }
        }
      } catch (err) {
        console.error('Error loading analysis:', err);
        setError('Failed to load resume analysis. Please make sure the resume exists.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar mode="user" />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <LoadingSpinner title="Loading analysis report..." subtitle="Retrieving structured entities and scores." />
          </main>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar mode="user" />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <EmptyState
              title="No Resume Analysis Found"
              description="Upload a resume to generate an instant comprehensive ATS compatibility report."
              actionText="Upload Resume"
              actionLink="/upload"
            />
          </main>
        </div>
      </div>
    );
  }

  const {
    personal_info = {},
    education = [],
    skills = {},
    projects = [],
    experience = [],
    certifications = [],
    achievements = [],
    strengths = [],
    weaknesses = [],
    suggestions = [],
    ats_score = 0,
    ats_breakdown = {},
    file_name = "Resume.pdf"
  } = analysis;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="user" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0 space-y-8 animate-fade-in">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Top Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  Report Ready
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{file_name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Resume Analysis Dashboard
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/editor?resumeId=${analysis.resume_id}`}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Resume Studio</span>
              </Link>

              <Link
                to={`/job-match?resumeId=${analysis.resume_id}`}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Match With Job</span>
              </Link>

              <Link
                to={`/suggestions?resumeId=${analysis.resume_id}`}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Rewrite Tips</span>
              </Link>

              <Link
                to={`/assistant?resumeId=${analysis.resume_id}`}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask Assistant</span>
              </Link>
            </div>
          </div>

          {/* ATS Score & Factors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Circular Gauge */}
            <div className="lg:col-span-4">
              <ScoreCard
                score={ats_score}
                title="Estimated ATS Compatibility"
                subtitle="Calculated through transparent structural & semantic grading"
                size="lg"
              />
            </div>

            {/* Breakdown Progress Bars */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Scoring Factor Breakdown</h3>
                <span className="text-[11px] text-slate-400">Deterministic Heuristics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <ProgressBar
                  label="Contact Information"
                  value={ats_breakdown.contact_information || 90}
                  color="indigo"
                />
                <ProgressBar
                  label="Section Structure"
                  value={ats_breakdown.section_structure || 85}
                  color="blue"
                />
                <ProgressBar
                  label="Technical Skills"
                  value={ats_breakdown.skills || 80}
                  color="emerald"
                />
                <ProgressBar
                  label="Keywords & Verbs"
                  value={ats_breakdown.keywords || 75}
                  color="amber"
                />
                <ProgressBar
                  label="Projects & Impact"
                  value={ats_breakdown.projects || 82}
                  color="violet"
                />
                <ProgressBar
                  label="Readability & Formatting"
                  value={ats_breakdown.readability || 88}
                  color="indigo"
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                Notice: "Estimated ATS Compatibility" is a heuristic benchmark modeled after modern Applicant Tracking Systems.
              </p>
            </div>
          </div>

          {/* Strengths & Areas to Improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-6 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Detected Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-emerald-800">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-6 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Areas to Improve</span>
              </h3>
              <ul className="space-y-2 text-xs text-amber-800">
                {weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">⚠</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Personal Information & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <p className="font-semibold text-slate-800">{personal_info.name || 'Not detected'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <p className="font-semibold text-slate-800 truncate">{personal_info.email || 'Not detected'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <p className="font-semibold text-slate-800">{personal_info.phone || 'Not detected'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">LinkedIn</span>
                  <p className="font-semibold text-indigo-600 truncate">{personal_info.linkedin || 'Not linked'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">GitHub</span>
                  <p className="font-semibold text-indigo-600 truncate">{personal_info.github || 'Not linked'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Portfolio</span>
                  <p className="font-semibold text-indigo-600 truncate">{personal_info.portfolio || 'Not linked'}</p>
                </div>
              </div>
            </div>

            {/* Education Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Academic Background</h3>
              </div>

              {education.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No formal education entries extracted.</p>
              ) : (
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      <p className="font-bold text-slate-900">{edu.degree || 'Degree Program'}</p>
                      <p className="text-slate-600">{edu.college || 'Institution'}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        {edu.graduation_year && <span>Graduation: {edu.graduation_year}</span>}
                        {edu.cgpa_percentage && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-indigo-600">GPA/Score: {edu.cgpa_percentage}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Categorized Skills Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Extracted Skills Taxonomy</h3>
              </div>
              <span className="text-xs text-slate-400">Classified by Domain</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Programming Languages */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Languages</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skills.programming_languages || []).length > 0 ? (
                    skills.programming_languages.map((s, i) => (
                      <SkillBadge key={i} name={s} variant="primary" />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Frameworks */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Frameworks & Libs</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skills.frameworks || []).length > 0 ? (
                    skills.frameworks.map((s, i) => (
                      <SkillBadge key={i} name={s} variant="primary" />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Databases */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Databases</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skills.databases || []).length > 0 ? (
                    skills.databases.map((s, i) => (
                      <SkillBadge key={i} name={s} variant="primary" />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Developer Tools */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Developer Tools</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skills.tools || []).length > 0 ? (
                    skills.tools.map((s, i) => (
                      <SkillBadge key={i} name={s} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Cloud & DevOps */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Cloud / DevOps</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skills.cloud || []).length > 0 ? (
                    skills.cloud.map((s, i) => (
                      <SkillBadge key={i} name={s} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* AI & ML */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">AI / Machine Learning</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skills.ai_ml || []).length > 0 ? (
                    skills.ai_ml.map((s, i) => (
                      <SkillBadge key={i} name={s} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None detected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Projects Portfolio</h3>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No structured projects detected.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-slate-900">{proj.name}</h4>
                      <div className="flex flex-wrap gap-1">
                        {(proj.technologies || []).map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                    {(proj.key_contributions || []).length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 pt-1">
                        {proj.key_contributions.map((c, i) => (
                          <li key={i} className="leading-relaxed">{c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience Section */}
          {experience.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Work & Internship Experience</h3>
              </div>

              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{exp.role}</h4>
                        <p className="text-xs text-slate-600">{exp.company}</p>
                      </div>
                      {exp.duration && <span className="text-xs text-slate-400 font-medium">{exp.duration}</span>}
                    </div>

                    {(exp.responsibilities || []).length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 pt-1">
                        {exp.responsibilities.map((r, i) => (
                          <li key={i} className="leading-relaxed">{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Achievements */}
          {(certifications.length > 0 || achievements.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {certifications.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-800">Certifications</h3>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {certifications.map((c, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {achievements.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Award className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-800">Achievements</h3>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {achievements.map((a, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

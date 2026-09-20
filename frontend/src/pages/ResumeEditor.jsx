import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PrintableResume from '../components/PrintableResume';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { resumeService } from '../services/resumeService';
import { analysisService } from '../services/analysisService';
import {
  FileEdit,
  Download,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  Layers,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wrench,
  AlignLeft,
  Share2
} from 'lucide-react';

export default function ResumeEditor() {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [mobileView, setMobileView] = useState('split'); // 'edit', 'preview', 'split'

  const printableRef = useRef(null);

  // Core editable resume state
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: '',
    skills: {
      programming_languages: [],
      frameworks: [],
      databases: [],
      tools: [],
      cloud: [],
      other: []
    },
    projects: [],
    experience: [],
    education: [],
    certifications: []
  });

  // Load user resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const list = await resumeService.getResumes();
        setResumes(list);

        const targetId = preselectedResumeId || (list.length > 0 ? list[0].id.toString() : '');
        setSelectedResumeId(targetId);
      } catch (err) {
        console.error('Failed to load resumes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [preselectedResumeId]);

  // Load analysis data & initialize editor data
  useEffect(() => {
    if (!selectedResumeId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        // Check localStorage first
        const savedDraft = localStorage.getItem(`resume_editor_draft_${selectedResumeId}`);

        const analysisData = await analysisService.getLatestAnalysis(parseInt(selectedResumeId));
        setAnalysis(analysisData);
        setSuggestions(analysisData?.suggestions || []);

        if (savedDraft) {
          try {
            setResumeData(JSON.parse(savedDraft));
            showToast('Loaded saved local draft.');
            setLoading(false);
            return;
          } catch {
            // fallback to analysis data
          }
        }

        // Initialize from analysis report
        if (analysisData) {
          const personal = analysisData.personal_info || {};
          const skillsObj = analysisData.skills || {};
          const rawProjects = analysisData.projects || [];
          const rawExperience = analysisData.experience || [];
          const rawEducation = analysisData.education || [];

          // Format projects with bullet points if missing
          const formattedProjects = rawProjects.map((p) => ({
            name: p.name || 'Project Title',
            technologies: Array.isArray(p.technologies) ? p.technologies : (p.technologies ? [p.technologies] : []),
            link: p.link || '',
            description: p.description || '',
            bullet_points: p.key_contributions || (p.description ? [p.description] : ['Engineered responsive application logic with modular architecture.'])
          }));

          // Format experience
          const formattedExperience = rawExperience.map((e) => ({
            title: e.title || e.role || 'Software Engineer',
            company: e.company || 'Tech Solutions',
            location: e.location || '',
            duration: e.duration || '2023 - Present',
            bullet_points: e.responsibilities || ['Collaborated across engineering teams to ship high-impact features.']
          }));

          // Format education
          const formattedEducation = rawEducation.map((ed) => ({
            degree: ed.degree || 'Bachelor of Science / Technology',
            college: ed.college || ed.institution || 'University',
            graduation_year: ed.graduation_year || '2024',
            cgpa_percentage: ed.cgpa_percentage || ''
          }));

          setResumeData({
            personalInfo: {
              name: personal.name || 'Candidate Name',
              email: personal.email || '',
              phone: personal.phone || '',
              location: personal.location || 'Bengaluru, India',
              linkedin: personal.linkedin || '',
              github: personal.github || '',
              portfolio: personal.portfolio || ''
            },
            summary: 'Proactive and detail-oriented Software Engineer with strong hands-on proficiency in building scalable full-stack applications, designing robust RESTful APIs, and implementing responsive, user-centered web interfaces.',
            skills: {
              programming_languages: skillsObj.programming_languages || ['Python', 'JavaScript', 'SQL'],
              frameworks: skillsObj.frameworks || ['React.js', 'FastAPI', 'Node.js', 'Tailwind CSS'],
              databases: skillsObj.databases || ['PostgreSQL', 'MySQL', 'MongoDB'],
              tools: skillsObj.tools || ['Git', 'GitHub', 'VS Code', 'Postman'],
              cloud: skillsObj.cloud || ['AWS', 'Docker', 'Vercel'],
              other: skillsObj.other || ['REST APIs', 'Agile', 'OOP']
            },
            projects: formattedProjects.length > 0 ? formattedProjects : [
              {
                name: 'AI Resume Optimization Platform',
                technologies: ['React.js', 'Python', 'FastAPI', 'PostgreSQL', 'Tailwind CSS'],
                link: 'https://github.com/example/resume-ai',
                description: 'Full-stack platform delivering instant ATS scoring, job match analytics, and AI resume rewriting.',
                bullet_points: [
                  'Architected responsive, component-driven user interface leveraging React.js and Tailwind CSS for seamless cross-device usability.',
                  'Engineered scalable RESTful API endpoints using Python and FastAPI, handling multi-part file parsing and secure JWT authentication.',
                  'Implemented optimized database queries with PostgreSQL and SQLAlchemy, reducing analytical latency by 35%.'
                ]
              }
            ],
            experience: formattedExperience,
            education: formattedEducation.length > 0 ? formattedEducation : [
              {
                degree: 'Bachelor of Technology in Computer Science & Engineering',
                college: 'National Institute of Technology / University',
                graduation_year: '2024',
                cgpa_percentage: '8.6 / 10 CGPA'
              }
            ],
            certifications: analysisData.certifications || [
              'Full-Stack Web Development Specialization',
              'Certified Cloud Practitioner / Database Fundamentals'
            ]
          });
        }
      } catch (err) {
        console.error('Failed to load analysis for editor:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedResumeId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // Save draft to localStorage
  const handleSaveDraft = () => {
    if (!selectedResumeId) return;
    localStorage.setItem(`resume_editor_draft_${selectedResumeId}`, JSON.stringify(resumeData));
    showToast('Draft successfully saved in your browser!');
  };

  // Reset to original analysis
  const handleReset = () => {
    if (window.confirm('Reset all changes back to original extracted analysis?')) {
      localStorage.removeItem(`resume_editor_draft_${selectedResumeId}`);
      window.location.reload();
    }
  };

  // 1-Click AI Suggestion Application
  const handleApplySuggestion = (suggestion, index) => {
    const currentText = (suggestion.current || '').trim().toLowerCase();
    const suggestedText = (suggestion.suggested || '').trim();

    let applied = false;
    const newProjects = [...resumeData.projects];

    // 1. Try to find match in projects bullet points
    for (let p of newProjects) {
      if (p.bullet_points) {
        for (let i = 0; i < p.bullet_points.length; i++) {
          const bp = p.bullet_points[i].toLowerCase();
          if (bp.includes(currentText) || currentText.includes(bp) || (currentText.length > 10 && bp.slice(0, 15) === currentText.slice(0, 15))) {
            p.bullet_points[i] = suggestedText;
            applied = true;
            break;
          }
        }
      }
      if (applied) break;
    }

    // 2. If not matched, try experience bullet points
    const newExperience = [...resumeData.experience];
    if (!applied && newExperience.length > 0) {
      for (let exp of newExperience) {
        if (exp.bullet_points) {
          for (let i = 0; i < exp.bullet_points.length; i++) {
            const bp = exp.bullet_points[i].toLowerCase();
            if (bp.includes(currentText) || currentText.includes(bp)) {
              exp.bullet_points[i] = suggestedText;
              applied = true;
              break;
            }
          }
        }
        if (applied) break;
      }
    }

    // 3. If still not matched, append it as a bullet point to the primary project
    if (!applied && newProjects.length > 0) {
      if (!newProjects[0].bullet_points) newProjects[0].bullet_points = [];
      newProjects[0].bullet_points.push(suggestedText);
      applied = true;
    }

    if (applied) {
      setResumeData({
        ...resumeData,
        projects: newProjects,
        experience: newExperience
      });
      setAppliedSuggestions(new Set([...appliedSuggestions, index]));
      showToast(`Applied AI enhancement to ${newProjects[0]?.name || 'Projects'}!`);
    }
  };

  // Print / Export PDF Handler
  const handlePrint = () => {
    window.print();
  };

  // Project Helper Handlers
  const handleAddProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          name: 'New Project Title',
          technologies: ['React', 'Node.js'],
          link: '',
          description: '',
          bullet_points: ['Engineered key features utilizing modern design patterns and modular components.']
        }
      ]
    });
    setActiveTab('projects');
  };

  const handleRemoveProject = (index) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, i) => i !== index)
    });
  };

  const handleAddProjectBullet = (projectIdx) => {
    const newProjects = [...resumeData.projects];
    newProjects[projectIdx].bullet_points.push('Architected feature functionality with high attention to performance and code maintainability.');
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const handleRemoveProjectBullet = (projectIdx, bulletIdx) => {
    const newProjects = [...resumeData.projects];
    newProjects[projectIdx].bullet_points = newProjects[projectIdx].bullet_points.filter((_, i) => i !== bulletIdx);
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const handleUpdateProjectBullet = (projectIdx, bulletIdx, value) => {
    const newProjects = [...resumeData.projects];
    newProjects[projectIdx].bullet_points[bulletIdx] = value;
    setResumeData({ ...resumeData, projects: newProjects });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Navbar hidden when printing */}
      <div className="no-print">
        <Navbar />
      </div>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar hidden when printing */}
        <div className="no-print hidden lg:block">
          <Sidebar mode="user" />
        </div>

        <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Control Header (No Print) */}
          <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <FileEdit className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  In-App Resume Editor & Builder
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Apply AI suggestions with 1 click, customize sections, and download an ATS-optimized, machine-readable PDF.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Select Resume Dropdown */}
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="text-xs font-semibold py-2 px-3 border border-slate-300 rounded-xl bg-slate-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name} {r.latest_ats_score ? `(ATS: ${r.latest_ats_score}%)` : ''}
                  </option>
                ))}
              </select>

              {/* Save Draft Button */}
              <button
                onClick={handleSaveDraft}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Save draft locally"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                title="Reset to original parsed resume"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Primary Download ATS PDF Button */}
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download ATS PDF</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className="no-print bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* Mobile Tab Switcher for Editor vs Preview */}
          <div className="no-print lg:hidden flex rounded-xl bg-slate-200 p-1 text-xs font-bold">
            <button
              onClick={() => setMobileView('edit')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mobileView === 'edit' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Form Editor
            </button>
            <button
              onClick={() => setMobileView('preview')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mobileView === 'preview' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Resume Preview
            </button>
          </div>

          {/* Split Screen Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Section Form Editor & AI Suggestions (Cols 1-6) */}
            <div className={`lg:col-span-6 space-y-6 no-print ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}>
              {/* AI Suggestions Drawer */}
              {suggestions.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border border-indigo-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                        1-Click AI Suggestions Ready
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                      {suggestions.length} Recommendations
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-600 mb-3">
                    Click <strong>Apply to Resume</strong> to instantly swap weak phrasing with recruiter-tested, action-verb bullet points.
                  </p>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {suggestions.map((sugg, idx) => {
                      const isApplied = appliedSuggestions.has(idx);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all text-xs ${
                            isApplied
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-white border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <p className="text-[11px] text-slate-400 line-through">
                                "{sugg.current}"
                              </p>
                              <p className="text-[11.5px] font-bold text-slate-900">
                                "{sugg.suggested}"
                              </p>
                              {sugg.reason && (
                                <p className="text-[10px] text-indigo-600 font-medium">
                                  💡 {sugg.reason}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleApplySuggestion(sugg, idx)}
                              disabled={isApplied}
                              className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                isApplied
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Applied</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  <span>Apply to Resume</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Navigation Tabs */}
              <div className="flex flex-wrap gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
                {[
                  { id: 'contact', label: 'Contact', icon: User },
                  { id: 'summary', label: 'Summary', icon: AlignLeft },
                  { id: 'skills', label: 'Skills', icon: Wrench },
                  { id: 'projects', label: 'Projects', icon: FolderGit2 },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'education', label: 'Education', icon: GraduationCap }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Content Body */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                {/* 1. CONTACT INFO */}
                {activeTab === 'contact' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Header & Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.name}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, name: e.target.value }
                          })}
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                          })}
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                          })}
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Location (City, Country)</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                          })}
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">LinkedIn Profile</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                          })}
                          placeholder="linkedin.com/in/username"
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">GitHub Profile</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.github}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                          })}
                          placeholder="github.com/username"
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SUMMARY */}
                {activeTab === 'summary' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Professional Career Summary
                    </h3>
                    <textarea
                      rows={5}
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                      placeholder="Concise 2-3 sentence overview of your technical background, core competencies, and career objectives..."
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden leading-relaxed"
                    />
                  </div>
                )}

                {/* 3. TECHNICAL SKILLS */}
                {activeTab === 'skills' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Technical Skills Taxonomy
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Programming Languages (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={resumeData.skills.programming_languages.join(', ')}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            skills: {
                              ...resumeData.skills,
                              programming_languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                            }
                          })}
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Frameworks & Libraries (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={resumeData.skills.frameworks.join(', ')}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            skills: {
                              ...resumeData.skills,
                              frameworks: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                            }
                          })}
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Databases & Cloud Platforms (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={[...resumeData.skills.databases, ...resumeData.skills.cloud].join(', ')}
                          onChange={(e) => {
                            const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                            setResumeData({
                              ...resumeData,
                              skills: { ...resumeData.skills, databases: items, cloud: [] }
                            });
                          }}
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tools & Methodologies (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={[...resumeData.skills.tools, ...resumeData.skills.other].join(', ')}
                          onChange={(e) => {
                            const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                            setResumeData({
                              ...resumeData,
                              skills: { ...resumeData.skills, tools: items, other: [] }
                            });
                          }}
                          className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PROJECTS */}
                {activeTab === 'projects' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Technical Projects
                      </h3>
                      <button
                        onClick={handleAddProject}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Project</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {resumeData.projects.map((proj, pIdx) => (
                        <div key={pIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-800 text-xs">Project #{pIdx + 1}</span>
                            {resumeData.projects.length > 1 && (
                              <button
                                onClick={() => handleRemoveProject(pIdx)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Remove project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Name</label>
                              <input
                                type="text"
                                value={proj.name}
                                onChange={(e) => {
                                  const newP = [...resumeData.projects];
                                  newP[pIdx].name = e.target.value;
                                  setResumeData({ ...resumeData, projects: newP });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tech Stack (comma-separated)</label>
                              <input
                                type="text"
                                value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                                onChange={(e) => {
                                  const newP = [...resumeData.projects];
                                  newP[pIdx].technologies = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                                  setResumeData({ ...resumeData, projects: newP });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                              />
                            </div>
                          </div>

                          {/* Bullet Points */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-slate-600">
                                Impact Bullet Points (Action Verb + Scope + Metric)
                              </label>
                              <button
                                onClick={() => handleAddProjectBullet(pIdx)}
                                className="text-[11px] text-indigo-600 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Bullet</span>
                              </button>
                            </div>

                            {(proj.bullet_points || []).map((bp, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-2">
                                <span className="text-slate-400 font-bold pt-2">•</span>
                                <textarea
                                  rows={2}
                                  value={bp}
                                  onChange={(e) => handleUpdateProjectBullet(pIdx, bIdx, e.target.value)}
                                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-[11.5px] font-medium outline-hidden leading-relaxed"
                                />
                                {proj.bullet_points.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveProjectBullet(pIdx, bIdx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 pt-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. EXPERIENCE */}
                {activeTab === 'experience' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Experience & Internships
                      </h3>
                      <button
                        onClick={() => setResumeData({
                          ...resumeData,
                          experience: [
                            ...resumeData.experience,
                            {
                              title: 'Software Engineer Intern',
                              company: 'Tech Corp',
                              location: 'Bengaluru',
                              duration: 'Jun 2023 - Aug 2023',
                              bullet_points: ['Constructed full-stack modules and verified unit test coverage.']
                            }
                          ]
                        })}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Experience</span>
                      </button>
                    </div>

                    {resumeData.experience.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No experience added. Click above to add an internship or role.</p>
                    ) : (
                      resumeData.experience.map((exp, eIdx) => (
                        <div key={eIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">Role #{eIdx + 1}</span>
                            <button
                              onClick={() => setResumeData({
                                ...resumeData,
                                experience: resumeData.experience.filter((_, i) => i !== eIdx)
                              })}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Job Title</label>
                              <input
                                type="text"
                                value={exp.title}
                                onChange={(e) => {
                                  const newE = [...resumeData.experience];
                                  newE[eIdx].title = e.target.value;
                                  setResumeData({ ...resumeData, experience: newE });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Company</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => {
                                  const newE = [...resumeData.experience];
                                  newE[eIdx].company = e.target.value;
                                  setResumeData({ ...resumeData, experience: newE });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Dates / Duration</label>
                              <input
                                type="text"
                                value={exp.duration}
                                onChange={(e) => {
                                  const newE = [...resumeData.experience];
                                  newE[eIdx].duration = e.target.value;
                                  setResumeData({ ...resumeData, experience: newE });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Location</label>
                              <input
                                type="text"
                                value={exp.location}
                                onChange={(e) => {
                                  const newE = [...resumeData.experience];
                                  newE[eIdx].location = e.target.value;
                                  setResumeData({ ...resumeData, experience: newE });
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 6. EDUCATION */}
                {activeTab === 'education' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Education Records
                    </h3>
                    {resumeData.education.map((edu, edIdx) => (
                      <div key={edIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEd = [...resumeData.education];
                              newEd[edIdx].degree = e.target.value;
                              setResumeData({ ...resumeData, education: newEd });
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">College / Institute</label>
                          <input
                            type="text"
                            value={edu.college}
                            onChange={(e) => {
                              const newEd = [...resumeData.education];
                              newEd[edIdx].college = e.target.value;
                              setResumeData({ ...resumeData, education: newEd });
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Graduation Year</label>
                          <input
                            type="text"
                            value={edu.graduation_year}
                            onChange={(e) => {
                              const newEd = [...resumeData.education];
                              newEd[edIdx].graduation_year = e.target.value;
                              setResumeData({ ...resumeData, education: newEd });
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">CGPA / Percentage</label>
                          <input
                            type="text"
                            value={edu.cgpa_percentage}
                            onChange={(e) => {
                              const newEd = [...resumeData.education];
                              newEd[edIdx].cgpa_percentage = e.target.value;
                              setResumeData({ ...resumeData, education: newEd });
                            }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-hidden"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Live ATS Document Preview (Cols 7-12) */}
            <div className={`lg:col-span-6 space-y-3 ${mobileView === 'edit' ? 'hidden lg:block' : ''}`}>
              <div className="no-print flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Live Recruiter ATS Preview</span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Standard Vector Format (100% Parsable)
                </span>
              </div>

              {/* Printable Resume Component Wrapper */}
              <div className="bg-slate-200/60 p-2 sm:p-4 rounded-2xl border border-slate-300/80 overflow-x-auto shadow-inner">
                <PrintableResume ref={printableRef} resumeData={resumeData} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

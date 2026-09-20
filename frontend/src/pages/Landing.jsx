import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  FileCheck2,
  Briefcase,
  TrendingUp,
  Cpu,
  History,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Star,
  FileText,
  Zap,
  Target
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-radial-[at_top_right] from-indigo-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Google Gemini 3.8 & PyMuPDF</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Analyze Your Resume.{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                  Improve Your Career.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Get AI-powered insights, ATS analysis, skill matching, and personalized resume improvement suggestions designed for students, freshers, and job seekers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to={isAuthenticated ? "/upload" : "/register"}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 group hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>Analyze My Resume</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-2xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Highlights */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Transparent ATS Breakdown</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Job Description Match</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Zero Hallucination Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl shadow-indigo-100/50 p-6 space-y-5">
                {/* Header widget */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Software_Engineer.pdf</h4>
                      <p className="text-[11px] text-slate-400">PyMuPDF Text Extracted • 142 KB</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    High Fit
                  </span>
                </div>

                {/* Score gauge preview */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Estimated ATS Score</span>
                    <span className="text-3xl font-extrabold text-indigo-600">86%</span>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">✓ Ready for Tech Roles</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700 bg-white">
                    86%
                  </div>
                </div>

                {/* Matched skills badges preview */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Detected Tech Taxonomy</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['React.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'].map((s) => (
                      <span key={s} className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actionable suggestion card preview */}
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    AI Action Item
                  </p>
                  <p className="text-[11px] text-amber-800">
                    "Replace passive phrasing with active power verbs ('Engineered', 'Optimized') to boost ATS parsing rate."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Simple 3-Step Process</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h3>
            <p className="text-sm text-slate-600 mt-2">
              Transform your resume from generic to high-impact in under 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 relative hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-sm shadow-indigo-200">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Upload Resume</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drag and drop your PDF or DOCX resume. Our parser cleanly extracts text without corrupting structure or formatting.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 relative hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-sm shadow-indigo-200">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">AI Analyzes Resume</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google Gemini 3.8 and our deterministic ATS engine score contact details, skill categories, keyword density, and project clarity.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 relative hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-sm shadow-indigo-200">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Get Personalized Suggestions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review estimated ATS compatibility, identify skill gaps against target jobs, and copy AI-improved bullet points with zero hallucinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Platform Capabilities</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Everything You Need To Stand Out</h3>
            <p className="text-sm text-slate-600 mt-2">
              Comprehensive tools built specifically to solve real challenges faced by college students and early-career job seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">ATS Compatibility Analysis</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent factor breakdown across Contact Info, Section Structure, Skill Coverage, Action Verbs, and Readability.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Job Description Matching</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste any job vacancy description to instantly compute candidate match score, keyword alignment, and experience suitability.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Skill Gap Detection</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visual categorization into "Already Have", "Partially Relevant", and "Missing" without ever advising false claims.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Resume Sentence Improvement</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Side-by-side comparison of weak sentences versus impactful revisions with clear explanations and 1-click copying.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">AI Resume Assistant Chatbot</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive AI career mentor context-aware of your uploaded resume for interview prep, role fit, and phrasing advice.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <History className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Analysis History</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Save and track all your previous resume revisions and job match reports in a clean personal archive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Trust & Transparency</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Use AI Resume Analyzer?
            </h3>
            <p className="text-sm text-slate-600">
              Unlike generic bots that hallucinate qualifications or make false ATS promises, our platform is built on transparency and ethics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 font-bold">
                ✓
              </div>
              <h5 className="text-sm font-bold text-slate-900 mb-1">Zero Hallucinations</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                We strictly improve wording while preserving factual meaning. We will never invent fake internships, fake metrics, or fake degrees.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 font-bold">
                ⚡
              </div>
              <h5 className="text-sm font-bold text-slate-900 mb-1">Fast & Privacy-Safe</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Text is extracted locally on the backend using PyMuPDF. Passwords are securely hashed with bcrypt and JWT tokens guard your data.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center mb-3 font-bold">
                🎯
              </div>
              <h5 className="text-sm font-bold text-slate-900 mb-1">Tailored for Students</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Optimized for campus recruitment, fresher tech roles, and early careers where project clarity and skill taxonomy matter most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Your Resume to the Next Level?
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto">
            Upload your resume now to get instant, actionable feedback and land more technical interviews.
          </p>
          <div className="pt-2">
            <Link
              to={isAuthenticated ? "/upload" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 shadow-lg transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Analyze My Resume Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Resume Analyzer</span>
          </div>
          <p className="text-center text-slate-500">
            © {new Date().getFullYear()} AI Resume Analyzer. Built for students, freshers, and job seekers.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

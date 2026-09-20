import React, { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

const PrintableResume = forwardRef(({ resumeData }, ref) => {
  if (!resumeData) return null;

  const {
    personalInfo = {},
    summary = '',
    skills = {},
    projects = [],
    experience = [],
    education = [],
    certifications = [],
  } = resumeData;

  // Flatten or organize skills
  const skillsCategories = [
    { label: 'Languages', items: skills.programming_languages || [] },
    { label: 'Frameworks & Libraries', items: skills.frameworks || [] },
    { label: 'Databases & Cloud', items: [...(skills.databases || []), ...(skills.cloud || [])] },
    { label: 'Developer Tools & Methodologies', items: [...(skills.tools || []), ...(skills.other || [])] },
  ].filter((c) => c.items && c.items.length > 0);

  return (
    <div
      ref={ref}
      id="printable-resume"
      className="bg-white text-slate-900 font-sans p-8 sm:p-12 max-w-[850px] mx-auto shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full"
      style={{ minHeight: '1050px', boxSizing: 'border-box' }}
    >
      {/* Header Section */}
      <header className="border-b-2 border-slate-900 pb-4 mb-5 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-slate-950 font-serif">
          {personalInfo.name || 'Candidate Name'}
        </h1>

        {/* Contact Strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-700 font-medium">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500 print:hidden" />
              <span>{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-500 print:hidden" />
              <span>{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 print:hidden" />
              <span>{personalInfo.location}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5 text-slate-500 print:hidden" />
              <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <Github className="w-3.5 h-3.5 text-slate-500 print:hidden" />
              <span>{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </span>
          )}
          {personalInfo.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500 print:hidden" />
              <span>{personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </span>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Professional Summary
          </h2>
          <p className="text-xs leading-relaxed text-slate-800 text-justify">
            {summary}
          </p>
        </section>
      )}

      {/* Technical Skills */}
      {skillsCategories.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Technical Skills
          </h2>
          <div className="space-y-1 text-xs">
            {skillsCategories.map((cat, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="font-bold text-slate-950 sm:w-44 flex-shrink-0">
                  {cat.label}:
                </span>
                <span className="text-slate-800 leading-snug">
                  {cat.items.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Work & Professional Experience
          </h2>
          <div className="space-y-3.5">
            {experience.map((exp, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-slate-950">
                  <span className="text-xs sm:text-sm">
                    {exp.title} {exp.company ? `• ${exp.company}` : ''}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 sm:text-right">
                    {[exp.location, exp.duration].filter(Boolean).join(' | ')}
                  </span>
                </div>
                {exp.bullet_points && exp.bullet_points.length > 0 && (
                  <ul className="list-disc list-outside pl-4 mt-1.5 space-y-1 text-slate-800 text-[11.5px] leading-relaxed">
                    {exp.bullet_points.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Key Technical Projects
          </h2>
          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="font-bold text-slate-950 text-xs sm:text-sm">{proj.name}</span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[11px] text-slate-600 italic ml-2">
                        ({Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies})
                      </span>
                    )}
                  </div>
                  {proj.link && (
                    <span className="text-[11px] text-indigo-700 font-medium print:text-slate-700">
                      {proj.link.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>

                {proj.description && (
                  <p className="text-[11.5px] text-slate-800 mt-1 leading-relaxed">
                    {proj.description}
                  </p>
                )}

                {proj.bullet_points && proj.bullet_points.length > 0 && (
                  <ul className="list-disc list-outside pl-4 mt-1.5 space-y-1 text-slate-800 text-[11.5px] leading-relaxed">
                    {proj.bullet_points.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-950">{edu.degree}</span>
                  {edu.college && (
                    <span className="text-slate-700"> — {edu.college}</span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-600 sm:text-right">
                  {[edu.graduation_year, edu.cgpa_percentage].filter(Boolean).join(' | ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Accolades */}
      {certifications && certifications.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Certifications & Accolades
          </h2>
          <ul className="list-disc list-outside pl-4 space-y-0.5 text-[11.5px] text-slate-800">
            {certifications.map((cert, idx) => (
              <li key={idx}>{typeof cert === 'string' ? cert : cert.name || cert.title}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
});

PrintableResume.displayName = 'PrintableResume';

export default PrintableResume;

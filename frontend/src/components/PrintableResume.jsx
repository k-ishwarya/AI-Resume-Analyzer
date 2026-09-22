import React, { forwardRef, useRef, useLayoutEffect, useState, useCallback } from 'react';

/**
 * PrintableResume – A4-fixed resume template system with inline editing.
 *
 * Props:
 *   resumeData    – structured resume object
 *   template      – 'modern' | 'classic' | 'compact'  (default: 'modern')
 *   onDataChange  – (updatedResumeData) => void  — called when user edits inline
 *                   If omitted, inline editing is disabled (PDF-safe mode).
 *
 * Inline editing works by:
 *   - Wrapping every editable text in a <span contentEditable>
 *   - onBlur the span, we read its textContent and call onDataChange
 *   - During PDF generation, pass onDataChange={null} to get clean static HTML
 */

const A4_H = 1123; // px at 96dpi

// ─── Editable primitive ────────────────────────────────────────────────────

/**
 * EditableSpan — renders as plain text normally; becomes contentEditable on click.
 * onCommit(newValue) is called on blur.
 */
function EditableSpan({ value, onCommit, style = {}, className = '', placeholder = 'Click to edit…', tag: Tag = 'span' }) {
  const ref = useRef(null);

  const handleBlur = useCallback(() => {
    if (!onCommit) return;
    const newVal = ref.current?.textContent ?? '';
    if (newVal !== value) onCommit(newVal);
  }, [onCommit, value]);

  // Keep the DOM in sync if value changes externally (e.g. AI apply)
  useLayoutEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  if (!onCommit) {
    // Static mode for PDF — no contentEditable
    return <Tag style={style} className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      style={{
        ...style,
        outline: 'none',
        cursor: 'text',
        borderRadius: '2px',
        transition: 'background 0.15s',
      }}
      className={className}
      onFocus={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
      onBlurCapture={(e) => { e.currentTarget.style.background = 'transparent'; handleBlur(); }}
      data-placeholder={!value ? placeholder : undefined}
    >
      {value}
    </Tag>
  );
}

// ─── ContactStrip ──────────────────────────────────────────────────────────

function ContactStrip({ personalInfo, onPersonalChange, style = {} }) {
  const fields = [
    { key: 'email', val: personalInfo.email },
    { key: 'phone', val: personalInfo.phone },
    { key: 'location', val: personalInfo.location },
    { key: 'linkedin', val: personalInfo.linkedin?.replace(/^https?:\/\/(www\.)?/, '') },
    { key: 'github', val: personalInfo.github?.replace(/^https?:\/\/(www\.)?/, '') },
    { key: 'portfolio', val: personalInfo.portfolio?.replace(/^https?:\/\/(www\.)?/, '') },
  ].filter((f) => f.val);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 14px', ...style }}>
      {fields.map(({ key, val }) => (
        <EditableSpan
          key={key}
          value={val}
          onCommit={onPersonalChange ? (v) => onPersonalChange(key, v) : null}
          style={style}
        />
      ))}
    </div>
  );
}

// ─── MODERN TEMPLATE ───────────────────────────────────────────────────────

function ModernTemplate({ resumeData, scale, onDataChange }) {
  const {
    personalInfo = {},
    summary = '',
    skills = {},
    projects = [],
    experience = [],
    education = [],
    certifications = [],
  } = resumeData;

  const fs = (base) => `${Math.round(base * scale)}px`;
  const editable = !!onDataChange;

  const setPersonal = editable
    ? (key, val) => onDataChange({ ...resumeData, personalInfo: { ...personalInfo, [key]: val } })
    : null;

  const skillsCategories = [
    { label: 'Languages', items: skills.programming_languages || [], key: 'programming_languages' },
    { label: 'Frameworks & Libraries', items: skills.frameworks || [], key: 'frameworks' },
    { label: 'Databases & Cloud', items: [...(skills.databases || []), ...(skills.cloud || [])], key: 'databases' },
    { label: 'AI / ML', items: skills.ai_ml || [], key: 'ai_ml' },
    { label: 'Tools', items: [...(skills.tools || []), ...(skills.other || [])], key: 'tools' },
  ].filter((c) => c.items && c.items.length > 0);

  const sectionHeading = {
    fontSize: fs(9.5),
    fontWeight: '900',
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
    color: '#1e40af',
    borderBottom: '1.5px solid #1e40af',
    paddingBottom: '3px',
    marginBottom: '8px',
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  return (
    <div style={{ padding: `${Math.round(44 * scale)}px ${Math.round(52 * scale)}px`, boxSizing: 'border-box', background: '#ffffff', color: '#0f172a', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* HEADER */}
      <header style={{ marginBottom: `${Math.round(14 * scale)}px` }}>
        <EditableSpan
          tag="h1"
          value={personalInfo.name || ''}
          onCommit={setPersonal ? (v) => setPersonal('name', v) : null}
          placeholder="Your Name"
          style={{ fontSize: fs(22), fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '0.01em', fontFamily: 'Arial, Helvetica, sans-serif', display: 'block' }}
        />
        <ContactStrip personalInfo={personalInfo} onPersonalChange={setPersonal} style={{ marginTop: `${Math.round(5 * scale)}px`, fontSize: fs(9.5), color: '#475569' }} />
        <div style={{ height: '2px', background: 'linear-gradient(90deg,#1e40af,#93c5fd)', marginTop: `${Math.round(10 * scale)}px`, borderRadius: '1px' }} />
      </header>

      {/* SUMMARY */}
      {(summary || editable) && (
        <section style={{ marginBottom: `${Math.round(13 * scale)}px` }}>
          <h2 style={sectionHeading}>Professional Summary</h2>
          <EditableSpan
            tag="p"
            value={summary}
            onCommit={editable ? (v) => onDataChange({ ...resumeData, summary: v }) : null}
            placeholder="Write your professional summary here…"
            style={{ fontSize: fs(10), lineHeight: '1.6', color: '#1e293b', textAlign: 'justify', margin: 0, display: 'block' }}
          />
        </section>
      )}

      {/* SKILLS */}
      {skillsCategories.length > 0 && (
        <section style={{ marginBottom: `${Math.round(13 * scale)}px` }}>
          <h2 style={sectionHeading}>Technical Skills</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(3 * scale)}px` }}>
            {skillsCategories.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', fontSize: fs(10) }}>
                <span style={{ fontWeight: '700', color: '#1e293b', width: `${Math.round(155 * scale)}px`, flexShrink: 0 }}>{cat.label}:</span>
                <EditableSpan
                  value={cat.items.join(', ')}
                  onCommit={editable ? (v) => {
                    const newSkills = { ...skills, [cat.key]: v.split(',').map((s) => s.trim()).filter(Boolean) };
                    onDataChange({ ...resumeData, skills: newSkills });
                  } : null}
                  style={{ color: '#334155', lineHeight: '1.5' }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      {experience && experience.length > 0 && (
        <section style={{ marginBottom: `${Math.round(13 * scale)}px` }}>
          <h2 style={sectionHeading}>Work Experience</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(10 * scale)}px` }}>
            {experience.map((exp, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <EditableSpan
                      value={exp.title || ''}
                      onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], title: v }; onDataChange({ ...resumeData, experience: newE }); } : null}
                      style={{ fontWeight: '700', fontSize: fs(10.5), color: '#0f172a' }}
                    />
                    {exp.company && (
                      <><span style={{ fontSize: fs(10.5), color: '#1e40af', fontWeight: '600' }}> · </span>
                      <EditableSpan
                        value={exp.company}
                        onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], company: v }; onDataChange({ ...resumeData, experience: newE }); } : null}
                        style={{ fontSize: fs(10.5), color: '#1e40af', fontWeight: '600' }}
                      /></>
                    )}
                  </div>
                  <span style={{ fontSize: fs(9.5), color: '#64748b', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    <EditableSpan value={exp.duration || ''} onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], duration: v }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontSize: fs(9.5), color: '#64748b' }} />
                  </span>
                </div>
                {exp.bullet_points && exp.bullet_points.length > 0 && (
                  <ul style={{ listStyleType: 'disc', paddingLeft: `${Math.round(16 * scale)}px`, margin: `${Math.round(4 * scale)}px 0 0 0`, display: 'flex', flexDirection: 'column', gap: `${Math.round(2 * scale)}px` }}>
                    {exp.bullet_points.map((pt, pIdx) => (
                      <li key={pIdx} style={{ fontSize: fs(10), lineHeight: '1.55', color: '#1e293b' }}>
                        <EditableSpan
                          value={pt}
                          onCommit={editable ? (v) => {
                            const newE = [...experience];
                            const newBps = [...(newE[idx].bullet_points || [])];
                            newBps[pIdx] = v;
                            newE[idx] = { ...newE[idx], bullet_points: newBps };
                            onDataChange({ ...resumeData, experience: newE });
                          } : null}
                          style={{ fontSize: fs(10), lineHeight: '1.55', color: '#1e293b' }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {projects && projects.length > 0 && (
        <section style={{ marginBottom: `${Math.round(13 * scale)}px` }}>
          <h2 style={sectionHeading}>Key Technical Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(10 * scale)}px` }}>
            {projects.map((proj, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <EditableSpan
                      value={proj.name || ''}
                      onCommit={editable ? (v) => { const newP = [...projects]; newP[idx] = { ...newP[idx], name: v }; onDataChange({ ...resumeData, projects: newP }); } : null}
                      style={{ fontWeight: '700', fontSize: fs(10.5), color: '#0f172a' }}
                    />
                    {proj.technologies && proj.technologies.length > 0 && (
                      <EditableSpan
                        value={`(${Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies})`}
                        onCommit={editable ? (v) => {
                          const cleaned = v.replace(/^\(|\)$/g, '');
                          const newP = [...projects];
                          newP[idx] = { ...newP[idx], technologies: cleaned.split(',').map((t) => t.trim()).filter(Boolean) };
                          onDataChange({ ...resumeData, projects: newP });
                        } : null}
                        style={{ fontSize: fs(9.5), color: '#475569', fontStyle: 'italic', marginLeft: '6px' }}
                      />
                    )}
                  </div>
                  {proj.link && (
                    <EditableSpan
                      value={proj.link.replace(/^https?:\/\//, '')}
                      onCommit={editable ? (v) => { const newP = [...projects]; newP[idx] = { ...newP[idx], link: v }; onDataChange({ ...resumeData, projects: newP }); } : null}
                      style={{ fontSize: fs(9.5), color: '#1e40af', whiteSpace: 'nowrap', marginLeft: '8px' }}
                    />
                  )}
                </div>
                {proj.description && (
                  <EditableSpan
                    tag="p"
                    value={proj.description}
                    onCommit={editable ? (v) => { const newP = [...projects]; newP[idx] = { ...newP[idx], description: v }; onDataChange({ ...resumeData, projects: newP }); } : null}
                    style={{ fontSize: fs(10), color: '#334155', lineHeight: '1.5', margin: `${Math.round(3 * scale)}px 0 0 0`, display: 'block' }}
                  />
                )}
                {proj.bullet_points && proj.bullet_points.length > 0 && (
                  <ul style={{ listStyleType: 'disc', paddingLeft: `${Math.round(16 * scale)}px`, margin: `${Math.round(4 * scale)}px 0 0 0`, display: 'flex', flexDirection: 'column', gap: `${Math.round(2 * scale)}px` }}>
                    {proj.bullet_points.map((pt, pIdx) => (
                      <li key={pIdx} style={{ fontSize: fs(10), lineHeight: '1.55', color: '#1e293b' }}>
                        <EditableSpan
                          value={pt}
                          onCommit={editable ? (v) => {
                            const newP = [...projects];
                            const newBps = [...(newP[idx].bullet_points || [])];
                            newBps[pIdx] = v;
                            newP[idx] = { ...newP[idx], bullet_points: newBps };
                            onDataChange({ ...resumeData, projects: newP });
                          } : null}
                          style={{ fontSize: fs(10), lineHeight: '1.55', color: '#1e293b' }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {education && education.length > 0 && (
        <section style={{ marginBottom: `${Math.round(13 * scale)}px` }}>
          <h2 style={sectionHeading}>Education</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(5 * scale)}px` }}>
            {education.map((edu, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <EditableSpan value={edu.degree || ''} onCommit={editable ? (v) => { const newEd = [...education]; newEd[idx] = { ...newEd[idx], degree: v }; onDataChange({ ...resumeData, education: newEd }); } : null} style={{ fontWeight: '700', fontSize: fs(10.5), color: '#0f172a' }} />
                  {edu.college && <><span style={{ fontSize: fs(10), color: '#334155' }}> — </span><EditableSpan value={edu.college} onCommit={editable ? (v) => { const newEd = [...education]; newEd[idx] = { ...newEd[idx], college: v }; onDataChange({ ...resumeData, education: newEd }); } : null} style={{ fontSize: fs(10), color: '#334155' }} /></>}
                </div>
                <div style={{ fontSize: fs(9.5), fontWeight: '600', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {[edu.graduation_year, edu.cgpa_percentage].filter(Boolean).join(' | ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CERTIFICATIONS */}
      {certifications && certifications.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Certifications</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: `${Math.round(16 * scale)}px`, display: 'flex', flexDirection: 'column', gap: `${Math.round(2 * scale)}px`, margin: 0 }}>
            {certifications.map((cert, idx) => {
              const certText = typeof cert === 'string' ? cert : cert.name || cert.title || '';
              return (
                <li key={idx} style={{ fontSize: fs(10), color: '#1e293b', lineHeight: '1.5' }}>
                  <EditableSpan
                    value={certText}
                    onCommit={editable ? (v) => {
                      const newCerts = [...certifications];
                      newCerts[idx] = v;
                      onDataChange({ ...resumeData, certifications: newCerts });
                    } : null}
                    style={{ fontSize: fs(10), color: '#1e293b' }}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

// ─── CLASSIC TEMPLATE ──────────────────────────────────────────────────────

function ClassicTemplate({ resumeData, scale, onDataChange }) {
  const {
    personalInfo = {},
    summary = '',
    skills = {},
    projects = [],
    experience = [],
    education = [],
    certifications = [],
  } = resumeData;

  const fs = (base) => `${Math.round(base * scale)}px`;
  const serif = "'Times New Roman', Georgia, serif";
  const sans = 'Arial, Helvetica, sans-serif';
  const editable = !!onDataChange;

  const setPersonal = editable ? (key, val) => onDataChange({ ...resumeData, personalInfo: { ...personalInfo, [key]: val } }) : null;

  const skillsCategories = [
    { label: 'Languages', items: skills.programming_languages || [], key: 'programming_languages' },
    { label: 'Frameworks & Libraries', items: skills.frameworks || [], key: 'frameworks' },
    { label: 'Databases & Cloud', items: [...(skills.databases || []), ...(skills.cloud || [])], key: 'databases' },
    { label: 'AI / ML', items: skills.ai_ml || [], key: 'ai_ml' },
    { label: 'Tools & Methodologies', items: [...(skills.tools || []), ...(skills.other || [])], key: 'tools' },
  ].filter((c) => c.items && c.items.length > 0);

  const sectionHeading = {
    fontSize: fs(9.5), fontWeight: '900', letterSpacing: '0.14em', textTransform: 'uppercase',
    color: '#0f172a', borderBottom: '1.5px solid #0f172a', paddingBottom: '3px',
    marginBottom: `${Math.round(7 * scale)}px`, fontFamily: sans,
  };

  return (
    <div style={{ padding: `${Math.round(48 * scale)}px ${Math.round(56 * scale)}px`, boxSizing: 'border-box', background: '#ffffff', color: '#0f172a', fontFamily: serif }}>
      <header style={{ borderBottom: '2px solid #0f172a', paddingBottom: `${Math.round(12 * scale)}px`, marginBottom: `${Math.round(14 * scale)}px`, textAlign: 'center' }}>
        <EditableSpan tag="h1" value={personalInfo.name || ''} onCommit={setPersonal ? (v) => setPersonal('name', v) : null} placeholder="Your Name" style={{ fontSize: fs(22), fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#020617', margin: 0, fontFamily: serif, display: 'block' }} />
        <ContactStrip personalInfo={personalInfo} onPersonalChange={setPersonal} style={{ justifyContent: 'center', marginTop: `${Math.round(7 * scale)}px`, fontSize: fs(9.5), color: '#334155', fontFamily: sans }} />
      </header>

      {(summary || editable) && (
        <section style={{ marginBottom: `${Math.round(14 * scale)}px` }}>
          <h2 style={sectionHeading}>Professional Summary</h2>
          <EditableSpan tag="p" value={summary} onCommit={editable ? (v) => onDataChange({ ...resumeData, summary: v }) : null} placeholder="Write your professional summary…" style={{ fontSize: fs(10.5), lineHeight: '1.65', color: '#1e293b', textAlign: 'justify', fontFamily: sans, margin: 0, display: 'block' }} />
        </section>
      )}

      {skillsCategories.length > 0 && (
        <section style={{ marginBottom: `${Math.round(14 * scale)}px` }}>
          <h2 style={sectionHeading}>Technical Skills</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(3 * scale)}px` }}>
            {skillsCategories.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', fontSize: fs(10.5), fontFamily: sans }}>
                <span style={{ fontWeight: '700', color: '#020617', width: `${Math.round(168 * scale)}px`, flexShrink: 0 }}>{cat.label}:</span>
                <EditableSpan value={cat.items.join(', ')} onCommit={editable ? (v) => { const newSkills = { ...skills, [cat.key]: v.split(',').map((s) => s.trim()).filter(Boolean) }; onDataChange({ ...resumeData, skills: newSkills }); } : null} style={{ color: '#1e293b', lineHeight: '1.5' }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section style={{ marginBottom: `${Math.round(14 * scale)}px` }}>
          <h2 style={sectionHeading}>Work &amp; Professional Experience</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(10 * scale)}px` }}>
            {experience.map((exp, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: '700', fontSize: fs(11), color: '#020617', fontFamily: sans }}>
                    <EditableSpan value={exp.title || ''} onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], title: v }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontWeight: '700', fontSize: fs(11), color: '#020617', fontFamily: sans }} />
                    {exp.company && <>{' • '}<EditableSpan value={exp.company} onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], company: v }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontWeight: '700', fontSize: fs(11), color: '#020617', fontFamily: sans }} /></>}
                  </span>
                  <EditableSpan value={[exp.location, exp.duration].filter(Boolean).join(' | ')} onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], duration: v }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontSize: fs(10), fontWeight: '600', color: '#475569', fontFamily: sans, whiteSpace: 'nowrap', marginLeft: '8px' }} />
                </div>
                {exp.bullet_points && exp.bullet_points.length > 0 && (
                  <ul style={{ listStyleType: 'disc', paddingLeft: `${Math.round(16 * scale)}px`, margin: `${Math.round(4 * scale)}px 0 0 0`, display: 'flex', flexDirection: 'column', gap: `${Math.round(2 * scale)}px` }}>
                    {exp.bullet_points.map((pt, pIdx) => (
                      <li key={pIdx} style={{ fontSize: fs(10.5), lineHeight: '1.55', color: '#1e293b', fontFamily: sans }}>
                        <EditableSpan value={pt} onCommit={editable ? (v) => { const newE = [...experience]; const newBps = [...(newE[idx].bullet_points || [])]; newBps[pIdx] = v; newE[idx] = { ...newE[idx], bullet_points: newBps }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontSize: fs(10.5), lineHeight: '1.55', color: '#1e293b', fontFamily: sans }} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects && projects.length > 0 && (
        <section style={{ marginBottom: `${Math.round(14 * scale)}px` }}>
          <h2 style={sectionHeading}>Key Technical Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(10 * scale)}px` }}>
            {projects.map((proj, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <EditableSpan value={proj.name || ''} onCommit={editable ? (v) => { const newP = [...projects]; newP[idx] = { ...newP[idx], name: v }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontWeight: '700', fontSize: fs(11), color: '#020617', fontFamily: sans }} />
                    {proj.technologies && proj.technologies.length > 0 && (
                      <EditableSpan value={`(${Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies})`} onCommit={editable ? (v) => { const cleaned = v.replace(/^\(|\)$/g, ''); const newP = [...projects]; newP[idx] = { ...newP[idx], technologies: cleaned.split(',').map((t) => t.trim()).filter(Boolean) }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontSize: fs(10), color: '#475569', fontStyle: 'italic', marginLeft: '6px', fontFamily: sans }} />
                    )}
                  </div>
                  {proj.link && <EditableSpan value={proj.link.replace(/^https?:\/\//, '')} onCommit={editable ? (v) => { const newP = [...projects]; newP[idx] = { ...newP[idx], link: v }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontSize: fs(10), color: '#3730a3', fontFamily: sans, whiteSpace: 'nowrap', marginLeft: '8px' }} />}
                </div>
                {proj.description && <EditableSpan tag="p" value={proj.description} onCommit={editable ? (v) => { const newP = [...projects]; newP[idx] = { ...newP[idx], description: v }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontSize: fs(10.5), color: '#1e293b', lineHeight: '1.5', margin: `${Math.round(3 * scale)}px 0 0 0`, fontFamily: sans, display: 'block' }} />}
                {proj.bullet_points && proj.bullet_points.length > 0 && (
                  <ul style={{ listStyleType: 'disc', paddingLeft: `${Math.round(16 * scale)}px`, margin: `${Math.round(4 * scale)}px 0 0 0`, display: 'flex', flexDirection: 'column', gap: `${Math.round(2 * scale)}px` }}>
                    {proj.bullet_points.map((pt, pIdx) => (
                      <li key={pIdx} style={{ fontSize: fs(10.5), lineHeight: '1.55', color: '#1e293b', fontFamily: sans }}>
                        <EditableSpan value={pt} onCommit={editable ? (v) => { const newP = [...projects]; const newBps = [...(newP[idx].bullet_points || [])]; newBps[pIdx] = v; newP[idx] = { ...newP[idx], bullet_points: newBps }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontSize: fs(10.5), lineHeight: '1.55', color: '#1e293b', fontFamily: sans }} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section style={{ marginBottom: `${Math.round(14 * scale)}px` }}>
          <h2 style={sectionHeading}>Education</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(5 * scale)}px` }}>
            {education.map((edu, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: sans }}>
                <div>
                  <EditableSpan value={edu.degree || ''} onCommit={editable ? (v) => { const newEd = [...education]; newEd[idx] = { ...newEd[idx], degree: v }; onDataChange({ ...resumeData, education: newEd }); } : null} style={{ fontWeight: '700', fontSize: fs(10.5), color: '#020617' }} />
                  {edu.college && <><span style={{ fontSize: fs(10.5), color: '#334155' }}> — </span><EditableSpan value={edu.college} onCommit={editable ? (v) => { const newEd = [...education]; newEd[idx] = { ...newEd[idx], college: v }; onDataChange({ ...resumeData, education: newEd }); } : null} style={{ fontSize: fs(10.5), color: '#334155' }} /></>}
                </div>
                <div style={{ fontSize: fs(10), fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {[edu.graduation_year, edu.cgpa_percentage].filter(Boolean).join(' | ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {certifications && certifications.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Certifications &amp; Accolades</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: `${Math.round(16 * scale)}px`, display: 'flex', flexDirection: 'column', gap: `${Math.round(2 * scale)}px`, margin: 0 }}>
            {certifications.map((cert, idx) => {
              const certText = typeof cert === 'string' ? cert : cert.name || cert.title || '';
              return (
                <li key={idx} style={{ fontSize: fs(10.5), color: '#1e293b', fontFamily: sans, lineHeight: '1.5' }}>
                  <EditableSpan value={certText} onCommit={editable ? (v) => { const newCerts = [...certifications]; newCerts[idx] = v; onDataChange({ ...resumeData, certifications: newCerts }); } : null} style={{ fontSize: fs(10.5), color: '#1e293b', fontFamily: sans }} />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

// ─── COMPACT TEMPLATE ──────────────────────────────────────────────────────

function CompactTemplate({ resumeData, scale, onDataChange }) {
  const {
    personalInfo = {},
    summary = '',
    skills = {},
    projects = [],
    experience = [],
    education = [],
    certifications = [],
  } = resumeData;

  const fs = (base) => `${Math.round(base * scale)}px`;
  const sans = 'Arial, Helvetica, sans-serif';
  const editable = !!onDataChange;
  const setPersonal = editable ? (key, val) => onDataChange({ ...resumeData, personalInfo: { ...personalInfo, [key]: val } }) : null;

  const allSkillItems = [
    ...(skills.programming_languages || []), ...(skills.frameworks || []),
    ...(skills.databases || []), ...(skills.cloud || []),
    ...(skills.ai_ml || []), ...(skills.tools || []), ...(skills.other || []),
  ];

  const sectionHeading = {
    fontSize: fs(9), fontWeight: '900', letterSpacing: '0.12em', textTransform: 'uppercase',
    color: '#0f172a', borderBottom: '1px solid #94a3b8', paddingBottom: '2px',
    marginBottom: `${Math.round(5 * scale)}px`, fontFamily: sans,
  };

  return (
    <div style={{ padding: `${Math.round(36 * scale)}px ${Math.round(46 * scale)}px`, boxSizing: 'border-box', background: '#ffffff', color: '#0f172a', fontFamily: sans }}>
      <header style={{ marginBottom: `${Math.round(10 * scale)}px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <EditableSpan tag="h1" value={personalInfo.name || ''} onCommit={setPersonal ? (v) => setPersonal('name', v) : null} style={{ fontSize: fs(20), fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: sans, display: 'block' }} />
          <ContactStrip personalInfo={personalInfo} onPersonalChange={setPersonal} style={{ fontSize: fs(8.5), color: '#475569', justifyContent: 'flex-end', textAlign: 'right', flexDirection: 'column', gap: '1px' }} />
        </div>
        <div style={{ height: '1px', background: '#0f172a', marginTop: `${Math.round(6 * scale)}px` }} />
      </header>

      {(summary || editable) && (
        <section style={{ marginBottom: `${Math.round(9 * scale)}px` }}>
          <h2 style={sectionHeading}>Summary</h2>
          <EditableSpan tag="p" value={summary} onCommit={editable ? (v) => onDataChange({ ...resumeData, summary: v }) : null} placeholder="Write your professional summary…" style={{ fontSize: fs(9.5), lineHeight: '1.55', color: '#1e293b', margin: 0, display: 'block' }} />
        </section>
      )}

      {allSkillItems.length > 0 && (
        <section style={{ marginBottom: `${Math.round(9 * scale)}px` }}>
          <h2 style={sectionHeading}>Technical Skills</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${Math.round(2 * scale)}px ${Math.round(8 * scale)}px` }}>
            {allSkillItems.map((skill, i) => (
              <span key={i} style={{ fontSize: fs(9.5), color: '#1e293b' }}>• {skill}</span>
            ))}
          </div>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section style={{ marginBottom: `${Math.round(9 * scale)}px` }}>
          <h2 style={sectionHeading}>Experience</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(8 * scale)}px` }}>
            {experience.map((exp, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: '700', fontSize: fs(10), color: '#0f172a' }}>
                    <EditableSpan value={exp.title || ''} onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], title: v }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontWeight: '700', fontSize: fs(10), color: '#0f172a' }} />
                    {exp.company && <>{' · '}<EditableSpan value={exp.company} onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], company: v }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontWeight: '700', fontSize: fs(10), color: '#0f172a' }} /></>}
                  </span>
                  <EditableSpan value={exp.duration || ''} onCommit={editable ? (v) => { const newE = [...experience]; newE[idx] = { ...newE[idx], duration: v }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontSize: fs(8.5), color: '#64748b', whiteSpace: 'nowrap', marginLeft: '6px' }} />
                </div>
                {exp.bullet_points && exp.bullet_points.length > 0 && (
                  <ul style={{ listStyleType: 'disc', paddingLeft: `${Math.round(14 * scale)}px`, margin: `${Math.round(2 * scale)}px 0 0 0`, display: 'flex', flexDirection: 'column', gap: `${Math.round(1 * scale)}px` }}>
                    {exp.bullet_points.map((pt, pIdx) => (
                      <li key={pIdx} style={{ fontSize: fs(9.5), lineHeight: '1.45', color: '#1e293b' }}>
                        <EditableSpan value={pt} onCommit={editable ? (v) => { const newE = [...experience]; const newBps = [...(newE[idx].bullet_points || [])]; newBps[pIdx] = v; newE[idx] = { ...newE[idx], bullet_points: newBps }; onDataChange({ ...resumeData, experience: newE }); } : null} style={{ fontSize: fs(9.5), lineHeight: '1.45', color: '#1e293b' }} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects && projects.length > 0 && (
        <section style={{ marginBottom: `${Math.round(9 * scale)}px` }}>
          <h2 style={sectionHeading}>Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(8 * scale)}px` }}>
            {projects.map((proj, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <EditableSpan value={proj.name || ''} onCommit={editable ? (v) => { const newP = [...projects]; newP[idx] = { ...newP[idx], name: v }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontWeight: '700', fontSize: fs(10), color: '#0f172a' }} />
                    {proj.technologies && proj.technologies.length > 0 && (
                      <EditableSpan value={`(${Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies})`} onCommit={editable ? (v) => { const cleaned = v.replace(/^\(|\)$/g, ''); const newP = [...projects]; newP[idx] = { ...newP[idx], technologies: cleaned.split(',').map((t) => t.trim()).filter(Boolean) }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontSize: fs(8.5), color: '#475569', fontStyle: 'italic', marginLeft: '5px' }} />
                    )}
                  </div>
                  {proj.link && <EditableSpan value={proj.link.replace(/^https?:\/\//, '')} onCommit={editable ? (v) => { const newP = [...projects]; newP[idx] = { ...newP[idx], link: v }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontSize: fs(8.5), color: '#1e40af', whiteSpace: 'nowrap', marginLeft: '6px' }} />}
                </div>
                {proj.bullet_points && proj.bullet_points.length > 0 && (
                  <ul style={{ listStyleType: 'disc', paddingLeft: `${Math.round(14 * scale)}px`, margin: `${Math.round(2 * scale)}px 0 0 0`, display: 'flex', flexDirection: 'column', gap: `${Math.round(1 * scale)}px` }}>
                    {proj.bullet_points.map((pt, pIdx) => (
                      <li key={pIdx} style={{ fontSize: fs(9.5), lineHeight: '1.45', color: '#1e293b' }}>
                        <EditableSpan value={pt} onCommit={editable ? (v) => { const newP = [...projects]; const newBps = [...(newP[idx].bullet_points || [])]; newBps[pIdx] = v; newP[idx] = { ...newP[idx], bullet_points: newBps }; onDataChange({ ...resumeData, projects: newP }); } : null} style={{ fontSize: fs(9.5), lineHeight: '1.45', color: '#1e293b' }} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section style={{ marginBottom: `${Math.round(9 * scale)}px` }}>
          <h2 style={sectionHeading}>Education</h2>
          {education.map((edu, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <EditableSpan value={edu.degree || ''} onCommit={editable ? (v) => { const newEd = [...education]; newEd[idx] = { ...newEd[idx], degree: v }; onDataChange({ ...resumeData, education: newEd }); } : null} style={{ fontWeight: '700', fontSize: fs(9.5), color: '#0f172a' }} />
                {edu.college && <><span style={{ fontSize: fs(9.5), color: '#334155' }}> — </span><EditableSpan value={edu.college} onCommit={editable ? (v) => { const newEd = [...education]; newEd[idx] = { ...newEd[idx], college: v }; onDataChange({ ...resumeData, education: newEd }); } : null} style={{ fontSize: fs(9.5), color: '#334155' }} /></>}
              </div>
              <div style={{ fontSize: fs(8.5), color: '#64748b', whiteSpace: 'nowrap', marginLeft: '6px' }}>
                {[edu.graduation_year, edu.cgpa_percentage].filter(Boolean).join(' | ')}
              </div>
            </div>
          ))}
        </section>
      )}

      {certifications && certifications.length > 0 && (
        <section>
          <h2 style={sectionHeading}>Certifications</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${Math.round(2 * scale)}px ${Math.round(16 * scale)}px` }}>
            {certifications.map((cert, idx) => {
              const certText = typeof cert === 'string' ? cert : cert.name || cert.title || '';
              return (
                <span key={idx} style={{ fontSize: fs(9.5), color: '#1e293b' }}>
                  • <EditableSpan value={certText} onCommit={editable ? (v) => { const newCerts = [...certifications]; newCerts[idx] = v; onDataChange({ ...resumeData, certifications: newCerts }); } : null} style={{ fontSize: fs(9.5), color: '#1e293b' }} />
                </span>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── ROOT COMPONENT ────────────────────────────────────────────────────────

const PrintableResume = forwardRef(({ resumeData, template = 'modern', onDataChange }, ref) => {
  if (!resumeData) return null;

  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const h = el.scrollHeight;
    if (h > A4_H) {
      setScale(Math.max(0.72, A4_H / h));
    } else {
      setScale(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData, template]);

  const templateProps = { resumeData, scale, onDataChange };

  return (
    <div
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      id="printable-resume"
      style={{
        width: '794px',
        minHeight: `${A4_H}px`,
        boxSizing: 'border-box',
        background: '#ffffff',
        position: 'relative',
      }}
    >
      {/* Inline-edit hint badge — only shown when editing is enabled */}
      {onDataChange && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            background: 'rgba(99,102,241,0.9)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: '700',
            padding: '2px 7px',
            borderRadius: '99px',
            letterSpacing: '0.05em',
            zIndex: 10,
            pointerEvents: 'none',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          ✏️ Click any text to edit
        </div>
      )}

      {template === 'classic' && <ClassicTemplate {...templateProps} />}
      {template === 'compact' && <CompactTemplate {...templateProps} />}
      {(template === 'modern' || !['classic', 'compact', 'modern'].includes(template)) && <ModernTemplate {...templateProps} />}
    </div>
  );
});

PrintableResume.displayName = 'PrintableResume';

export default PrintableResume;

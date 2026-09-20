import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, CircleDashed } from 'lucide-react';

export default function LoadingSpinner({
  title = "Analyzing your resume...",
  subtitle = "Our AI is reading your document and calculating ATS compatibility."
}) {
  const steps = [
    "Verifying file format and document integrity...",
    "Extracting clean text using PyMuPDF & python-docx...",
    "Running deep resume analysis via Google Gemini AI...",
    "Evaluating ATS factors & calculating compatibility breakdown...",
    "Structuring recommendations and career action items..."
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-16 max-w-md mx-auto text-center">
      {/* Animated AI Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 border-2 border-indigo-200/80 flex items-center justify-center shadow-lg shadow-indigo-100">
          <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
        </div>
        <div className="absolute -inset-1 rounded-3xl bg-indigo-500/20 blur-md -z-10 animate-pulse" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-xs text-slate-500 mb-8">{subtitle}</p>

      {/* Progress Steps */}
      <div className="w-full space-y-3 text-left bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={idx} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : isCurrent ? (
                <CircleDashed className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
              )}
              <span
                className={`text-xs ${
                  isDone
                    ? 'text-slate-500 line-through'
                    : isCurrent
                    ? 'text-indigo-700 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

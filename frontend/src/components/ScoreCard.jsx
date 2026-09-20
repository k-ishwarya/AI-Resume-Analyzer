import React from 'react';

export default function ScoreCard({
  score = 0,
  title = "Estimated ATS Compatibility",
  subtitle = "Based on structural & content heuristics",
  size = "md"
}) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Color selection
  let strokeColor = "#10b981"; // emerald-500
  let textColor = "text-emerald-600";
  let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let ratingText = "Strong Match";

  if (clampedScore < 60) {
    strokeColor = "#f43f5e"; // rose-500
    textColor = "text-rose-600";
    badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
    ratingText = "Needs Revision";
  } else if (clampedScore < 75) {
    strokeColor = "#f59e0b"; // amber-500
    textColor = "text-amber-600";
    badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
    ratingText = "Good Potential";
  } else if (clampedScore < 85) {
    strokeColor = "#6366f1"; // indigo-500
    textColor = "text-indigo-600";
    badgeBg = "bg-indigo-50 text-indigo-700 border-indigo-200";
    ratingText = "Very Good";
  }

  // SVG parameters
  const radius = size === "lg" ? 64 : 48;
  const strokeWidth = size === "lg" ? 10 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
      <div className="relative flex items-center justify-center mb-3">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner number */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-black tracking-tight ${size === 'lg' ? 'text-4xl' : 'text-3xl'} ${textColor}`}>
            {clampedScore}%
          </span>
        </div>
      </div>

      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeBg} mb-2`}>
        {ratingText}
      </span>

      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5 max-w-xs">{subtitle}</p>
    </div>
  );
}

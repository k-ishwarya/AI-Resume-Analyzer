import React from 'react';

export default function ProgressBar({ label, value = 0, max = 100, color = 'indigo' }) {
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  const colorStyles = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-blue-600',
    violet: 'bg-violet-600',
  };

  const barColor = colorStyles[color] || 'bg-indigo-600';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
        <span className="text-slate-700 capitalize">{label.replace(/_/g, ' ')}</span>
        <span className="text-slate-900 font-bold">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

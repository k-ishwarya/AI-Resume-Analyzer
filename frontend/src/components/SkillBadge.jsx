import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

export default function SkillBadge({ name, variant = 'default', onRemove = null }) {
  let style = "bg-slate-100 text-slate-800 border-slate-200";
  let icon = null;

  if (variant === 'matched') {
    style = "bg-emerald-50 text-emerald-800 border-emerald-200/80";
    icon = <Check className="w-3.5 h-3.5 text-emerald-600" />;
  } else if (variant === 'missing') {
    style = "bg-rose-50 text-rose-800 border-rose-200/80";
    icon = <X className="w-3.5 h-3.5 text-rose-500" />;
  } else if (variant === 'partial') {
    style = "bg-amber-50 text-amber-800 border-amber-200/80";
    icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
  } else if (variant === 'primary') {
    style = "bg-indigo-50 text-indigo-800 border-indigo-200/80";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${style} shadow-2xs`}>
      {icon}
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:opacity-75 focus:outline-hidden ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose = null }) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
    }
  };

  const current = styles[type] || styles.error;

  return (
    <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium mb-4 ${current.bg} shadow-2xs`}>
      <div className="flex items-center gap-2.5">
        {current.icon}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-75 focus:outline-hidden">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

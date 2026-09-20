import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function FileUpload({ onFileSelect, selectedFile, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndSelect = (file) => {
    setError(null);
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(extension)) {
      setError('Please select a valid PDF (.pdf) or Word document (.docx).');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setError('File exceeds maximum allowed size of 10MB.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                validateAndSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Drag & drop your resume here, or <span className="text-indigo-600 underline">browse</span>
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Supports PDF and DOCX formats (Up to 10MB). Best results with text-based resumes.
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 bg-white rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs uppercase font-semibold text-indigo-600">
                  {selectedFile.name.split('.').pop()}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

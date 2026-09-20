import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import { resumeService } from '../services/resumeService';
import { chatService } from '../services/chatService';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  Loader2,
  FileText,
  HelpCircle
} from 'lucide-react';

export default function ResumeAssistant() {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const samplePrompts = [
    "What are the strongest parts of my resume?",
    "How can I improve my project descriptions?",
    "Is my resume suitable for a fresher software developer role?",
    "Give me better action verbs for my technical bullets.",
    "How can I improve my career objective summary?"
  ];

  useEffect(() => {
    const initResumes = async () => {
      try {
        const list = await resumeService.getResumes();
        setResumes(list);

        let targetId = preselectedResumeId;
        if (!targetId && list.length > 0) {
          targetId = list[0].id;
        }

        if (targetId) {
          setSelectedResumeId(targetId.toString());
          loadHistory(targetId);
        }
      } catch (err) {
        console.error('Error fetching resumes:', err);
      }
    };

    initResumes();
  }, [preselectedResumeId]);

  const loadHistory = async (resumeId) => {
    try {
      setLoadingHistory(true);
      const history = await chatService.getChatHistory(resumeId);
      setMessages(history);
    } catch {
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleResumeSelect = (e) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    if (id) {
      loadHistory(id);
    } else {
      setMessages([]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim() || sending) return;

    const userMsg = { id: Date.now(), role: 'user', message: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);
    setError('');

    try {
      const res = await chatService.sendMessage(msg, selectedResumeId ? parseInt(selectedResumeId) : null);
      const aiMsg = { id: Date.now() + 1, role: 'assistant', message: res.ai_response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError('Failed to reach AI assistant. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedResumeId) return;
    try {
      await chatService.clearChatHistory(parseInt(selectedResumeId));
      setMessages([]);
    } catch (err) {
      setError('Failed to clear chat history.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="user" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-4rem)] min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>AI Resume Assistant</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Ask targeted questions about your resume, interview positioning, and bullet improvements.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {resumes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Context:</span>
                  <select
                    value={selectedResumeId}
                    onChange={handleResumeSelect}
                    className="text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white outline-hidden font-medium"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.file_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  title="Clear Chat History"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Chat message thread */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 overflow-y-auto shadow-2xs space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bot className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">How can I help with your resume?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    I am contextualized on your uploaded resume. Click any suggested topic below or type your own question.
                  </p>
                </div>

                {/* Prompt Pills */}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-medium text-slate-700 border border-slate-200/80 transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl p-3.5 rounded-2xl ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs whitespace-pre-line'
                    }`}
                  >
                    {m.message}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                      U
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="flex gap-3 text-xs justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>AI assistant is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions row if chat active */}
          {messages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {samplePrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-[10px] font-medium text-slate-600 whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="mt-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about your resume, skills, or target roles..."
              className="flex-1 text-xs py-3 px-4 rounded-2xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

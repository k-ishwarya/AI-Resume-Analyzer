import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { User, Mail, Shield, Calendar, Award, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="user" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidate Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your registered user details and role permissions.
            </p>
          </div>

          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-200">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {user?.role} ACCOUNT
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  Email Address
                </span>
                <span className="font-bold text-slate-800">{user?.email}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  System Role
                </span>
                <span className="font-bold text-slate-800">{user?.role}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Account Created
                </span>
                <span className="font-bold text-slate-800">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Security & Data Privacy
              </p>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Your password is protected via salted bcrypt hashing. All extracted resume text and analyses are guarded by JWT authorization.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

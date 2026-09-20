import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck,
  Briefcase,
  Lightbulb,
  FileEdit,
  Sparkles,
  History,
  User,
  Users,
  ShieldCheck,
  Files,
  LogOut
} from 'lucide-react';

export default function Sidebar({ mode = 'user' }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resume', to: '/upload', icon: UploadCloud },
    { name: 'Resume Analysis', to: '/analysis', icon: FileCheck },
    { name: 'Job Match Analysis', to: '/job-match', icon: Briefcase },
    { name: 'Resume Suggestions', to: '/suggestions', icon: Lightbulb },
    { name: 'Resume Editor Studio', to: '/editor', icon: FileEdit },
    { name: 'AI Resume Assistant', to: '/assistant', icon: Sparkles },
    { name: 'Analysis History', to: '/history', icon: History },
    { name: 'My Profile', to: '/profile', icon: User },
  ];

  const adminNavItems = [
    { name: 'Admin Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users Management', to: '/admin/users', icon: Users },
    { name: 'Resume Management', to: '/admin/resumes', icon: Files },
  ];

  const navItems = mode === 'admin' ? adminNavItems : userNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Role Banner */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mode === 'admin' ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Admin Control</span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Candidate Workspace</span>
            </>
          )}
        </div>
        {isAdmin && (
          <NavLink
            to={mode === 'admin' ? '/dashboard' : '/admin/dashboard'}
            className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 underline"
          >
            {mode === 'admin' ? 'Exit Admin' : 'Admin Portal'}
          </NavLink>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

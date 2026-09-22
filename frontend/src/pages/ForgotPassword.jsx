import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Send,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Alert from '../components/Alert';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // If user opens a reset link (e.g. /reset-password?token=...)
  const queryToken = searchParams.get('token') || '';

  // Mode: 'request' (enter email) | 'sent' (email sent message) | 'reset' (enter new password) | 'success' (completed)
  const [mode, setMode] = useState(queryToken ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(queryToken);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentMessage, setSentMessage] = useState('');

  // Update mode if URL token changes
  useEffect(() => {
    if (queryToken) {
      setToken(queryToken);
      setMode('reset');
      setError('');
    }
  }, [queryToken]);

  // Handle Step 1: Submit Email
  const handleRequestLink = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(cleanEmail);
      setSentMessage(
        res.message ||
          'If an account exists with that email address, a password reset link has been dispatched.'
      );
      setMode('sent');
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Failed to process request. Please verify your connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!token) {
      setError('Reset token is missing or invalid. Please request a new link.');
      setMode('request');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, newPassword, confirmPassword);
      setMode('success');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Failed to reset password. The link may have expired or was already used.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">AI Resume Analyzer</span>
        </Link>

        {mode === 'request' && (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot your password?</h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
              Enter your registered email and we'll send you a secure link to reset your password.
            </p>
          </>
        )}

        {mode === 'sent' && (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Check your inbox</h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
              We've dispatched a secure one-click reset link to your email.
            </p>
          </>
        )}

        {mode === 'reset' && (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Choose a new password</h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
              Please enter your new credentials below to update your account.
            </p>
          </>
        )}

        {mode === 'success' && (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Password Updated!</h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
              Your password has been changed successfully.
            </p>
          </>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-3xl sm:px-10">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* ── 1. REQUEST RESET LINK FORM ─────────────────────── */}
          {mode === 'request' && (
            <>
              <form onSubmit={handleRequestLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}

          {/* ── 2. LINK DISPATCHED CONFIRMATION ────────────────── */}
          {mode === 'sent' && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                <Mail className="w-7 h-7" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">Reset Link Sent!</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  We sent an email to <span className="font-semibold text-slate-800">{email}</span>. Click the link inside the email to reset your password.
                </p>
              </div>

              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Security Details</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  • Link is valid for <strong>15 minutes</strong>.
                </p>
                <p className="text-[11px] text-slate-500">
                  • Can only be used <strong>once</strong>.
                </p>
                <p className="text-[11px] text-slate-400">
                  Can't find it? Make sure to check your spam/junk folder.
                </p>
              </div>

              <div className="w-full pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('request');
                    setEmail('');
                    setError('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Try a different email address
                </button>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}

          {/* ── 3. ENTER NEW PASSWORD FORM ─────────────────────── */}
          {mode === 'reset' && (
            <>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      autoFocus
                      className="block w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type your password"
                      required
                      className="block w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving new password...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('request');
                    setError('');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  ← Request a new link
                </button>
              </div>
            </>
          )}

          {/* ── 4. SUCCESS STATE ───────────────────────────────── */}
          {mode === 'success' && (
            <div className="flex flex-col items-center text-center gap-4 py-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <p className="text-base font-bold text-slate-900">Password Reset Successful!</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Your password has been securely updated. You can now log into your account with your new credentials.
                </p>
              </div>

              <div className="w-full pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-sm shadow-indigo-200"
                >
                  <span>Proceed to Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

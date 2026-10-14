import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, signup } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('adwait.kokane@college.edu');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('Government College of Engineering & Technology');
  const [branch, setBranch] = useState('Information Technology');
  const [year, setYear] = useState('Second Year');
  const [careerGoal, setCareerGoal] = useState('Software Developer');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, loginEmail.includes('admin') ? 'admin' : 'student');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup({
      fullName: fullName || 'New Student',
      email: email || 'student@college.edu',
      college,
      branch,
      year,
      careerGoal,
    });
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Personalized Interview Trainer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Practice Smarter. Interview Better. Get Hired.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium mt-2 border border-slate-200/60">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>College Community Engagement Project</span>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mb-5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center">
            Quick 1-Click Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => login('adwait.kokane@college.edu', 'student')}
              className="py-2 px-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-200 transition text-center shadow-xs"
            >
              🎓 Demo Student
            </button>
            <button
              type="button"
              onClick={() => login('rajesh.sharma@college.edu', 'admin')}
              className="py-2 px-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition text-center shadow-xs"
            >
              🛡️ Demo Admin
            </button>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setForgotSent(false);
            }}
            className={`flex-1 py-1.5 rounded-lg transition ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setForgotSent(false);
            }}
            className={`flex-1 py-1.5 rounded-lg transition ${
              authMode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form: Login */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="student@college.edu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Enter Website</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form: Sign Up */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Adwait Kokane"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="student@college.edu"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="College Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="Information Technology">IT</option>
                  <option value="Computer Engineering">Computer</option>
                  <option value="Data Science & AI">Data Science</option>
                  <option value="EXTC">EXTC</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="First Year">FE (1st Year)</option>
                  <option value="Second Year">SE (2nd Year)</option>
                  <option value="Third Year">TE (3rd Year)</option>
                  <option value="Final Year">BE (Final Year)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Goal</label>
              <input
                type="text"
                required
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Software Developer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 mt-3"
            >
              <span>Sign Up & Enter Website</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form: Forgot Password */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Enter your college email address to receive password reset instructions.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="adwait.kokane@college.edu"
              />
            </div>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset link dispatched!</span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition"
              >
                Send Reset Link
              </button>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

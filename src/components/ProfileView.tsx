import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User as UserIcon,
  GraduationCap,
  Building,
  Target,
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, resumeData, readinessScore, targetJob, updateTargetJob } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || 'Adwait Kokane');
  const [college, setCollege] = useState(currentUser?.college || 'Government College of Engineering & Technology');
  const [branch, setBranch] = useState(currentUser?.branch || 'Information Technology');
  const [year, setYear] = useState(currentUser?.year || 'Second Year');
  const [careerGoal, setCareerGoal] = useState(
    currentUser?.careerGoal || 'Software Development Engineer (SDE) at Top Tech Enterprise'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shadow-blue-600/30">
            {fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
            <p className="text-xs text-slate-500">
              {branch} • {year} • {college}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Readiness: {readinessScore}%
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Verified Student
              </span>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile Saved!</span>
          </div>
        )}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Academic & Personal Details</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
            <input
              type="email"
              disabled
              value={currentUser?.email || 'adwait.kokane@college.edu'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">College Name</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Year of Study</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
            <input
              type="text"
              value={targetJob.role}
              onChange={(e) => updateTargetJob({ role: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Career Goal & Professional Vision
          </label>
          <textarea
            rows={3}
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Resume Attached: <span className="text-slate-700 font-semibold">{resumeData.fileName}</span>
          </span>

          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

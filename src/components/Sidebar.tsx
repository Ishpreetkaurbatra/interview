import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  User as UserIcon,
  FileText,
  Briefcase,
  PlayCircle,
  Dumbbell,
  HelpCircle,
  TrendingUp,
  History,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, currentUser, logout, switchUserRole } = useApp();

  const sections = [
    {
      title: 'Practice',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'mock-interview', label: 'Mock Interview', icon: PlayCircle },
        { id: 'practice', label: 'Practice Mode', icon: Dumbbell },
      ],
    },
    {
      title: 'Preparation',
      items: [
        { id: 'resume', label: 'Resume Analyzer', icon: FileText },
        { id: 'target-job', label: 'Target Job', icon: Briefcase },
        { id: 'question-bank', label: 'Question Bank', icon: HelpCircle },
      ],
    },
    {
      title: 'Analytics & Plan',
      items: [
        { id: 'progress', label: 'Progress Tracking', icon: TrendingUp },
        { id: 'history', label: 'Interview History', icon: History },
        { id: 'improvement-plan', label: '7-Day Plan', icon: CalendarCheck },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', label: 'My Profile', icon: UserIcon },
        { id: 'admin', label: 'Faculty Analytics', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-xs font-bold text-slate-900 tracking-tight leading-tight">
            Interview Trainer
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">
            College CEP Platform
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'admin' && currentUser?.role !== 'admin') {
                      switchUserRole('admin');
                    } else if (item.id === 'dashboard' && currentUser?.role === 'admin') {
                      switchUserRole('student');
                    } else {
                      setCurrentPage(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {currentUser?.fullName || 'Student'}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize">
                {currentUser?.role === 'admin' ? 'Faculty Admin' : currentUser?.branch || 'Student'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PlayCircle,
  Sparkles,
  Menu,
  Camera,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import { DevicePermissionModal } from './DevicePermissionModal';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentPage, currentUser, startInterview, isAiProcessing, aiProcessingMessage } = useApp();
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'profile':
        return 'My Profile';
      case 'resume':
        return 'Resume Analyzer';
      case 'target-job':
        return 'Target Job';
      case 'mock-interview':
        return 'Mock Interview';
      case 'practice':
        return 'Practice Mode';
      case 'question-bank':
        return 'Question Bank';
      case 'progress':
        return 'Progress Tracking';
      case 'history':
        return 'Interview History';
      case 'improvement-plan':
        return '7-Day Improvement Plan';
      case 'admin':
        return 'Faculty Analytics';
      default:
        return 'Personalized Interview Trainer';
    }
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {isAiProcessing && (
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium animate-pulse border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] truncate max-w-[200px]">
                {aiProcessingMessage || 'AI computing...'}
              </span>
            </div>
          )}

          {/* Quick Permission / Device Check Button */}
          <button
            type="button"
            onClick={() => setIsPermissionModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200"
            title="Check or grant Camera and Microphone permissions"
          >
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            <span>Allow Permissions</span>
          </button>

          <button
            onClick={() => startInterview({ totalQuestions: 5 })}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Start Interview</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              {currentUser?.fullName?.charAt(0) || 'S'}
            </div>
            <span className="font-semibold text-slate-800 hidden sm:inline text-xs">
              {currentUser?.fullName?.split(' ')[0] || 'Student'}
            </span>
          </div>
        </div>
      </header>

      {/* Permission modal */}
      <DevicePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
      />
    </>
  );
};

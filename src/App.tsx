import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudentOnboarding } from './components/StudentOnboarding';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { TargetJobPage } from './components/TargetJobPage';
import { MockInterview } from './components/MockInterview';
import { FinalReportView } from './components/FinalReportView';
import { ProgressView } from './components/ProgressView';
import { PracticeMode } from './components/PracticeMode';
import { QuestionBankView } from './components/QuestionBankView';
import { ImprovementPlanView } from './components/ImprovementPlanView';
import { InterviewHistoryView } from './components/InterviewHistoryView';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileView } from './components/ProfileView';
import { AuthView } from './components/AuthView';
import { Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentPage, currentUser, isAiProcessing, aiProcessingMessage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not logged in or in auth mode
  if (!currentUser || currentPage === 'auth') {
    return <AuthView />;
  }

  // If in onboarding mode
  if (currentPage === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentOnboarding />
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <ProfileView />;
      case 'resume':
        return <ResumeAnalyzer />;
      case 'target-job':
        return <TargetJobPage />;
      case 'mock-interview':
        return <MockInterview />;
      case 'practice':
        return <PracticeMode />;
      case 'question-bank':
        return <QuestionBankView />;
      case 'progress':
        return <ProgressView />;
      case 'history':
        return <InterviewHistoryView />;
      case 'improvement-plan':
        return <ImprovementPlanView />;
      case 'final-report':
        return <FinalReportView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-64 max-w-xs bg-slate-900">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Global AI Processing Banner */}
        {isAiProcessing && (
          <div className="bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-inner animate-pulse shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiProcessingMessage || 'AI Engine is computing adaptive recommendations...'}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto">{renderCurrentPage()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

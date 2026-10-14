import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  CalendarCheck,
  TrendingUp,
  Download,
  Share2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
  Printer,
  RotateCcw,
} from 'lucide-react';

export const FinalReportView: React.FC = () => {
  const {
    activeInterview,
    interviews,
    setCurrentPage,
    startInterview,
    currentPlan,
    togglePlanTask,
    currentUser,
    targetJob,
  } = useApp();

  // Get current completed session or most recent
  const session =
    activeInterview?.status === 'completed'
      ? activeInterview
      : interviews.find((i) => i.status === 'completed' && i.finalReport) || interviews[0];

  const report = session?.finalReport;

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-800">No Final Report Available Yet</h3>
        <p className="text-xs text-slate-500">
          Complete an interview round to receive your executive evaluation and 7-day personalized plan.
        </p>
        <button
          onClick={() => startInterview({ totalQuestions: 5 })}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
        >
          Start Mock Interview
        </button>
      </div>
    );
  }

  const overall = report.overallScore || 75;

  return (
    <div className="space-y-6 pb-12 print:space-y-4">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
            <Award className="w-3.5 h-3.5" />
            <span>Official College CEP Assessment Report</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Interview Performance Report
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Candidate: <span className="font-semibold text-slate-800">{currentUser?.fullName || 'Adwait Kokane'}</span> • Target Role: <span className="font-semibold text-slate-800">{session.role}</span> • Session ID: {session.id}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => startInterview({ totalQuestions: 5 })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-600/25 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Interview</span>
          </button>
        </div>
      </div>

      {/* Main Score & Breakdown Grid (USP Requirement 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* OVERALL SCORE Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-28 h-28 rounded-full border-4 border-blue-500/30 bg-blue-50/50 flex flex-col items-center justify-center mb-3">
            <span className="text-4xl font-black text-slate-900">{overall}%</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              Readiness
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900">Interview Readiness Rating</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            {overall >= 75
              ? 'Strong corporate readiness demonstrated with solid project grounding and problem solving.'
              : 'Promising potential with specific opportunities in answer structure and confidence.'}
          </p>
        </div>

        {/* 6 Core Category Metrics */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Category Competency Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Technical Knowledge', score: report.technicalKnowledge || 78 },
                { label: 'Communication', score: report.communicationScore || 72 },
                { label: 'Confidence', score: report.confidenceScore || 68 },
                { label: 'Problem Solving', score: report.problemSolvingScore || 81 },
                { label: 'Answer Quality', score: report.answerQualityScore || 74 },
                { label: 'Role Fit', score: report.roleFitScore || 76 },
              ].map((cat, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>{cat.label}</span>
                    <span className="text-blue-600 font-bold">{cat.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-blue-50/60 p-3 rounded-xl">
            <span className="font-bold text-blue-900">Executive Summary: </span>
            {report.executiveSummary}
          </div>
        </div>
      </div>

      {/* TOP 3 STRENGTHS & TOP 3 WEAKNESSES (USP Requirement 13) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 3 Strengths */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">TOP 3 STRENGTHS</h3>
              <p className="text-[11px] text-slate-500">Key competencies that impressed the interviewer</p>
            </div>
          </div>

          <div className="space-y-3">
            {report.topStrengths.slice(0, 3).map((str, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-800 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Weaknesses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">TOP 3 WEAKNESSES</h3>
              <p className="text-[11px] text-slate-500">Immediate areas to target in practice sessions</p>
            </div>
          </div>

          <div className="space-y-3">
            {report.topWeaknesses.slice(0, 3).map((wkn, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-slate-800 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{wkn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PERSONALIZED 7-DAY IMPROVEMENT PLAN (USP Requirement 14) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Targeted AI Remediation Schedule</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              7-DAY INTERVIEW IMPROVEMENT PLAN
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customized syllabus generated based on your exact weak areas in this interview. Complete daily drills to boost your readiness.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('practice')}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-blue-200 transition"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Launch Today&apos;s Drill</span>
          </button>
        </div>

        <div className="space-y-3">
          {(currentPlan.length > 0 ? currentPlan : report.sevenDayImprovementPlan).map((day) => (
            <div
              key={day.day}
              className={`p-4 rounded-xl border transition-all ${
                day.completed
                  ? 'bg-slate-50/80 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      day.completed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    D{day.day}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>DAY {day.day}: {day.title}</span>
                      {day.completed && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                          Completed
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-blue-600 font-semibold">{day.focusArea}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {day.estimatedMinutes || 30} mins
                  </span>

                  <button
                    onClick={() => togglePlanTask(day.day, 0)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      day.completed
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {day.completed ? 'Mark Incomplete' : 'Mark Completed'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-2.5 pl-10">{day.description}</p>

              {day.actionItems && day.actionItems.length > 0 && (
                <div className="pl-10 space-y-1">
                  {day.actionItems.map((act, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2 text-[11px] text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

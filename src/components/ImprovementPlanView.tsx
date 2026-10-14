import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  PlayCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const ImprovementPlanView: React.FC = () => {
  const { currentPlan, togglePlanTask, setCurrentPage, startInterview, targetJob } = useApp();

  const completedDaysCount = currentPlan.filter((p) => p.completed).length;
  const progressPercent = currentPlan.length > 0 ? Math.round((completedDaysCount / currentPlan.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>AI-Driven Weakness Remediation Syllabus</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Personalized 7-Day Improvement Plan
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Targeting your verified weaknesses for {targetJob.role}: Answer Structure (STAR), spoken filler words, and technical project defense.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('practice')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch Today&apos;s Practice</span>
        </button>
      </div>

      {/* Progress Metric Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Curriculum Completion
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {completedDaysCount} of {currentPlan.length} Days Done
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {progressPercent}% Complete
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Keep up the streak to ensure high interview readiness before campus drives.
          </p>
        </div>

        <div className="w-full sm:w-64 bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {currentPlan.map((day) => (
          <div
            key={day.day}
            className={`bg-white rounded-2xl p-5 border transition-all ${
              day.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    day.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-600 text-white'
                  }`}
                >
                  {day.day}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Day {day.day}: {day.title}</span>
                    {day.completed && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Completed
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-blue-600 font-semibold">{day.focusArea}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {day.estimatedMinutes || 30} mins
                </span>
                <button
                  onClick={() => togglePlanTask(day.day, 0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    day.completed
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {day.completed ? 'Mark Incomplete' : 'Mark Completed'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 pl-11 mb-3">{day.description}</p>

            {day.actionItems && day.actionItems.length > 0 && (
              <div className="pl-11 space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Specific Action Steps:
                </p>
                {day.actionItems.map((act, aIdx) => (
                  <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

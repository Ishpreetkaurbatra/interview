import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  Zap,
  BarChart3,
  PlayCircle,
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { interviews, readinessScore, previousScore, improvementPercentage, startInterview } = useApp();

  const sessions = interviews.filter((i) => i.status === 'completed' && i.finalReport);

  const scoreHistory = [
    { label: 'Interview 1', score: 58, date: 'Sep 12' },
    { label: 'Interview 2', score: 64, date: 'Sep 22' },
    { label: 'Interview 3', score: 69, date: 'Oct 02' },
    { label: 'Interview 4', score: 75, date: 'Oct 12' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Progress Tracking & Performance Analytics</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Interview Score History & Competency Evolution
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Track your continuous improvement across mock interview sessions. See how your readiness score climbed from 58% to 75%.
          </p>
        </div>

        <button
          onClick={() => startInterview({ totalQuestions: 5 })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Take Next Interview</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Current Readiness
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{readinessScore}%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +{improvementPercentage}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target threshold: 75% achieved</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Sessions Completed
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-blue-600">{interviews.length}</span>
            <span className="text-xs text-slate-500">Rounds</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">20 total questions answered</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Baseline Progression
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">+17%</span>
            <span className="text-xs text-slate-500">Overall</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From 58% (Day 1) to 75%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Predicted Placement Probability
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-600">84%</span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              High
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Software Developer Fresher Bar</p>
        </div>
      </div>

      {/* Visual Chart: Interview Score History (USP Requirement 15) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interview Score History Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Demonstrating the continuous adaptive learning curve across mock sessions
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span>Overall Score Curve</span>
          </div>
        </div>

        {/* Bar & Line Visualizer */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 h-48 items-end pt-6 pb-2 border-b border-slate-100">
            {scoreHistory.map((pt, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group">
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                  {pt.score}%
                </span>
                <div className="w-full max-w-[64px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-36">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 group-hover:brightness-110 ${
                      idx === scoreHistory.length - 1
                        ? 'bg-blue-600 shadow-sm shadow-blue-500/30'
                        : 'bg-blue-400'
                    }`}
                    style={{ height: `${(pt.score / 100) * 100}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-slate-800">{pt.label}</p>
                  <p className="text-[10px] text-slate-400">{pt.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>Interview 1 → 58%</span>
            <span>Interview 2 → 64%</span>
            <span>Interview 3 → 69%</span>
            <span className="font-bold text-blue-600">Interview 4 → 75% (Target Met)</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Over Time (USP Requirement 15) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Competency Evolution Over Time
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Tracking technical and behavioral sub-criteria from first mock round to latest
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { name: 'Technical Knowledge', initial: 62, latest: 78, delta: '+16%' },
            { name: 'Communication', initial: 55, latest: 72, delta: '+17%' },
            { name: 'Confidence', initial: 54, latest: 68, delta: '+14%' },
            { name: 'Problem Solving', initial: 60, latest: 81, delta: '+21%' },
            { name: 'Answer Quality', initial: 58, latest: 74, delta: '+16%' },
          ].map((skill, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block line-clamp-1">{skill.name}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">{skill.latest}%</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {skill.delta}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Initial: {skill.initial}%</span>
                  <span>Now: {skill.latest}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${skill.latest}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

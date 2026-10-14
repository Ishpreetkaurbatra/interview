import React from 'react';
import { useApp } from '../context/AppContext';
import {
  PlayCircle,
  Dumbbell,
  FileText,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Target,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    readinessScore,
    previousScore,
    improvementPercentage,
    interviews,
    setCurrentPage,
    startInterview,
    targetJob,
  } = useApp();

  const recentInterviews = interviews.slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Readiness Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser?.fullName || 'Student'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Targeting <span className="font-semibold text-slate-700">{targetJob.role}</span>.
            Your AI trainer adapts follow-up questions to your answers and targets your weaknesses.
          </p>
        </div>

        {/* Readiness Metric Pill */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/70 shrink-0">
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Readiness
            </span>
            <span className="text-2xl font-black text-blue-600 leading-none">
              {readinessScore}%
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-[11px] text-slate-400">Previous:</span>
              <span className="font-semibold text-slate-800">{previousScore}%</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{improvementPercentage}% gain</span>
            </div>
          </div>

          <button
            onClick={() => startInterview({ totalQuestions: 5 })}
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Round</span>
          </button>
        </div>
      </div>

      {/* 2. Four Clean Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => startInterview({ totalQuestions: 5 })}
          className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <PlayCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Adaptive
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-900">1. Start Mock Interview</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              5-question round with real-time audio and speech recognition.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-semibold text-blue-600 flex items-center gap-0.5">
            Begin Round →
          </span>
        </div>

        <div
          onClick={() => setCurrentPage('practice')}
          className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Practice
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-900">2. Practice Weak Areas</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Targeted drills for STAR behavioral questions and verbal pacing.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-semibold text-amber-600 flex items-center gap-0.5">
            Start Drills →
          </span>
        </div>

        <div
          onClick={() => setCurrentPage('resume')}
          className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Profile
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-900">3. Resume Analysis</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Extracted projects, technical skills, and anticipated questions.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
            Review Resume →
          </span>
        </div>

        <div
          onClick={() => setCurrentPage('progress')}
          className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              Stats
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-900">4. Progress Report</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Historical score timeline from 58% up to 75% readiness.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-semibold text-purple-600 flex items-center gap-0.5">
            View Trends →
          </span>
        </div>
      </div>

      {/* 3. Two Organized Side-by-Side Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Strengths & Weaknesses */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Current Strengths & Weaknesses
          </h3>

          <div className="space-y-3">
            {/* Strengths */}
            <div>
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Strengths</span>
              </p>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>Technical Knowledge</span>
                  <span className="font-bold text-emerald-600">78%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>Problem Solving</span>
                  <span className="font-bold text-emerald-600">81%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>Communication</span>
                  <span className="font-bold text-emerald-600">72%</span>
                </div>
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <p className="text-[11px] font-bold text-rose-700 flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Areas to Improve</span>
              </p>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>Answer Structure (STAR)</span>
                  <span className="font-bold text-rose-600">60%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>Confidence & Pauses</span>
                  <span className="font-bold text-rose-600">65%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span>Behavioral Questions</span>
                  <span className="font-bold text-rose-600">64%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentPage('improvement-plan')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 text-center transition"
            >
              View 7-Day Improvement Plan →
            </button>
          </div>
        </div>

        {/* Right: Recommended Practice */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recommended Practice for Weak Areas
            </h3>
            <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              AI Tailored
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                  Target: STAR Structure
                </span>
                <span>Behavioral • Medium</span>
              </div>
              <p className="text-xs font-medium text-slate-900 leading-snug">
                “Describe a time when you faced an ambiguous engineering problem. What was your personal action and measurable result?”
              </p>
              <div className="mt-2 flex items-center justify-end">
                <button
                  onClick={() => setCurrentPage('practice')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Practice Question →
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                  Target: Confidence & Pauses
                </span>
                <span>Technical • Medium</span>
              </div>
              <p className="text-xs font-medium text-slate-900 leading-snug">
                “Explain how relational database indexing works in PostgreSQL and why improper indexing degrades write throughput.”
              </p>
              <div className="mt-2 flex items-center justify-end">
                <button
                  onClick={() => setCurrentPage('practice')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Practice Question →
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                  Target: Project Defense
                </span>
                <span>Architecture • Hard</span>
              </div>
              <p className="text-xs font-medium text-slate-900 leading-snug">
                “In your Smart Infrastructure Monitoring project, how would you redesign the sensor ingestion pipeline to scale to 100,000 devices?”
              </p>
              <div className="mt-2 flex items-center justify-end">
                <button
                  onClick={() => setCurrentPage('practice')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Practice Question →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Interviews Sorted Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Recent Mock Interviews
          </h3>
          <button
            onClick={() => setCurrentPage('history')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            View all ({interviews.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase">
                <th className="pb-2">Date</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Difficulty</th>
                <th className="pb-2">Score</th>
                <th className="pb-2 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentInterviews.map((session) => {
                const score = session.finalReport?.overallScore || 70;
                return (
                  <tr key={session.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 text-slate-500 font-medium">{session.date}</td>
                    <td className="py-2.5 font-semibold text-slate-900">{session.role}</td>
                    <td className="py-2.5">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                        {session.interviewType}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600">{session.difficulty}</td>
                    <td className="py-2.5 font-bold text-slate-900">{score}%</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setCurrentPage('history')}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

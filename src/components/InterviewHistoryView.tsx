import React from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  Clock,
  Award,
  ChevronRight,
  PlayCircle,
  FileText,
  Calendar,
} from 'lucide-react';

export const InterviewHistoryView: React.FC = () => {
  const { interviews, setCurrentPage, startInterview } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
            <History className="w-3.5 h-3.5" />
            <span>Complete Academic Mock Archives</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Interview History & Evaluations
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Review detailed feedback from your past interview rounds, examine individual question evaluations, and measure your preparation velocity.
          </p>
        </div>

        <button
          onClick={() => startInterview({ totalQuestions: 5 })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <PlayCircle className="w-4 h-4" />
          <span>New Mock Session</span>
        </button>
      </div>

      {/* History Cards */}
      <div className="space-y-4">
        {interviews.map((session, index) => {
          const score = session.finalReport?.overallScore || 70;
          return (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-base font-black text-blue-600">{score}%</span>
                  <span className="text-[9px] uppercase font-bold text-blue-400">Score</span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{session.role}</h3>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {session.interviewType}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {session.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Company: <span className="text-slate-700 font-medium">{session.company}</span> •{' '}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {session.date}
                    </span>
                  </p>

                  {session.finalReport && (
                    <p className="text-[11px] text-slate-600 mt-2 line-clamp-1 italic">
                      “{session.finalReport.executiveSummary}”
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setCurrentPage('final-report')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Report</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

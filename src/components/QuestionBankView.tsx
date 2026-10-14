import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QUESTION_BANK } from '../data/mockData';
import {
  HelpCircle,
  Search,
  Filter,
  ChevronDown,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { QuestionBankItem } from '../types';

export const QuestionBankView: React.FC = () => {
  const { startInterview } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBankItem | null>(null);

  const categories = ['All', 'HR', 'Technical', 'Behavioral', 'Coding', 'Project', 'Situational'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuestions = QUESTION_BANK.filter((q) => {
    const matchesCat = categoryFilter === 'All' || q.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesDiff && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Engineering Question Repository</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Question Bank
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Browse authentic campus placement questions across HR, Technical, and Behavioral tracks. Study expected key points and model answers.
          </p>
        </div>

        <button
          onClick={() => startInterview({ totalQuestions: 5 })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch Adaptive Mock</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by keyword, topic, or role..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Track:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-transparent text-slate-700 font-semibold focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Level:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="text-xs bg-transparent text-slate-700 font-semibold focus:outline-none"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Question Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                    {q.category}
                  </span>
                  <span className="font-semibold text-slate-500 text-[11px]">{q.topic}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    q.difficulty === 'Hard'
                      ? 'bg-rose-100 text-rose-700'
                      : q.difficulty === 'Medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {q.difficulty}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                “{q.question}”
              </h3>

              <div className="mt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Expected Competencies:
                </p>
                <div className="flex flex-wrap gap-1">
                  {q.expectedKeyPoints.map((pt, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100"
                    >
                      {pt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">{q.role}</span>
              <button
                onClick={() => setSelectedQuestion(q)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Inspect Model Answer →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Model Answer Drawer/Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 uppercase">
                  {selectedQuestion.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedQuestion.topic}
                </span>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-800"
              >
                Close ✕
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              “{selectedQuestion.question}”
            </h3>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-800 mb-1.5">Expected Key Points:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                {selectedQuestion.expectedKeyPoints.map((k, idx) => (
                  <li key={idx}>{k}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 mb-1.5">
                Recommended Model Answer Architecture:
              </p>
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                {selectedQuestion.sampleModelAnswer}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  startInterview({ totalQuestions: 3 });
                }}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                Practice in Mock Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

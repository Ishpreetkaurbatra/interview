import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Dumbbell,
  Sparkles,
  Send,
  Mic,
  Square,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';

export const PracticeMode: React.FC = () => {
  const { isAiProcessing } = useApp();

  const [topic, setTopic] = useState('Python');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(3);

  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isPracticing, setIsPracticing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);

  const handleGenerateQuestions = async () => {
    setIsPracticing(true);
    setGeneratedQuestions([]);
    setActiveQuestionIndex(0);
    setFeedback(null);
    setAnswerText('');

    try {
      const res = await fetch('/api/practice/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count: questionCount }),
      });
      const data = await res.json();
      setGeneratedQuestions(data.questions || []);
    } catch (err) {
      console.error('Failed to generate practice questions:', err);
    }
  };

  const currentQ = generatedQuestions[activeQuestionIndex];

  const handleEvaluatePracticeAnswer = async () => {
    if (!answerText.trim() || !currentQ) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: currentQ.question,
          questionCategory: currentQ.category || 'Technical',
          targetSkillOrCompetency: topic,
          difficulty,
          studentAnswer: answerText,
        }),
      });
      const evalData = await res.json();
      setFeedback(evalData);
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextPracticeQuestion = () => {
    setFeedback(null);
    setAnswerText('');
    if (activeQuestionIndex + 1 < generatedQuestions.length) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else {
      setIsPracticing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2 border border-amber-100">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Targeted Quick Practice Arena</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Practice Mode
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Select any technical or behavioral topic, choose your target difficulty, and get instant line-by-line feedback on every response.
          </p>
        </div>
      </div>

      {!isPracticing ? (
        /* Setup Form */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-2xl mx-auto space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Configure Quick Drill</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Practice Topic
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                'Python',
                'SQL',
                'Java',
                'STAR Behavioral',
                'System Architecture',
                'HR & Motivation',
              ].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                    topic === t
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              >
                <option value="Easy">Easy (Foundations)</option>
                <option value="Medium">Medium (Standard Core)</option>
                <option value="Hard">Hard (Deep Constraints)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              >
                <option value={3}>3 Questions (Express)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Intensive)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateQuestions}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Practice Questions with AI</span>
          </button>
        </div>
      ) : (
        /* Active Practice Interface */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {topic} • {difficulty}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Question {activeQuestionIndex + 1} of {generatedQuestions.length}
              </h3>
            </div>
            <button
              onClick={() => setIsPracticing(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              Exit Practice
            </button>
          </div>

          {currentQ ? (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
                <h4 className="text-base font-bold text-slate-900 leading-relaxed">
                  “{currentQ.question}”
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Answer:
                </label>
                <textarea
                  rows={5}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                  placeholder="Type your structured answer here..."
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {answerText.trim().split(/\s+/).filter(Boolean).length} words
                </span>

                <button
                  onClick={handleEvaluatePracticeAnswer}
                  disabled={isEvaluating || !answerText.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-xs transition"
                >
                  {isEvaluating ? 'Evaluating...' : 'Get Instant Feedback'}
                </button>
              </div>

              {/* Feedback Drawer */}
              {feedback && (
                <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800">
                      Score: <span className="text-blue-600">{feedback.overallScore}%</span>
                    </span>
                    <button
                      onClick={handleNextPracticeQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition"
                    >
                      {activeQuestionIndex + 1 < generatedQuestions.length
                        ? 'Next Practice Question →'
                        : 'Finish Practice Round'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <p className="font-bold text-emerald-800 mb-1">What Was Good:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-900 text-[11px]">
                        {feedback.whatWasGood?.map((g: string, i: number) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                      <p className="font-bold text-rose-800 mb-1">Could Be Improved:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-rose-900 text-[11px]">
                        {feedback.whatCouldBeImproved?.map((b: string, i: number) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800 mb-1">Model Answer Rationale:</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                      {feedback.betterAnswerSuggestion}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              Generating questions from AI engine...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

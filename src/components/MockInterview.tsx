import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  Square,
  Send,
  SkipForward,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Award,
  Zap,
  Info,
  RefreshCw,
} from 'lucide-react';
import { AnswerEvaluation } from '../types';

export const MockInterview: React.FC = () => {
  const {
    activeInterview,
    activeTurn,
    submitAnswer,
    nextQuestion,
    finishInterview,
    cancelInterview,
    isAiProcessing,
    activeEvaluation,
    clearActiveEvaluation,
    targetJob,
  } = useApp();

  const [studentText, setStudentText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Live filler words tracking during speech
  const [liveFillersCount, setLiveFillersCount] = useState(0);

  // Web Speech Recognition reference
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Total questions count
  const totalQuestions = activeInterview?.totalQuestions || 5;
  const currentQuestionNumber = (activeInterview?.history.length || 0) + 1;

  // Speak out question when turn changes
  useEffect(() => {
    if (!activeTurn || isVoiceMuted) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeTurn.questionText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsInterviewerSpeaking(true);
      utterance.onend = () => setIsInterviewerSpeaking(false);
      utterance.onerror = () => setIsInterviewerSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }

    setStudentText('');
    setRecordingSeconds(0);
    setLiveFillersCount(0);
    setShowTips(false);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeTurn?.questionId, isVoiceMuted]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Setup Web Speech API for voice recording
  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your answer or use Google Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setStudentText(transcript);

        // Track live filler words
        const fillerList = ['um', 'uh', 'like', 'actually', 'basically', 'sort of', 'you know'];
        const lower = transcript.toLowerCase();
        let count = 0;
        fillerList.forEach((w) => {
          const matches = lower.match(new RegExp(`\\b${w}\\b`, 'gi'));
          if (matches) count += matches.length;
        });
        setLiveFillersCount(count);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!studentText.trim()) return;

    if (isRecording) {
      stopRecording();
    }

    const words = studentText.trim().split(/\s+/).length;
    const spokenMetrics = {
      durationSeconds: recordingSeconds > 0 ? recordingSeconds : Math.round(words / 2.2),
      wordCount: words,
    };

    const evaluation = await submitAnswer(studentText, recordingSeconds > 0, spokenMetrics);
    if (evaluation) {
      setShowEvaluationModal(true);
    }
  };

  const handleSkip = async () => {
    if (isRecording) stopRecording();
    const evaluation = await submitAnswer(
      "I am not sure about this specific topic, could you please explain or ask me another question?",
      false,
      { durationSeconds: 5, wordCount: 16 }
    );
    if (evaluation) {
      setShowEvaluationModal(true);
    }
  };

  const handleNextQuestion = async () => {
    setShowEvaluationModal(false);
    await nextQuestion();
  };

  if (!activeTurn) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-blue-600 mx-auto animate-spin" />
        <h3 className="text-base font-bold text-slate-800">Preparing Interview Chamber...</h3>
        <p className="text-xs text-slate-500">Retrieving personalized question stream.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Top Bar: Progress, Question Counter, Difficulty */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-600/30">
            Q{currentQuestionNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Question {currentQuestionNumber} of {totalQuestions}
              </h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
                {activeTurn.category}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  activeTurn.difficulty === 'hard'
                    ? 'bg-rose-100 text-rose-700'
                    : activeTurn.difficulty === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {activeTurn.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Role: <span className="font-semibold text-slate-700">{targetJob.role}</span>
              {activeTurn.isFollowUp && (
                <span className="ml-2 text-indigo-600 font-semibold">• Adaptive Follow-up</span>
              )}
            </p>
          </div>
        </div>

        {/* Progress & Cancel */}
        <div className="flex items-center gap-4">
          <div className="w-32 sm:w-48 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
            />
          </div>

          <button
            onClick={cancelInterview}
            className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
          >
            End Early
          </button>
        </div>
      </div>

      {/* Main Grid: LEFT Interviewer Avatar | RIGHT Question & Answer Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Interviewer Avatar Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  isInterviewerSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'
                }`}
              />
              {isInterviewerSpeaking ? 'Interviewer Speaking...' : 'Listening to Candidate'}
            </span>
            <button
              onClick={() => setIsVoiceMuted(!isVoiceMuted)}
              className="p-1 rounded text-slate-500 hover:text-slate-800"
              title={isVoiceMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Interactive Avatar */}
          <div className="my-6 relative flex flex-col items-center">
            <div
              className={`w-32 h-32 rounded-3xl p-1 bg-gradient-to-tr from-blue-600 to-indigo-500 transition-all ${
                isInterviewerSpeaking ? 'ring-4 ring-blue-300 scale-105' : ''
              }`}
            >
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
                alt="AI Interviewer"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Speaking audio wave animation */}
            {isInterviewerSpeaking && (
              <div className="flex items-center gap-1 mt-3">
                <span className="w-1 h-3 bg-blue-600 rounded-full animate-bounce" />
                <span className="w-1 h-5 bg-blue-600 rounded-full animate-bounce delay-75" />
                <span className="w-1 h-7 bg-blue-600 rounded-full animate-bounce delay-150" />
                <span className="w-1 h-4 bg-blue-600 rounded-full animate-bounce delay-100" />
                <span className="w-1 h-2 bg-blue-600 rounded-full animate-bounce" />
              </div>
            )}

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Dr. Sarah Jenkins</h3>
              <p className="text-[11px] text-slate-500">
                Senior Technical Hiring Lead & CEP Evaluator
              </p>
            </div>
          </div>

          {/* Question Rationale Box */}
          <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
              Adaptive Question Logic
            </span>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              {activeTurn.followUpRationale ||
                'Selected based on your resume projects and competency roadmap for Software Developer.'}
            </p>
          </div>
        </div>

        {/* RIGHT: Question & Student Answer Console */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          {/* Question Text Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Interviewer Asks:
              </span>
              <button
                onClick={() => setShowTips(!showTips)}
                className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showTips ? 'Hide Tips' : 'Need a Hint?'}</span>
              </button>
            </div>

            <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                “{activeTurn.questionText}”
              </h3>
              <p className="text-xs text-blue-700/80 mt-2 font-medium">
                Target Competency: <span className="font-semibold">{activeTurn.targetSkillOrCompetency}</span>
              </p>
            </div>

            {/* Hint collapsible */}
            {showTips && activeTurn.tips && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1 mb-1 text-amber-800">
                  <Zap className="w-3.5 h-3.5" />
                  Coach Coaching Hints:
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-800/90 text-[11px]">
                  {activeTurn.tips.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Student Answer Input Console */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">Your Response:</span>
                {isRecording && (
                  <span className="flex items-center gap-1 text-rose-600 font-bold text-xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    Recording: {recordingSeconds}s
                  </span>
                )}
                {liveFillersCount > 0 && (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Fillers: {liveFillersCount}
                  </span>
                )}
              </div>

              <span className="text-slate-400 text-[11px]">
                {studentText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={6}
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 leading-relaxed font-sans placeholder:text-slate-400"
              placeholder={
                isRecording
                  ? 'Speak clearly into your microphone. Your voice is transcribing live in real time...'
                  : 'Type your answer here, or click "Start Recording" to speak using your microphone...'
              }
            />

            {/* Controls Bar: 🎤 Start Recording | ⏹ Stop | ➡ Submit Answer | ⏭ Skip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <Mic className="w-4 h-4 text-rose-400" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition animate-pulse"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop Recording ({recordingSeconds}s)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isAiProcessing}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip Question</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isAiProcessing || !studentText.trim()}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold shadow-sm transition ${
                  isAiProcessing || !studentText.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-95'
                }`}
              >
                {isAiProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating with AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INSTANT ADAPTIVE EVALUATION MODAL / DRAWER (USP Requirements 10, 11, 12) */}
      {showEvaluationModal && activeEvaluation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            {/* Header: Score & Headline */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wide">
                  AI Answer Evaluation
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Answer Score: {activeEvaluation.overallScore}%
                </h3>
                <p className="text-xs text-slate-500">
                  Adaptive diagnosis based on technical depth, STAR structure, and spoken delivery.
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`text-2xl font-black ${
                    activeEvaluation.overallScore >= 75
                      ? 'text-emerald-600'
                      : activeEvaluation.overallScore >= 60
                      ? 'text-blue-600'
                      : 'text-amber-600'
                  }`}
                >
                  {activeEvaluation.overallScore}%
                </span>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                  Competency
                </span>
              </div>
            </div>

            {/* 7 Core Evaluation Metric Sliders (Relevance, Accuracy, Communication, Structure, Confidence, Completeness, Problem Solving) */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Score Breakdown (7 Evaluation Metrics)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Relevance', val: activeEvaluation.relevance },
                  { label: 'Technical Accuracy', val: activeEvaluation.technicalAccuracy },
                  { label: 'Communication', val: activeEvaluation.communication },
                  { label: 'Answer Structure', val: activeEvaluation.structure },
                  { label: 'Confidence', val: activeEvaluation.confidence },
                  { label: 'Completeness', val: activeEvaluation.completeness },
                  { label: 'Problem Solving', val: activeEvaluation.problemSolving },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span className="text-blue-600">{item.val}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STAR Analyzer (If behavioral or applicable) */}
            {activeEvaluation.starAnalysis && activeEvaluation.starAnalysis.isStarApplicable && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-400" />
                    STAR Behavioral Framework Analysis
                  </span>
                  <span className="text-[10px] text-slate-400">Situation • Task • Action • Result</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-300">S - Situation</span>
                      <span>{activeEvaluation.starAnalysis.situation.score}%</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                      {activeEvaluation.starAnalysis.situation.feedback}
                    </p>
                  </div>

                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-300">T - Task</span>
                      <span>{activeEvaluation.starAnalysis.task.score}%</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                      {activeEvaluation.starAnalysis.task.feedback}
                    </p>
                  </div>

                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-300">A - Action</span>
                      <span>{activeEvaluation.starAnalysis.action.score}%</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                      {activeEvaluation.starAnalysis.action.feedback}
                    </p>
                  </div>

                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-300">R - Result</span>
                      <span>{activeEvaluation.starAnalysis.result.score}%</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                      {activeEvaluation.starAnalysis.result.feedback}
                    </p>
                  </div>
                </div>

                {activeEvaluation.starAnalysis.starAdvice && (
                  <p className="text-xs text-blue-200 bg-slate-800/80 p-2 rounded-lg italic">
                    💡 STAR Tip: {activeEvaluation.starAnalysis.starAdvice}
                  </p>
                )}
              </div>
            )}

            {/* Communication Analysis (Fillers & Clarity) */}
            {activeEvaluation.communicationAnalysis && (
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  Communication & Verbal Flow Analysis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 mt-2">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pacing</span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {activeEvaluation.communicationAnalysis.speakingPaceAssessment}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Clarity Rating</span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {activeEvaluation.communicationAnalysis.clarityRating}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Filler Words Detected</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {activeEvaluation.communicationAnalysis.fillerWordsDetected.length > 0 ? (
                        activeEvaluation.communicationAnalysis.fillerWordsDetected.map((f, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded"
                          >
                            &quot;{f.word}&quot; ({f.count})
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-semibold">Zero fillers detected! ✓</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  {activeEvaluation.communicationAnalysis.feedback}
                </p>
              </div>
            )}

            {/* WHAT WAS GOOD vs WHAT COULD BE IMPROVED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  What Was Good
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeEvaluation.whatWasGood.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4">
                <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  What Could Be Improved
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeEvaluation.whatCouldBeImproved.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* BETTER ANSWER (Teaching How to Improve, Not Just Giving Answers) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Coach Coaching Model: How to Elevate This Answer
              </h5>
              <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans bg-white p-3.5 rounded-xl border border-slate-200 mt-2">
                {activeEvaluation.betterAnswerSuggestion}
              </div>
            </div>

            {/* Next Action Footer */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {currentQuestionNumber >= totalQuestions
                  ? 'All questions completed! Ready for Final Report.'
                  : 'AI is dynamically configuring your next adaptive follow-up.'}
              </span>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition active:scale-95"
              >
                <span>
                  {currentQuestionNumber >= totalQuestions
                    ? 'Generate Final Performance Report'
                    : 'Proceed to Next Adaptive Question'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

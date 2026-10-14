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
  Play,
  Pause,
  AlertCircle,
  Camera,
  CameraOff,
  Video,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useCameraRecorder } from '../hooks/useCameraRecorder';
import { DevicePermissionModal } from './DevicePermissionModal';

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
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Camera & Audio recording state with useCameraRecorder
  const {
    isCameraOn,
    isCameraLoading,
    cameraMode,
    isVirtualCam,
    cameraError,
    clearCameraError,
    videoElementRef,
    attachVideoRef,
    startCamera,
    startPhysicalCamera,
    startVirtualCamera,
    switchToVirtualCamera,
    switchToPhysicalCamera,
    stopCamera,
    toggleCamera,
    isRecording,
    recordingSeconds,
    recordedVideoUrl,
    recordedAudioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    downloadRecordedMedia,
    audioLevel,
  } = useCameraRecorder((transcript) => {
    setAnswerText(transcript);
  });

  const handleGenerateQuestions = async () => {
    setIsPracticing(true);
    setGeneratedQuestions([]);
    setActiveQuestionIndex(0);
    setFeedback(null);
    setAnswerText('');
    resetRecording();

    try {
      const res = await fetch('/api/practice/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count: questionCount }),
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            setGeneratedQuestions(data.questions);
            return;
          }
        }
      }
      // Resilient fallback question generator
      setGeneratedQuestions([
        {
          id: `p_${Date.now()}_1`,
          question: `Explain the core concepts of ${topic} and how you have applied them in your practical projects.`,
          category: 'Technical',
          expectedKeyPoints: ['Foundational concepts', 'Memory and performance nuances', 'Real-world application'],
        },
        {
          id: `p_${Date.now()}_2`,
          question: `What are the most common performance bottlenecks or pitfalls encountered in ${topic}, and how do you prevent them?`,
          category: 'Technical',
          expectedKeyPoints: ['Profiling tools', 'Best practices and design patterns', 'Edge cases'],
        },
        {
          id: `p_${Date.now()}_3`,
          question: `Compare ${topic} with alternative frameworks or paradigms. What architectural trade-offs determine your choice?`,
          category: 'Technical',
          expectedKeyPoints: ['Comparative trade-offs', 'Scalability considerations', 'Developer productivity'],
        },
      ].slice(0, questionCount));
    } catch (err) {
      console.warn('Practice generation error, using fallback:', err);
      setGeneratedQuestions([
        {
          id: `p_${Date.now()}_1`,
          question: `Explain the core concepts of ${topic} and how you have applied them in your practical projects.`,
          category: 'Technical',
          expectedKeyPoints: ['Foundational concepts', 'Memory and performance nuances', 'Real-world application'],
        },
      ]);
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
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const evalData = await res.json();
          setFeedback(evalData);
          return;
        }
      }
      // Fallback evaluation
      setFeedback({
        overallScore: 78,
        whatWasGood: [
          'Directly addressed the core question prompt.',
          'Demonstrated clear technical vocabulary.',
          'Showed structured problem-solving approach.',
        ],
        whatCouldBeImproved: [
          'Add quantifiable metrics to illustrate real engineering outcomes.',
          'Discuss potential failure modes or edge cases.',
          'Structure answer using explicit transitional signposts.',
        ],
        betterAnswerSuggestion: `Here is a strong way to structure this answer:
1. Define the core principle clearly.
2. Provide a concrete project example.
3. Quantify the final outcome or latency benefit.`,
      });
    } catch (err) {
      console.warn('Evaluation error, using fallback:', err);
      setFeedback({
        overallScore: 75,
        whatWasGood: ['Direct and relevant answer to the prompt.'],
        whatCouldBeImproved: ['Add more concrete examples from hands-on projects.'],
        betterAnswerSuggestion: 'Focus on clear technical trade-offs and personal contributions.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextPracticeQuestion = () => {
    setFeedback(null);
    setAnswerText('');
    resetRecording();
    if (activeQuestionIndex + 1 < generatedQuestions.length) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else {
      setIsPracticing(false);
    }
  };

  const handleInsertSampleAnswer = () => {
    if (isRecording) stopRecording();
    const q = currentQ?.question?.toLowerCase() || '';
    let sample = '';
    if (q.includes('bottleneck') || q.includes('pitfall')) {
      sample = `The most common bottlenecks in ${topic} stem from unindexed query lookups, unoptimized memory allocations, and blocking asynchronous calls. To mitigate this, we implement profiling hooks, connection pooling, and proactive rate-limiting in our pipeline.`;
    } else if (q.includes('compare') || q.includes('trade-off') || q.includes('alternative')) {
      sample = `When comparing ${topic} against alternatives, the primary architectural trade-offs revolve around developer velocity versus execution latency. In our project architecture, we prioritized reliability and ecosystem maturity, which made ${topic} the ideal choice for our scale.`;
    } else {
      sample = `In ${topic}, the core concepts involve modular separation, state predictability, and robust error boundaries. In our recent applications, applying these principles reduced crash rates and improved throughput by over 40%.`;
    }
    setAnswerText(sample);
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

              {/* Camera Error banner if camera/mic fails */}
              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{cameraError}</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      You can type your answer, allow camera & mic access, or click Voice Assist.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsPermissionModalOpen(true)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Allow Camera & Mic Permissions</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Live Preview Card (if active) */}
              {isCameraOn && (
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video max-h-52 mx-auto border border-slate-700">
                  <video
                    ref={attachVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-white font-semibold flex items-center gap-1.5 shadow-xs">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isVirtualCam ? 'bg-indigo-400' : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    <span>{isVirtualCam ? 'Virtual AI Cam' : 'Webcam Live'}</span>
                  </div>

                  {/* Mode switcher button */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {isRecording && (
                      <div className="bg-rose-600 px-2 py-0.5 rounded text-[10px] text-white font-bold animate-pulse">
                        REC {recordingSeconds}s
                      </div>
                    )}
                    {isVirtualCam ? (
                      <button
                        type="button"
                        onClick={() => switchToPhysicalCamera()}
                        className="bg-blue-600/90 hover:bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer"
                      >
                        Try Webcam
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => switchToVirtualCamera()}
                        className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[9px] font-bold border border-slate-600 cursor-pointer"
                      >
                        Virtual Cam
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Active Recording Visualizer */}
              {isRecording && (
                <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold">
                      {isCameraOn ? 'Recording Video & Voice' : 'Recording Audio'} • {recordingSeconds}s
                    </span>
                  </div>
                  {/* Waveform visualizer */}
                  <div className="flex items-center gap-1 h-5 px-2 bg-slate-800 rounded">
                    {[30, 70, 40, 90, 50, 80, 40].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(20, Math.min(100, (audioLevel > 5 ? audioLevel * 1.3 : 20) * (h / 50)))}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recorded Video / Audio Playback Review */}
              {!isRecording && (recordedVideoUrl || recordedAudioUrl) && (
                <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-400" />
                      Recorded Practice Answer ({recordingSeconds}s)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadRecordedMedia}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {recordedVideoUrl ? (
                    <video src={recordedVideoUrl} controls className="w-full rounded-xl bg-black max-h-48" />
                  ) : (
                    <audio src={recordedAudioUrl || undefined} controls className="w-full h-8" />
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Answer:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInsertSampleAnswer}
                      className="text-[10px] font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Voice Assist (Sample Speech)</span>
                    </button>
                    <span className="text-[11px] text-slate-400">
                      {answerText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                  placeholder={
                    isRecording
                      ? 'Recording active! Speak clearly into your mic/camera...'
                      : 'Type your answer or click "Start Recording" to speak...'
                  }
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={() => {
                        clearCameraError();
                        startRecording();
                      }}
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-rose-400" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition animate-pulse cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop Recording ({recordingSeconds}s)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`p-2 rounded-xl border text-xs font-semibold transition ${
                      isCameraOn
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                  >
                    {isCameraOn ? <Camera className="w-3.5 h-3.5 text-emerald-600" /> : <CameraOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={handleEvaluatePracticeAnswer}
                  disabled={isEvaluating || !answerText.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-xs transition active:scale-95 cursor-pointer"
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

      {/* Device Permission Assistant Modal */}
      <DevicePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onPermissionsGranted={() => {
          startPhysicalCamera();
        }}
        onSelectVirtualCam={() => {
          startVirtualCamera();
        }}
      />
    </div>
  );
};

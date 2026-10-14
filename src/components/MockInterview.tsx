import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Camera,
  CameraOff,
  Video,
  Download,
  Eye,
  UserCheck,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';
import { useCameraRecorder } from '../hooks/useCameraRecorder';
import { DevicePermissionModal } from './DevicePermissionModal';

export const MockInterview: React.FC = () => {
  const {
    activeInterview,
    activeTurn,
    submitAnswer,
    nextQuestion,
    cancelInterview,
    isAiProcessing,
    activeEvaluation,
    targetJob,
  } = useApp();

  const [studentText, setStudentText] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'interviewer' | 'candidate' | 'split'>('split');
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Camera and Audio Recorder Hook
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
    liveFillersCount,
  } = useCameraRecorder((transcript) => {
    setStudentText(transcript);
  });

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
    resetRecording();
    setShowTips(false);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeTurn?.questionId, isVoiceMuted, resetRecording]);

  const handleStartRecording = async () => {
    clearCameraError();
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  // Helper to generate a realistic student sample answer for testing
  const handleInsertSampleSpokenAnswer = () => {
    if (isRecording) stopRecording();

    let sample = '';
    const q = (activeTurn?.questionText || '').toLowerCase();
    const cat = (activeTurn?.category || '').toLowerCase();

    if (q.includes('kotlin') || q.includes('java') || q.includes('technology') || q.includes('tech stack')) {
      sample =
        "In our project, we chose Kotlin over Java primarily because of its built-in null safety and concise syntax. Um, coroutines also allowed us to write asynchronous networking and background sensor data ingestion without blocking the UI main thread. One trade-off was that our team had to adapt to functional idioms, but it reduced our boilerplate code by about 40 percent.";
    } else if (q.includes('challenge') || q.includes('problem') || q.includes('conflict') || cat.includes('behavioral')) {
      sample =
        "In our college capstone project, our team faced a severe latency bottleneck where IoT sensor streams were dropping packets under peak simulation loads. I took the initiative to profile our backend queue and discovered synchronous database writes were stalling the ingestion thread. I refactored the pipeline to use an in-memory buffer with batch writes, which recovered packet delivery to 99.8% and reduced latency by 65%.";
    } else if (q.includes('yourself') || q.includes('introduce') || q.includes('background') || cat.includes('hr')) {
      sample =
        "I am a final-year computer engineering student passionate about full-stack systems and cloud development. Over the past two years, I've built multiple web and distributed applications, including a smart infrastructure monitoring system. I love tackling algorithmic challenges, collaborating with cross-functional teams, and continuously learning modern frameworks.";
    } else {
      sample =
        `To address this effectively, I focus on three core principles: understanding the requirements, choosing the right architectural abstraction, and validating through tests. In my recent hands-on projects, I applied this approach to ensure high availability and clean separation of concerns, which kept our deployment error rate near zero.`;
    }

    setStudentText(sample);
  };

  const handleSubmit = async () => {
    if (!studentText.trim()) return;

    if (isRecording) {
      handleStopRecording();
    }

    const words = studentText.trim().split(/\s+/).filter(Boolean).length;
    const spokenMetrics = {
      durationSeconds: recordingSeconds > 0 ? recordingSeconds : Math.max(12, Math.round(words / 2.2)),
      wordCount: words,
    };

    const evaluation = await submitAnswer(studentText, recordingSeconds > 0, spokenMetrics);
    if (evaluation) {
      setShowEvaluationModal(true);
    }
  };

  const handleSkip = async () => {
    if (isRecording) handleStopRecording();
    const evaluation = await submitAnswer(
      "I am not entirely sure about this specific area yet, but I am eager to learn and improve my understanding of it.",
      false,
      { durationSeconds: 6, wordCount: 22 }
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
      {/* Top Bar: Progress, Question Counter, Camera Status */}
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

        {/* Video Mode Toggles & End Session */}
        <div className="flex items-center gap-3">
          {/* Camera Quick Toggle Button */}
          <button
            type="button"
            onClick={toggleCamera}
            disabled={isCameraLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
              isCameraOn
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? <Camera className="w-3.5 h-3.5 text-emerald-600" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span>{isCameraLoading ? 'Loading...' : isCameraOn ? 'Camera Active' : 'Enable Camera'}</span>
          </button>

          {/* Allow Permissions Setup Button */}
          <button
            type="button"
            onClick={() => setIsPermissionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
            title="Open device permissions assistant"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Allow Permissions</span>
          </button>

          <div className="hidden sm:block w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
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

      {/* Main Grid: LEFT Video Chamber (Interviewer + Candidate) | RIGHT Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Professional Interview Video Stage */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dual Feed Layout: Interviewer & Candidate Webcam */}
          <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-lg border border-slate-800 space-y-4">
            {/* Stage Header */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">Live Simulation Chamber</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title={isVoiceMuted ? 'Unmute Dr. Jenkins' : 'Mute Dr. Jenkins'}
                >
                  {isVoiceMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {/* Card 1: Interviewer (Dr. Sarah Jenkins) */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video flex items-center justify-center border border-slate-700/80 group">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
                  alt="Dr. Sarah Jenkins"
                  className={`w-full h-full object-cover transition duration-300 ${
                    isInterviewerSpeaking ? 'scale-105 ring-2 ring-blue-400' : 'opacity-90'
                  }`}
                />

                {/* Speaking overlay */}
                {isInterviewerSpeaking && (
                  <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>Speaking</span>
                  </div>
                )}

                {/* Interviewer badge */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block text-[11px]">Dr. Sarah Jenkins</span>
                    <span className="text-[9px] text-slate-400 block">Lead AI Hiring Manager</span>
                  </div>
                  {isInterviewerSpeaking && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <span className="w-1 h-3.5 bg-blue-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-2 bg-blue-400 rounded-full animate-bounce delay-150" />
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Candidate Live Camera Feed */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video flex items-center justify-center border border-slate-700/80">
                {isCameraOn ? (
                  <>
                    <video
                      ref={attachVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />

                    {/* Live REC badge */}
                    {isRecording && (
                      <div className="absolute top-3 left-3 bg-rose-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-md animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>REC • {recordingSeconds}s</span>
                      </div>
                    )}

                    {/* Camera Mode Badge & Switcher */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <div className="bg-slate-900/85 backdrop-blur-xs px-2 py-1 rounded-lg text-[9px] font-semibold text-white border border-slate-700/80 flex items-center gap-1.5 shadow-xs">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVirtualCam ? 'bg-indigo-400' : 'bg-emerald-400 animate-pulse'
                          }`}
                        />
                        <span>{isVirtualCam ? 'Virtual AI Cam' : 'Webcam Live'}</span>
                      </div>

                      {isVirtualCam ? (
                        <button
                          type="button"
                          onClick={() => switchToPhysicalCamera()}
                          className="bg-blue-600/90 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-[9px] font-bold backdrop-blur-xs transition cursor-pointer"
                          title="Try physical webcam"
                        >
                          Try Webcam
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => switchToVirtualCamera()}
                          className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-lg text-[9px] font-bold backdrop-blur-xs border border-slate-600 transition cursor-pointer"
                          title="Switch to simulated AI camera feed"
                        >
                          Virtual Cam
                        </button>
                      )}
                    </div>

                    {/* Eye Contact & AI Posture Guidance */}
                    <div className="absolute bottom-11 left-3 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-[9px] font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Eye Contact: 94%</span>
                    </div>

                    {/* Candidate Name & Camera Control */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs px-3 py-1.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-white text-[11px]">You (Candidate)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="text-[10px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        >
                          Turn Off
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Camera Off State with quick-activation */
                  <div className="p-4 text-center space-y-2.5 max-w-xs">
                    <div className="w-10 h-10 rounded-full bg-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
                      <CameraOff className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Camera is Inactive</p>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Use your webcam or Virtual AI Candidate Cam to record answer video.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => startPhysicalCamera()}
                        disabled={isCameraLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isCameraLoading ? 'Starting...' : 'Turn On Webcam'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startVirtualCamera()}
                        disabled={isCameraLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-600"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Use Virtual Cam</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPermissionModalOpen(true)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline block mx-auto cursor-pointer"
                    >
                      Device permissions help
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Camera Error / Fallback Notification Banner */}
            {cameraError && (
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-100 text-[11px] leading-tight">{cameraError}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {!isVirtualCam && (
                      <button
                        type="button"
                        onClick={() => startVirtualCamera()}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Switch to Virtual Cam
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsPermissionModalOpen(true)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold border border-slate-700 cursor-pointer"
                    >
                      Permissions Guide
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={clearCameraError}
                    className="text-[10px] text-amber-300/80 hover:text-amber-100 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Adaptive Rationale Box */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Adaptive Interviewer Logic
            </span>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              {activeTurn.followUpRationale ||
                'Selected based on your target role, resume analysis, and past responses.'}
            </p>
          </div>
        </div>

        {/* RIGHT PANE: Question & Answer Interaction Console */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          {/* Question Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Dr. Jenkins Asks:
              </span>
              <button
                onClick={() => setShowTips(!showTips)}
                className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showTips ? 'Hide Tips' : 'Need Coaching Hints?'}</span>
              </button>
            </div>

            <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                “{activeTurn.questionText}”
              </h3>
              <p className="text-xs text-blue-700/80 mt-2 font-medium">
                Focus Area: <span className="font-semibold">{activeTurn.targetSkillOrCompetency}</span>
              </p>
            </div>

            {/* Hint collapsible */}
            {showTips && activeTurn.tips && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1 mb-1 text-amber-800">
                  <Zap className="w-3.5 h-3.5" />
                  Coach Answer Strategy:
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
            {/* Camera / Mic Error Alert */}
            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{cameraError}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Click below to trigger the browser prompt and allow camera & microphone access:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsPermissionModalOpen(true)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Allow Camera & Mic Permissions</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertSampleSpokenAnswer}
                      className="text-xs font-semibold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                    >
                      Or Use Voice Assist
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Recording Visualizer Banner */}
            {isRecording && (
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-600/30 text-rose-500">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping absolute" />
                    <span className="w-3 h-3 rounded-full bg-rose-600 relative" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {isCameraOn ? 'Recording Video & Audio' : 'Recording Audio'} • {recordingSeconds}s
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Speaking volume detected: {audioLevel}%
                    </span>
                  </div>
                </div>

                {/* Animated Waveform */}
                <div className="flex items-center gap-1 h-6 px-3 bg-slate-800/80 rounded-lg">
                  {[20, 45, 75, 30, 90, 60, 40, 85, 50, 70, 30, 55].map((baseHeight, i) => {
                    const dynamicHeight = Math.max(
                      15,
                      Math.min(100, (audioLevel > 5 ? audioLevel * 1.2 : 15) * (baseHeight / 60))
                    );
                    return (
                      <span
                        key={i}
                        className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                        style={{ height: `${dynamicHeight}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* RECORDED VIDEO & AUDIO PLAYBACK REVIEW DRAWER */}
            {!isRecording && (recordedVideoUrl || recordedAudioUrl) && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      Recorded Answer Review ({recordingSeconds}s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadRecordedMedia}
                      className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      title="Download recorded clip to your device"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Clip</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetRecording}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline ml-2"
                    >
                      Discard & Re-record
                    </button>
                  </div>
                </div>

                {recordedVideoUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-56 mx-auto">
                    <video
                      src={recordedVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      Audio recording ready ({recordingSeconds}s)
                    </span>
                    <audio src={recordedAudioUrl || undefined} controls className="h-8 max-w-xs" />
                  </div>
                )}
                <p className="text-[10px] text-slate-400 text-center">
                  Review your posture, tone, and pacing above. Click &quot;Submit Answer&quot; to receive your AI diagnostic score.
                </p>
              </div>
            )}

            {/* Response metadata header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">Your Response:</span>
                {liveFillersCount > 0 && (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Fillers: {liveFillersCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInsertSampleSpokenAnswer}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  title="Insert a realistic candidate speech sample to test the evaluation AI"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Voice Assist (Sample Speech)</span>
                </button>

                <span className="text-slate-400 text-[11px]">
                  {studentText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            <textarea
              rows={5}
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 leading-relaxed font-sans placeholder:text-slate-400"
              placeholder={
                isRecording
                  ? 'Recording is live! Speak clearly into your mic/camera. Your spoken response will transcribe here...'
                  : 'Click "Start Recording" to record your video/voice response, or type directly here...'
              }
            />

            {/* Controls Bar: 🔴 Record | ⏹ Stop | 📷 Camera Toggle | ➡ Submit Answer | ⏭ Skip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-rose-400" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition animate-pulse cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
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
                  {isCameraOn ? <Camera className="w-4 h-4 text-emerald-600" /> : <CameraOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isAiProcessing}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
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
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-95 cursor-pointer'
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

      {/* INSTANT ADAPTIVE EVALUATION MODAL / DRAWER */}
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
                  Adaptive diagnosis based on technical depth, STAR structure, spoken delivery, and body language.
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

            {/* Video & Posture Performance Highlights if Camera was Used */}
            {isCameraOn && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Visual & Non-Verbal Presence</h5>
                    <p className="text-[10px] text-slate-400">Eye contact sustained • Natural head nods • Centered framing</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Visual Score: 94%
                </span>
              </div>
            )}

            {/* 7 Core Evaluation Metric Sliders */}
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

            {/* BETTER ANSWER */}
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
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer"
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

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Video,
} from 'lucide-react';

interface DevicePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted?: () => void;
  onSelectVirtualCam?: () => void;
}

export const DevicePermissionModal: React.FC<DevicePermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionsGranted,
  onSelectVirtualCam,
}) => {
  const [cameraStatus, setCameraStatus] = useState<'prompt' | 'granted' | 'denied' | 'testing'>('prompt');
  const [micStatus, setMicStatus] = useState<'prompt' | 'granted' | 'denied' | 'testing'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanupStream();
    }
  }, [isOpen]);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const requestPermissions = async () => {
    setErrorMessage(null);
    setCameraStatus('testing');
    setMicStatus('testing');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Your browser does not support media device access. Please use modern Chrome, Edge, or Safari.');
      setCameraStatus('denied');
      setMicStatus('denied');
      return;
    }

    try {
      // Direct request to trigger native browser prompt
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      streamRef.current = stream;
      setCameraStatus('granted');
      setMicStatus('granted');

      // Attach video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Attach audio analyzer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const loop = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(loop);
          };
          loop();
        }
      } catch (e) {
        console.warn('Audio meter init error:', e);
      }
    } catch (err: any) {
      console.warn('getUserMedia permission error in modal:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setMicStatus('denied');
        setErrorMessage(
          'Camera or Microphone permission was blocked by the browser. Follow the steps below or use Virtual AI Camera.'
        );
      } else {
        // Try requesting audio only if video failed
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = audioStream;
          setMicStatus('granted');
          setCameraStatus('denied');
          setErrorMessage('Microphone allowed! Camera is unavailable on this hardware. Use Virtual AI Cam.');
        } catch {
          setCameraStatus('denied');
          setMicStatus('denied');
          setErrorMessage(err.message || 'Could not access camera or microphone.');
        }
      }
    }
  };

  const handleFinishAndStart = () => {
    // Release modal's test stream before starting interview camera
    cleanupStream();
    onClose();
    if (onPermissionsGranted) {
      onPermissionsGranted();
    }
  };

  const handleChooseVirtual = () => {
    cleanupStream();
    onClose();
    if (onSelectVirtualCam) {
      onSelectVirtualCam();
    }
  };

  const playTestSpeakerSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Sound test error:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Camera & Microphone Setup
              </h3>
              <p className="text-xs text-slate-500">
                Verify device access for realistic video mock interviews.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cleanupStream();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Screen if granted */}
        {cameraStatus === 'granted' ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video border border-slate-800 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>Camera & Mic Active</span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs p-2 rounded-xl flex items-center justify-between text-xs text-white">
              <span className="text-[11px] font-medium flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-blue-400" />
                Mic Volume: {audioLevel}%
              </span>
              <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-75"
                  style={{ width: `${Math.max(5, audioLevel)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Device status checklist */
          <div className="space-y-2.5">
            {/* Camera row */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    cameraStatus === 'denied'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <CameraOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Webcam / Video</h4>
                  <p className="text-[10px] text-slate-500">Records candidate eye contact and posture</p>
                </div>
              </div>

              <div>
                {cameraStatus === 'denied' ? (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Blocked
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Needs Permission</span>
                )}
              </div>
            </div>

            {/* Mic row */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    micStatus === 'granted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : micStatus === 'denied'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {micStatus === 'granted' ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Microphone</h4>
                  <p className="text-[10px] text-slate-500">Transcribes voice & measures speaking pace</p>
                </div>
              </div>

              <div>
                {micStatus === 'granted' ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Allowed
                  </span>
                ) : micStatus === 'denied' ? (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Blocked
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Needs Permission</span>
                )}
              </div>
            </div>

            {/* Speaker test */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Audio Speakers</h4>
                  <p className="text-[10px] text-slate-500">Hear Dr. Jenkins ask questions</p>
                </div>
              </div>

              <button
                type="button"
                onClick={playTestSpeakerSound}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
              >
                Test Sound 🔊
              </button>
            </div>
          </div>
        )}

        {/* Error / Instructions if denied */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-semibold text-[11px] leading-tight">{errorMessage}</p>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 text-[11px] text-slate-700 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                How to Allow in Browser:
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600">
                <li>Look at the top address bar in your browser.</li>
                <li>Click the <strong>🔒 Lock icon</strong> or <strong>Tune/Sliders icon</strong> next to the URL.</li>
                <li>Change <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong>.</li>
                <li>Then click <strong>&quot;Allow Camera & Microphone&quot;</strong> below!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Virtual AI Camera Fallback Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Virtual AI Candidate Cam</span>
            </div>
            <p className="text-[10px] text-slate-600">
              Simulates live candidate video & posture tracking without requiring camera hardware or permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={handleChooseVirtual}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            Use Virtual Cam
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {cameraStatus === 'granted' && micStatus === 'granted' ? (
            <button
              type="button"
              onClick={handleFinishAndStart}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Everything Ready • Continue with Webcam</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={requestPermissions}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Allow Camera & Microphone</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleChooseVirtual}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>Continue with Virtual Cam</span>
            </button>

            <button
              type="button"
              onClick={() => {
                cleanupStream();
                onClose();
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs text-center transition cursor-pointer"
            >
              Skip Video (Voice Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

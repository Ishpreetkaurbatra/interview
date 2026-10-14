import { useState, useRef, useEffect, useCallback } from 'react';

export type CameraMode = 'webcam' | 'virtual' | 'off';

export interface CameraRecorderState {
  isCameraOn: boolean;
  isCameraLoading: boolean;
  cameraMode: CameraMode;
  isVirtualCam: boolean;
  cameraError: string | null;
  videoElementRef: React.RefObject<HTMLVideoElement | null>;
  attachVideoRef: (node: HTMLVideoElement | null) => void;
  recordedVideoUrl: string | null;
  recordedAudioUrl: string | null;
  isRecording: boolean;
  recordingSeconds: number;
  audioLevel: number;
  liveFillersCount: number;
  transcript: string;
}

export function useCameraRecorder(onTranscriptUpdate?: (text: string) => void) {
  const [cameraMode, setCameraMode] = useState<CameraMode>('off');
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [liveFillersCount, setLiveFillersCount] = useState(0);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Virtual camera animation refs
  const virtualCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const virtualAnimRef = useRef<number | null>(null);
  const virtualStreamRef = useRef<MediaStream | null>(null);

  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const isCameraOn = cameraMode !== 'off';
  const isVirtualCam = cameraMode === 'virtual';

  // Attach stream to video element whenever element mounts or stream changes
  const attachVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoElementRef.current = node;
    if (node && streamRef.current) {
      if (node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
      }
      node.play().catch((err) => {
        console.warn('Video playback catch on attach:', err);
      });
    }
  }, []);

  // Reactive effect to bind stream to video element
  useEffect(() => {
    if (videoElementRef.current && streamRef.current) {
      if (videoElementRef.current.srcObject !== streamRef.current) {
        videoElementRef.current.srcObject = streamRef.current;
      }
      videoElementRef.current.play().catch((err) => {
        console.warn('Video play effect catch:', err);
      });
    }
  }, [cameraMode]);

  // Timer counter
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (virtualAnimRef.current) cancelAnimationFrame(virtualAnimRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const countFillerWords = (text: string) => {
    const fillerList = ['um', 'uh', 'like', 'actually', 'basically', 'sort of', 'you know', 'literally', 'right'];
    const lower = text.toLowerCase();
    let count = 0;
    fillerList.forEach((w) => {
      const matches = lower.match(new RegExp(`\\b${w}\\b`, 'gi'));
      if (matches) count += matches.length;
    });
    setLiveFillersCount(count);
  };

  // Set up Web Audio Analyser
  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.warn('Audio visualization setup error:', e);
    }
  };

  // Start Virtual Camera (AI Generated Simulation Feed)
  const startVirtualCamera = useCallback(async () => {
    setIsCameraLoading(true);
    setCameraError(null);

    try {
      // Create offscreen canvas for rendering animated video stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      virtualCanvasRef.current = canvas;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not supported');
      }

      // Try acquiring microphone stream for real audio pairing with virtual camera
      let micStream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          setupAudioVisualizer(micStream);
        }
      } catch (micErr) {
        console.warn('Microphone not acquired for virtual camera:', micErr);
      }

      let frameCount = 0;
      const renderSimulation = () => {
        frameCount++;
        const width = canvas.width;
        const height = canvas.height;

        // Background: Modern studio interview room with soft lighting
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e293b');
        bgGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Ambient lighting glow behind candidate
        const glow = ctx.createRadialGradient(width / 2, height / 2 - 20, 10, width / 2, height / 2 - 20, 240);
        glow.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
        glow.addColorStop(0.6, 'rgba(30, 58, 138, 0.1)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 20, 240, 0, Math.PI * 2);
        ctx.fill();

        // Subtle breathing / posture sway
        const swayY = Math.sin(frameCount * 0.03) * 2;
        const swayX = Math.cos(frameCount * 0.02) * 1;
        const centerX = width / 2 + swayX;
        const centerY = height / 2 + 10 + swayY;

        // Candidate Torso / Business Suit
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(centerX - 130, height);
        ctx.quadraticCurveTo(centerX - 120, centerY + 80, centerX - 55, centerY + 65);
        ctx.lineTo(centerX + 55, centerY + 65);
        ctx.quadraticCurveTo(centerX + 120, centerY + 80, centerX + 130, height);
        ctx.closePath();
        ctx.fill();

        // Collar & Tie / Blouse
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY + 65);
        ctx.lineTo(centerX, centerY + 115);
        ctx.lineTo(centerX + 30, centerY + 65);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY + 78);
        ctx.lineTo(centerX + 10, centerY + 78);
        ctx.lineTo(centerX + 14, centerY + 160);
        ctx.lineTo(centerX, centerY + 185);
        ctx.lineTo(centerX - 14, centerY + 160);
        ctx.closePath();
        ctx.fill();

        // Candidate Neck
        ctx.fillStyle = '#e2b397';
        ctx.fillRect(centerX - 24, centerY + 25, 48, 45);

        // Candidate Head
        ctx.fillStyle = '#e2b397';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 20, 68, 80, 0, 0, Math.PI * 2);
        ctx.fill();

        // Professional Hair
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 65, 74, 50, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX - 55, centerY - 25, 18, 45, -0.2, 0, Math.PI * 2);
        ctx.ellipse(centerX + 55, centerY - 25, 18, 45, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(centerX - 42, centerY - 38);
        ctx.quadraticCurveTo(centerX - 24, centerY - 45, centerX - 12, centerY - 38);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + 12, centerY - 38);
        ctx.quadraticCurveTo(centerX + 24, centerY - 45, centerX + 42, centerY - 38);
        ctx.stroke();

        // Eyes: Blink simulation every ~120 frames
        const isBlinking = frameCount % 120 >= 114;
        if (isBlinking) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(centerX - 36, centerY - 22);
          ctx.lineTo(centerX - 18, centerY - 22);
          ctx.moveTo(centerX + 18, centerY - 22);
          ctx.lineTo(centerX + 36, centerY - 22);
          ctx.stroke();
        } else {
          // Eye whites
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(centerX - 27, centerY - 22, 12, 7, 0, 0, Math.PI * 2);
          ctx.ellipse(centerX + 27, centerY - 22, 12, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          // Irises with micro eye contact tracking
          const eyeShiftX = Math.sin(frameCount * 0.04) * 1.5;
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          ctx.arc(centerX - 27 + eyeShiftX, centerY - 22, 4.5, 0, Math.PI * 2);
          ctx.arc(centerX + 27 + eyeShiftX, centerY - 22, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Pupils
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(centerX - 27 + eyeShiftX, centerY - 22, 2.2, 0, Math.PI * 2);
          ctx.arc(centerX + 27 + eyeShiftX, centerY - 22, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Nose
        ctx.strokeStyle = '#c98a68';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 15);
        ctx.lineTo(centerX + 3, centerY + 3);
        ctx.lineTo(centerX - 4, centerY + 8);
        ctx.stroke();

        // Mouth: Dynamic opening based on microphone level or natural speaking
        const isMouthOpen = audioLevel > 8 || (frameCount % 60 < 25 && isRecording);
        const mouthHeight = isMouthOpen ? Math.min(14, 4 + audioLevel * 0.25) : 3;

        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 25, 14, mouthHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Live HUD Overlay
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.roundRect(14, 14, 210, 32, 8);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(28, 30, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('AI Candidate Cam (Simulation)', 40, 34);

        virtualAnimRef.current = requestAnimationFrame(renderSimulation);
      };

      renderSimulation();

      // Capture stream from canvas
      const canvasStream = (canvas as any).captureStream ? canvas.captureStream(30) : null;
      if (!canvasStream) {
        throw new Error('Canvas captureStream not supported');
      }

      // Merge audio tracks from mic if available
      if (micStream) {
        micStream.getAudioTracks().forEach((track) => {
          canvasStream.addTrack(track);
        });
      }

      streamRef.current = canvasStream;
      virtualStreamRef.current = canvasStream;
      setCameraMode('virtual');

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = canvasStream;
        videoElementRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error('Virtual camera setup failed:', err);
      setCameraError('Could not start virtual camera: ' + (err.message || 'Unknown error'));
      setCameraMode('off');
    } finally {
      setIsCameraLoading(false);
    }
  }, [audioLevel, isRecording]);

  // Start Physical Camera Stream with multi-stage fallbacks
  const startPhysicalCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser. Switched to Virtual AI Camera.');
      await startVirtualCamera();
      return;
    }

    setIsCameraLoading(true);
    setCameraError(null);

    // Stop virtual animation if active
    if (virtualAnimRef.current) {
      cancelAnimationFrame(virtualAnimRef.current);
      virtualAnimRef.current = null;
    }

    let stream: MediaStream | null = null;

    // Stage 1: Try optimal video and audio together
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (stage1Err: any) {
      console.warn('Stage 1 getUserMedia failed, attempting Stage 2:', stage1Err);

      // Stage 2: Try basic video and audio
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (stage2Err: any) {
        console.warn('Stage 2 getUserMedia failed, attempting Stage 3 (video-only):', stage2Err);

        // Stage 3: Try video ONLY (microphone might be denied or on another device)
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Attempt audio separately
          try {
            const micOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
            micOnly.getAudioTracks().forEach((t) => stream!.addTrack(t));
          } catch {
            // Audio denied, but video works!
          }
        } catch (stage3Err: any) {
          console.warn('Physical camera unavailable:', stage3Err);
          // Fall back gracefully to Virtual Camera simulation so user is never blocked!
          setCameraError(
            stage3Err.name === 'NotAllowedError' || stage3Err.name === 'PermissionDeniedError'
              ? 'Webcam permission was blocked by your browser. We enabled Virtual AI Candidate Cam so you can still practice.'
              : 'Webcam not found or busy. We enabled Virtual AI Candidate Cam so you can still practice.'
          );
          setIsCameraLoading(false);
          await startVirtualCamera();
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      setCameraMode('webcam');

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play().catch((e) => console.warn('Video play error:', e));
      }

      setupAudioVisualizer(stream);
    }
    setIsCameraLoading(false);
  }, [startVirtualCamera]);

  // General startCamera method
  const startCamera = useCallback(
    async (forceVirtual?: boolean) => {
      if (forceVirtual) {
        await startVirtualCamera();
      } else {
        await startPhysicalCamera();
      }
    },
    [startPhysicalCamera, startVirtualCamera]
  );

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (virtualAnimRef.current) {
      cancelAnimationFrame(virtualAnimRef.current);
      virtualAnimRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    setCameraMode('off');
  }, []);

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      await startPhysicalCamera();
    }
  }, [isCameraOn, startPhysicalCamera, stopCamera]);

  const switchToVirtualCamera = useCallback(async () => {
    stopCamera();
    await startVirtualCamera();
  }, [startVirtualCamera, stopCamera]);

  const switchToPhysicalCamera = useCallback(async () => {
    stopCamera();
    await startPhysicalCamera();
  }, [startPhysicalCamera, stopCamera]);

  // Start Recording
  const startRecording = useCallback(async () => {
    setCameraError(null);
    setRecordedVideoUrl(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
    recordedChunksRef.current = [];

    // Ensure we have a stream
    let stream = streamRef.current;
    if (!stream || stream.getTracks().every((t) => t.readyState === 'ended')) {
      if (isVirtualCam) {
        await startVirtualCamera();
        stream = streamRef.current;
      } else if (isCameraOn) {
        await startPhysicalCamera();
        stream = streamRef.current;
      } else {
        // Try audio-only if camera is off
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: true, noiseSuppression: true },
            });
            streamRef.current = stream;
            setupAudioVisualizer(stream);
          }
        } catch (micErr: any) {
          setCameraError('Microphone permission is required to record audio.');
        }
      }
    }

    // Set up MediaRecorder if stream exists
    if (stream && typeof MediaRecorder !== 'undefined') {
      try {
        let mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8,opus';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
        }

        const isVideoAvailable = stream.getVideoTracks().length > 0;
        const recorder = new MediaRecorder(stream, isVideoAvailable ? { mimeType } : undefined);

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const hasVideo = stream.getVideoTracks().length > 0;
            const blobType = hasVideo ? 'video/webm' : 'audio/webm';
            const blob = new Blob(recordedChunksRef.current, { type: blobType });
            const url = URL.createObjectURL(blob);
            if (hasVideo) {
              setRecordedVideoUrl(url);
            } else {
              setRecordedAudioUrl(url);
            }
          }
        };

        recorder.start(250);
        mediaRecorderRef.current = recorder;
      } catch (recErr) {
        console.warn('MediaRecorder init error:', recErr);
      }
    }

    // Set up SpeechRecognition for real-time transcription
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let accumulated = '';
        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              accumulated += (accumulated ? ' ' : '') + event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const full = (accumulated + ' ' + interim).trim();
          setTranscript(full);
          countFillerWords(full);
          if (onTranscriptUpdate && full) {
            onTranscriptUpdate(full);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
        };

        recognition.onend = () => {
          // If still recording, restart
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try {
              recognition.start();
            } catch {
              // ignore
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (recErr) {
        console.warn('SpeechRecognition start failed:', recErr);
      }
    }

    setIsRecording(true);
  }, [isCameraOn, isVirtualCam, onTranscriptUpdate, startPhysicalCamera, startVirtualCamera]);

  // Stop Recording
  const stopRecording = useCallback(() => {
    setIsRecording(false);

    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('MediaRecorder stop error:', err);
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch {
        // ignore
      }
    }
  }, []);

  // Reset Recording
  const resetRecording = useCallback(() => {
    stopRecording();
    setRecordedVideoUrl(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
    setTranscript('');
    setLiveFillersCount(0);
    recordedChunksRef.current = [];
  }, [stopRecording]);

  // Download Recorded Media
  const downloadRecordedMedia = useCallback(() => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `interview-video-${new Date().toISOString().slice(0, 10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (recordedAudioUrl) {
      const a = document.createElement('a');
      a.href = recordedAudioUrl;
      a.download = `interview-audio-${new Date().toISOString().slice(0, 10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [recordedAudioUrl, recordedVideoUrl]);

  const clearCameraError = useCallback(() => {
    setCameraError(null);
  }, []);

  const setTranscriptText = useCallback(
    (text: string) => {
      setTranscript(text);
      countFillerWords(text);
      if (onTranscriptUpdate) {
        onTranscriptUpdate(text);
      }
    },
    [onTranscriptUpdate]
  );

  return {
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
    audioLevel,
    transcript,
    setTranscriptText,
    liveFillersCount,
    recordedVideoUrl,
    recordedAudioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    downloadRecordedMedia,
  };
}

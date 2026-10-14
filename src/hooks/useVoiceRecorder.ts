import { useState, useRef, useEffect, useCallback } from 'react';

export interface VoiceRecorderState {
  isRecording: boolean;
  recordingSeconds: number;
  transcript: string;
  audioLevel: number;
  recordedAudioUrl: string | null;
  error: string | null;
  isSpeechRecognitionSupported: boolean;
  isMediaRecorderSupported: boolean;
  liveFillersCount: number;
}

export function useVoiceRecorder(onTranscriptUpdate?: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [liveFillersCount, setLiveFillersCount] = useState(0);

  const isSpeechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const isMediaRecorderSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    !!window.MediaRecorder;

  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

  const startRecording = useCallback(async () => {
    setError(null);
    setRecordedAudioUrl(null);
    setAudioLevel(0);
    audioChunksRef.current = [];

    let hasMediaStream = false;

    // 1. Try to get real audio input from user's microphone
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
        hasMediaStream = true;

        // Set up MediaRecorder
        if (typeof MediaRecorder !== 'undefined') {
          try {
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                audioChunksRef.current.push(event.data);
              }
            };
            recorder.onstop = () => {
              if (audioChunksRef.current.length > 0) {
                const audioBlob = new Blob(audioChunksRef.current, {
                  type: recorder.mimeType || 'audio/webm',
                });
                const url = URL.createObjectURL(audioBlob);
                setRecordedAudioUrl(url);
              }
            };
            recorder.start(250);
            mediaRecorderRef.current = recorder;
          } catch (recErr) {
            console.warn('MediaRecorder init error:', recErr);
          }
        }

        // Set up Web Audio Analyser for live visualizer wave
        try {
          const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
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
              // Map average 0-255 to 0-100
              const normalized = Math.min(100, Math.round((average / 128) * 100));
              setAudioLevel(normalized);
              animationFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
          }
        } catch (audioErr) {
          console.warn('AudioContext visualization error:', audioErr);
        }
      } catch (micErr: any) {
        console.warn('Microphone permission or hardware access issue:', micErr);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setError(
            'Microphone access was blocked by your browser. Please allow microphone permissions in the browser address bar, or use the "Voice Assist / Sample Answer" button.'
          );
        } else if (micErr.name === 'NotFoundError' || micErr.name === 'DevicesNotFoundError') {
          setError(
            'No microphone device found on your system. You can type your answer or use the Voice Assist button.'
          );
        } else {
          setError(`Microphone note: ${micErr.message || 'Could not connect audio stream'}`);
        }
      }
    }

    // 2. Set up SpeechRecognition if available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          const cleaned = currentTranscript.trim();
          setTranscript(cleaned);
          countFillerWords(cleaned);
          if (onTranscriptUpdate) {
            onTranscriptUpdate(cleaned);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition status:', event.error);
          if (event.error === 'not-allowed') {
            setError(
              'Speech recognition permission blocked. Please enable microphone permissions in your browser URL bar.'
            );
          } else if (event.error === 'network') {
            setError(
              'Live speech-to-text service is temporarily unreachable from your network. Your audio is still being recorded via microphone.'
            );
          }
        };

        recognition.onend = () => {
          // If still recording, attempt gentle restart if recognition ended prematurely
          // but don't loop endlessly
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (recogErr) {
        console.warn('SpeechRecognition start error:', recogErr);
      }
    } else {
      if (!hasMediaStream) {
        setError(
          'Your browser does not support Web Speech Recognition. You can still type your answers or use the simulated speech response tool.'
        );
      }
    }

    setIsRecording(true);
  }, [onTranscriptUpdate]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }

    // Stop Microphone Stream Tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Cancel Animation Frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);

    // Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    stopRecording();
    setTranscript('');
    setRecordingSeconds(0);
    setAudioLevel(0);
    setError(null);
    setLiveFillersCount(0);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
  }, [stopRecording, recordedAudioUrl]);

  // Audio Playback for recorded candidate response
  const togglePlayRecordedAudio = useCallback(() => {
    if (!recordedAudioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(recordedAudioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
      audioPlayerRef.current.onerror = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => {
          console.warn('Audio playback error:', e);
          setIsPlayingAudio(false);
        });
    }
  }, [recordedAudioUrl, isPlayingAudio]);

  return {
    isRecording,
    recordingSeconds,
    transcript,
    setTranscript,
    audioLevel,
    recordedAudioUrl,
    error,
    clearError: () => setError(null),
    startRecording,
    stopRecording,
    resetRecording,
    togglePlayRecordedAudio,
    isPlayingAudio,
    liveFillersCount,
    isSpeechSupported,
    isMediaRecorderSupported,
  };
}

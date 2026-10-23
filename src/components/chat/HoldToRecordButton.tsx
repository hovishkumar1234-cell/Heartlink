import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Trash2, Send, Lock, Unlock, Square, AlertCircle } from 'lucide-react';
import { VoiceRecorderManager, VoiceRecordingResult } from '../../utils/voiceRecorder';
import { triggerHaptic } from '../../utils/haptics';
import { playRecordingSound } from '../../utils/audio';

interface HoldToRecordButtonProps {
  onSendVoice: (audioUrl: string, duration: number, waveform: number[]) => void;
  disabled?: boolean;
}

export const HoldToRecordButton: React.FC<HoldToRecordButtonProps> = ({
  onSendVoice,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0.2);
  const [showHoldHint, setShowHoldHint] = useState(false);
  const [isSlideCancelling, setIsSlideCancelling] = useState(false);

  const recorderRef = useRef<VoiceRecorderManager | null>(null);
  const timerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const isLockedRef = useRef<boolean>(false);

  // Keep ref in sync with state for event listeners
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Live audio visualization animation loop
  const updateAudioLevels = useCallback(() => {
    if (recorderRef.current && isHoldingRef.current) {
      const level = recorderRef.current.getCurrentAmplitude();
      setAudioLevel(level);
      animFrameRef.current = requestAnimationFrame(updateAudioLevels);
    }
  }, []);

  const startRecording = async () => {
    if (disabled || isHoldingRef.current) return;

    triggerHaptic('medium');
    playRecordingSound('start');

    const recorder = new VoiceRecorderManager();
    recorderRef.current = recorder;
    isHoldingRef.current = true;
    startTimestampRef.current = Date.now();
    setElapsedSeconds(0);
    setIsSlideCancelling(false);
    setIsLocked(false);
    setIsRecording(true);

    try {
      await recorder.start();
    } catch (err) {
      console.warn('Failed to start recording:', err);
    }

    // Timer updates every 100ms
    timerRef.current = window.setInterval(() => {
      const duration = (Date.now() - startTimestampRef.current) / 1000;
      setElapsedSeconds(Math.floor(duration));

      // Maximum voice note limit of 60 seconds
      if (duration >= 60) {
        stopAndSend();
      }
    }, 100);

    animFrameRef.current = requestAnimationFrame(updateAudioLevels);
  };

  const stopAndSend = async () => {
    if (!recorderRef.current || !isHoldingRef.current) return;

    const duration = (Date.now() - startTimestampRef.current) / 1000;
    isHoldingRef.current = false;
    setIsRecording(false);
    setIsLocked(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Protection against accidental taps: must hold for at least 0.8 seconds
    if (duration < 0.8) {
      recorderRef.current.cancel();
      setShowHoldHint(true);
      setTimeout(() => setShowHoldHint(false), 2400);
      return;
    }

    try {
      triggerHaptic('success');
      playRecordingSound('send');
      const result: VoiceRecordingResult = await recorderRef.current.stop();
      if (result.audioUrl) {
        onSendVoice(result.audioUrl, result.duration, result.waveform);
      }
    } catch (err) {
      console.error('Error stopping voice recorder:', err);
    } finally {
      recorderRef.current = null;
    }
  };

  const cancelRecording = () => {
    if (!recorderRef.current || !isHoldingRef.current) return;

    isHoldingRef.current = false;
    setIsRecording(false);
    setIsLocked(false);
    setIsSlideCancelling(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    triggerHaptic('warning');
    playRecordingSound('cancel');
    recorderRef.current.cancel();
    recorderRef.current = null;
  };

  // Lock recording hands-free
  const toggleLock = () => {
    triggerHaptic('light');
    setIsLocked((prev) => !prev);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    if (isLocked) return;
    startRecording();
  };

  const handleMouseUp = () => {
    if (isLocked) return;
    if (isHoldingRef.current) {
      stopAndSend();
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLocked) return;
    touchStartXRef.current = e.touches[0].clientX;
    startRecording();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isHoldingRef.current || isLocked) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartXRef.current - currentX;
    // Slide left > 80px triggers cancel intent
    if (diff > 80) {
      setIsSlideCancelling(true);
    } else {
      setIsSlideCancelling(false);
    }
  };

  const handleTouchEnd = () => {
    if (isLocked) return;
    if (isSlideCancelling) {
      cancelRecording();
    } else if (isHoldingRef.current) {
      stopAndSend();
    }
  };

  // Global mouseup safety to handle release outside the button
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isHoldingRef.current && !isLockedRef.current) {
        stopAndSend();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Number of visualizer wave bars
  const visualizerBars = 14;

  return (
    <div className="relative flex items-center">
      {/* Quick Tooltip Hint if tapped without holding */}
      {showHoldHint && (
        <div className="absolute bottom-full mb-3 right-0 z-50 bg-white text-[#6C5CE7] border border-[#6C5CE7]/30 px-3 py-1.5 rounded-xl shadow-[0_8px_25px_rgba(108,92,231,0.15)] text-xs font-bold whitespace-nowrap flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Press & hold to record</span>
        </div>
      )}

      {/* ACTIVE RECORDING OVERLAY (When user is holding or locked) */}
      {isRecording && (
        <div className="fixed inset-x-0 bottom-0 sm:absolute sm:inset-0 sm:bottom-0 z-40 bg-white/98 backdrop-blur-xl sm:rounded-2xl border-t sm:border border-[#6C5CE7]/30 p-2 sm:p-2.5 flex items-center justify-between shadow-[0_8px_30px_rgba(108,92,231,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Left: Pulsing REC status + Timer */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </span>
            <span className="text-[11px] font-bold text-red-500 tracking-wider">REC</span>
            <span className="font-mono text-xs font-bold text-[#2D3436] tabular-nums">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          {/* Center: Live Audio Waveform Activity */}
          <div className="flex items-center gap-[3px] px-2 sm:px-4 h-7 flex-1 justify-center max-w-[200px]">
            {Array.from({ length: visualizerBars }).map((_, i) => {
              const distance = Math.abs(i - visualizerBars / 2) / (visualizerBars / 2);
              const dynamicHeight = Math.max(
                4,
                Math.round((0.2 + audioLevel * (1 - distance * 0.5) * (0.8 + Math.sin(i * 1.5) * 0.3)) * 24)
              );
              return (
                <div
                  key={i}
                  style={{ height: `${dynamicHeight}px` }}
                  className="w-1 bg-[#6C5CE7] rounded-full transition-all duration-75"
                />
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Slide to Cancel hint (on hold) */}
            {!isLocked && (
              <span className={`text-[10px] hidden sm:inline font-semibold transition-colors ${
                isSlideCancelling ? 'text-red-500 font-bold' : 'text-[#636E72]'
              }`}>
                {isSlideCancelling ? 'Release to cancel' : 'Release to send'}
              </span>
            )}

            {/* Lock / Unlock Toggle button */}
            <button
              type="button"
              onClick={toggleLock}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isLocked
                  ? 'bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/40 font-bold'
                  : 'bg-[#F1F2F6] hover:bg-[#E2E8F0] text-[#636E72]'
              }`}
              title={isLocked ? 'Tap to unlock' : 'Lock hands-free'}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>

            {/* Cancel / Discard button */}
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 transition-all cursor-pointer active:scale-95"
              title="Discard recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Send button (Primary when locked or to finish) */}
            {isLocked && (
              <button
                type="button"
                onClick={stopAndSend}
                className="px-3 py-1.5 rounded-xl bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_16px_rgba(108,92,231,0.3)] active:scale-95 transition-all cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* HOLD TO RECORD TRIGGER BUTTON */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer select-none group touch-none active:scale-95 ${
          isRecording
            ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] ring-2 ring-red-400'
            : 'bg-white hover:bg-[#F8F9FA] border border-[#E9ECEF] hover:border-[#6C5CE7]/50 text-[#6C5CE7] hover:text-[#4834D4] shadow-xs'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        title="Hold to Record voice note (Tap & hold)"
        aria-label="Hold to record voice note"
      >
        {isRecording ? (
          <Square className="w-4 h-4 fill-current animate-pulse" />
        ) : (
          <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
};

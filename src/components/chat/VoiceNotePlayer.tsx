import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  duration?: number; // In seconds
  waveform?: number[];
  isMe?: boolean;
}

const SPEED_OPTIONS = [1, 1.5, 2];

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  duration = 0,
  waveform,
  isMe = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeedIndex, setPlaybackSpeedIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate 28 bar heights if waveform not provided
  const bars = waveform && waveform.length > 0
    ? waveform
    : [
        0.25, 0.45, 0.7, 0.5, 0.35, 0.65, 0.85, 0.95, 0.6, 0.4, 0.75, 0.9, 0.8,
        0.65, 0.45, 0.35, 0.55, 0.8, 0.7, 0.6, 0.85, 0.95, 0.7, 0.5, 0.4, 0.6,
        0.35, 0.25,
      ];

  const currentSpeed = SPEED_OPTIONS[playbackSpeedIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  const fallbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
      }
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!audioUrl) {
      if (isPlaying) {
        if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        const effectiveDuration = duration > 0 ? duration : 6;
        if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = window.setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 0.1 * currentSpeed;
            if (next >= effectiveDuration) {
              if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
              setIsPlaying(false);
              return 0;
            }
            return next;
          });
        }, 100);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.playbackRate = currentSpeed;
      audio.play().catch((err) => {
        console.warn('Audio playback was prevented by browser:', err);
      });
    }
  };

  const handleBarClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();

    const effectiveDuration = duration > 0 ? duration : (audioRef.current?.duration || 6);
    const targetTime = (index / bars.length) * effectiveDuration;

    if (!audioUrl) {
      setCurrentTime(targetTime);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (playbackSpeedIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackSpeedIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEED_OPTIONS[nextIndex];
    }
  };

  const effectiveDuration = duration > 0 ? duration : (audioRef.current?.duration || 0);
  const progressRatio = effectiveDuration > 0 ? Math.min(1, currentTime / effectiveDuration) : 0;
  const activeBarIndex = Math.floor(progressRatio * bars.length);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  return (
    <div
      className={`flex flex-col gap-2 p-3.5 rounded-2xl select-none transition-all ${
        isMe
          ? 'bg-[#6C5CE7] text-white font-medium shadow-[0_4px_16px_rgba(108,92,231,0.25)] rounded-br-xs'
          : 'bg-white text-[#2D3436] border border-[#E9ECEF] shadow-[0_4px_16px_rgba(108,92,231,0.06)] rounded-bl-xs'
      }`}
      style={{ minWidth: '240px', maxWidth: '320px' }}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Header bar: mic badge + duration / status */}
      <div className={`flex items-center justify-between text-[10px] ${isMe ? 'text-white/90' : 'text-[#636E72]'}`}>
        <span className="inline-flex items-center gap-1 font-bold tracking-wide uppercase">
          <Mic className="w-3 h-3" />
          <span>Voice Note</span>
        </span>
        <span className="font-mono tabular-nums font-bold">
          {isPlaying ? formatTime(currentTime) : formatTime(effectiveDuration)}
        </span>
      </div>

      {/* Main control row: Play button + Waveform bars */}
      <div className="flex items-center gap-2.5">
        {/* Play / Pause round button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-sm ${
            isMe
              ? 'bg-white text-[#6C5CE7] hover:bg-white/90'
              : 'bg-[#6C5CE7] text-white hover:bg-[#4834D4]'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Interactive Scrubbable Waveform Bars */}
        <div
          className="flex-1 flex items-center gap-[2.5px] h-9 cursor-pointer py-1"
          title="Click to seek"
        >
          {bars.map((heightRatio, idx) => {
            const hasPlayed = idx <= activeBarIndex && (isPlaying || currentTime > 0);
            const heightPx = Math.max(5, Math.round(heightRatio * 26));

            return (
              <div
                key={idx}
                onClick={(e) => handleBarClick(e, idx)}
                style={{ height: `${heightPx}px` }}
                className={`flex-1 min-w-[2.5px] max-w-[4px] rounded-full transition-colors ${
                  isMe
                    ? hasPlayed
                      ? 'bg-white opacity-95'
                      : 'bg-white/35 hover:bg-white/50'
                    : hasPlayed
                    ? 'bg-[#6C5CE7]'
                    : 'bg-[#CBD5E1] hover:bg-[#94A3B8]'
                }`}
              />
            );
          })}
        </div>

        {/* Speed toggle pill (1x, 1.5x, 2x) */}
        <button
          type="button"
          onClick={cycleSpeed}
          title="Toggle playback speed"
          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums transition-colors cursor-pointer shrink-0 ${
            isMe
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-[#F1F2F6] hover:bg-[#E2E8F0] text-[#6C5CE7]'
          }`}
        >
          {currentSpeed}x
        </button>
      </div>

      {/* Progress timeline bar */}
      <div className={`w-full h-1 rounded-full overflow-hidden ${isMe ? 'bg-white/20' : 'bg-[#E9ECEF]'}`}>
        <div
          className={`h-full transition-all duration-100 ${
            isMe ? 'bg-white' : 'bg-[#6C5CE7]'
          }`}
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>
    </div>
  );
};

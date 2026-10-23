import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SelfDestructSnap } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { Flame, Clock, RotateCcw, X, ShieldAlert, Sparkles } from 'lucide-react';

interface DisappearingSnapModalProps {
  snap: SelfDestructSnap | null;
  onClose: () => void;
}

export const DisappearingSnapModal: React.FC<DisappearingSnapModalProps> = ({
  snap,
  onClose,
}) => {
  const { markSnapViewed } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    snap ? snap.viewDurationSeconds : 5
  );
  const [hasVanished, setHasVanished] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!snap) return;

    if (snap.hasExpired && !isReplaying) {
      setHasVanished(true);
      return;
    }

    setSecondsRemaining(snap.viewDurationSeconds);
    setHasVanished(false);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHasVanished(true);
          triggerHaptic('warning');
          markSnapViewed(snap.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [snap?.id, isReplaying]);

  if (!snap) return null;

  const totalTime = snap.viewDurationSeconds || 5;
  const progressPercent = (secondsRemaining / totalTime) * 100;

  const handleReplay = () => {
    if (!snap.canReplay) return;
    triggerHaptic('light');
    setIsReplaying(true);
    setHasVanished(false);
    setSecondsRemaining(snap.viewDurationSeconds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#18181B] border border-white/10 overflow-hidden shadow-2xl flex flex-col aspect-[9/16] max-h-[85vh]">
        {/* Top Progress & Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex flex-col gap-2">
          {/* Progress Timer Bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FD79A8] via-[#6C5CE7] to-[#00B894] transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-1 text-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FD79A8] animate-pulse" />
              <div>
                <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{snap.senderName}</span>
                  <span className="text-[10px] text-white/60 font-normal">Disappearing Snap</span>
                </p>
                <p className="text-[10px] text-white/50 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{secondsRemaining}s left</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Snap"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Surface */}
        {!hasVanished ? (
          <div className="relative flex-1 w-full h-full bg-black overflow-hidden flex items-center justify-center">
            {/* Snap Media (Photo or Scene) */}
            <img
              src={snap.mediaUrl}
              alt="Disappearing Media"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Doodles Overlay via SVG */}
            {snap.doodles && snap.doodles.length > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {snap.doodles.map((doodle, idx) => {
                  if (!doodle.points || doodle.points.length < 2) return null;
                  const pathData = doodle.points.reduce(
                    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
                    ''
                  );
                  return (
                    <path
                      key={idx}
                      d={pathData}
                      stroke={doodle.color}
                      strokeWidth={doodle.strokeWidth || 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  );
                })}
              </svg>
            )}

            {/* Sticker Emoji Overlay */}
            {snap.stickerEmoji && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-6xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-bounce pointer-events-none select-none">
                {snap.stickerEmoji}
              </div>
            )}

            {/* Bottom Caption Pill */}
            {snap.caption && (
              <div className="absolute bottom-6 inset-x-4 z-20">
                <div className="bg-black/60 backdrop-blur-md border border-white/15 text-white p-3.5 rounded-2xl text-center shadow-lg">
                  <p className="text-xs font-semibold leading-relaxed">{snap.caption}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Vanished Screen */
          <div className="relative flex-1 w-full h-full bg-[#18181B] flex flex-col items-center justify-center p-6 text-center text-white animate-in zoom-in-95 duration-300">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#FD79A8]/20 to-[#6C5CE7]/20 border border-[#FD79A8]/30 flex items-center justify-center mb-4 text-[#FD79A8]">
              <Flame className="w-10 h-10 animate-pulse text-[#FD79A8]" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-amber-300 animate-spin" />
            </div>

            <h3 className="text-lg font-black tracking-tight text-white mb-1.5">
              Snap Vanished! 🔥
            </h3>
            <p className="text-xs text-white/60 max-w-xs leading-relaxed mb-6">
              This photo self-destructed and was deleted from the chat to keep interactions spontaneous and pressure-free.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              {snap.canReplay && !isReplaying && (
                <button
                  onClick={handleReplay}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#FD79A8]" />
                  <span>Replay Once (Last Chance)</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

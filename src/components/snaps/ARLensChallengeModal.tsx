import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AR_THIS_OR_THAT_QUESTIONS } from '../../data/snapData';
import { triggerHaptic } from '../../utils/haptics';
import {
  Sparkles,
  X,
  RotateCcw,
  Check,
  ChevronRight,
  MessageCircle,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

interface ARLensChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ARLensChallengeModal: React.FC<ARLensChallengeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    arLensChallenge,
    makeARLensChoice,
    closeARLensChallenge,
    setActiveScreen,
    setActiveChatMatchId,
    matches,
  } = useApp();

  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [isRevealingPartner, setIsRevealingPartner] = useState(false);

  if (!isOpen || !arLensChallenge) return null;

  const currentQuestion = AR_THIS_OR_THAT_QUESTIONS[arLensChallenge.currentRound] || AR_THIS_OR_THAT_QUESTIONS[0];
  const isCompleted = arLensChallenge.status === 'completed';

  const handleSelectChoice = (choice: 'left' | 'right') => {
    if (isRevealingPartner || isCompleted) return;

    triggerHaptic('light');
    setTiltAngle(choice === 'left' ? -12 : 12);
    setIsRevealingPartner(true);

    setTimeout(() => {
      makeARLensChoice(choice);
      setIsRevealingPartner(false);
      setTiltAngle(0);
    }, 600);
  };

  const handleChatWithPartner = () => {
    const match = matches.find(
      (m) =>
        (m.userId1 === currentUser?.id && m.userId2 === arLensChallenge.partnerId) ||
        (m.userId2 === currentUser?.id && m.userId1 === arLensChallenge.partnerId)
    );
    closeARLensChallenge();
    onClose();
    if (match) {
      setActiveChatMatchId(match.id);
      setActiveScreen('chat');
    } else {
      setActiveScreen('matches');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#18181B] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3 bg-black/50 border-b border-white/10 flex items-center justify-between text-white z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>AR Lens Challenge</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#6C5CE7]/30 text-[#A29BFE] text-[9px] font-bold">
                  Round {arLensChallenge.currentRound + 1}/{arLensChallenge.totalRounds}
                </span>
              </h3>
              <p className="text-[10px] text-white/60">
                Playing with <span className="text-white font-bold">{arLensChallenge.partnerName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              closeARLensChallenge();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Chemistry Score Meter */}
        <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between gap-3 text-white text-[11px] z-20">
          <div className="flex items-center gap-1.5 font-bold">
            <Zap className="w-3 h-3 text-[#FD79A8]" />
            <span>Chemistry Match:</span>
            <span className="text-[#00B894] tabular-nums font-black">{arLensChallenge.matchScore}%</span>
          </div>
          <div className="flex-1 max-w-[120px] h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FD79A8] via-[#6C5CE7] to-[#00B894] transition-all duration-500 rounded-full"
              style={{ width: `${arLensChallenge.matchScore}%` }}
            />
          </div>
        </div>

        {/* Main AR Camera Viewport */}
        {!isCompleted ? (
          <div className="relative flex-1 w-full aspect-[9/13] bg-gradient-to-b from-zinc-950 via-zinc-900 to-black overflow-hidden flex flex-col items-center justify-between p-4">
            {/* AR Facial Recognition Grid Lines Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50%" cy="45%" r="120" stroke="#6C5CE7" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                <circle cx="50%" cy="45%" r="140" stroke="#FD79A8" strokeWidth="1" fill="none" strokeDasharray="8 6" />
                <line x1="10%" y1="45%" x2="90%" y2="45%" stroke="#00B894" strokeWidth="0.5" />
                <line x1="50%" y1="10%" x2="50%" y2="85%" stroke="#00B894" strokeWidth="0.5" />
              </svg>
            </div>

            {/* Floating AR Choice Cards Above Face */}
            <div className="relative z-20 w-full flex flex-col items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold uppercase tracking-wider text-center">
                {currentQuestion.topic}
              </div>

              {/* Dual Floating Options (Left vs Right) */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
                {/* Left Choice Card */}
                <button
                  type="button"
                  onClick={() => handleSelectChoice('left')}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer active:scale-95 ${
                    arLensChallenge.myChoice === 'left'
                      ? 'bg-[#6C5CE7]/30 border-[#6C5CE7] ring-2 ring-[#6C5CE7] shadow-[0_0_20px_rgba(108,92,231,0.5)] scale-102'
                      : 'bg-black/60 hover:bg-black/80 border-white/15 text-white/90'
                  }`}
                >
                  <span className="text-3xl mb-1 drop-shadow-md">{currentQuestion.optionLeft.emoji}</span>
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentQuestion.optionLeft.label}
                  </span>
                  <span className="mt-1 text-[9px] text-white/50 font-semibold uppercase tracking-wider">
                    Tilt Left 👈
                  </span>
                </button>

                {/* Right Choice Card */}
                <button
                  type="button"
                  onClick={() => handleSelectChoice('right')}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer active:scale-95 ${
                    arLensChallenge.myChoice === 'right'
                      ? 'bg-[#FD79A8]/30 border-[#FD79A8] ring-2 ring-[#FD79A8] shadow-[0_0_20px_rgba(253,121,168,0.5)] scale-102'
                      : 'bg-black/60 hover:bg-black/80 border-white/15 text-white/90'
                  }`}
                >
                  <span className="text-3xl mb-1 drop-shadow-md">{currentQuestion.optionRight.emoji}</span>
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentQuestion.optionRight.label}
                  </span>
                  <span className="mt-1 text-[9px] text-white/50 font-semibold uppercase tracking-wider">
                    Tilt Right 👉
                  </span>
                </button>
              </div>
            </div>

            {/* AR Live Face Feed with Tilt Rotation */}
            <div
              className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl transition-transform duration-300 ease-out z-10 my-auto"
              style={{ transform: `rotate(${tiltAngle}deg)` }}
            >
              <img
                src={currentUser?.photos[0]}
                alt="Your AR Face"
                className="w-full h-full object-cover filter brightness-105"
              />

              {/* AR Hologram Eyewear / Star Sparkle Filter Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="text-4xl animate-pulse">✨</span>
              </div>

              {/* Partner Floating Avatar PIP Inset */}
              <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full border-2 border-[#00B894] overflow-hidden shadow-lg bg-black">
                <img
                  src={arLensChallenge.partnerAvatar}
                  alt={arLensChallenge.partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom Tilt Instruction & Action Buttons */}
            <div className="relative z-20 w-full flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectChoice('left')}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>👈 Tilt Left</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectChoice('right')}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>Tilt Right 👉</span>
              </button>
            </div>
          </div>
        ) : (
          /* Challenge Completed Screen */
          <div className="relative flex-1 w-full bg-[#18181B] flex flex-col items-center justify-center p-6 text-center text-white animate-in zoom-in-95 duration-300">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#00B894] flex items-center justify-center mb-4 shadow-[0_10px_30px_rgba(108,92,231,0.4)]">
              <Award className="w-10 h-10 text-white" />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              AR Challenge Complete! 🎉
            </h3>
            <p className="text-xs text-white/60 mb-4 max-w-xs leading-relaxed">
              You and <span className="text-white font-bold">{arLensChallenge.partnerName}</span> completed the "This or That" AR challenge!
            </p>

            {/* Compatibility Badge Card */}
            <div className="w-full max-w-xs p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Vibe Compatibility</p>
                <p className="text-2xl font-black text-[#00B894]">{arLensChallenge.matchScore}% Match</p>
              </div>
              <div className="flex -space-x-2">
                <img
                  src={currentUser?.photos[0]}
                  alt="You"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src={arLensChallenge.partnerAvatar}
                  alt={arLensChallenge.partnerName}
                  className="w-10 h-10 rounded-full border-2 border-[#00B894] object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                type="button"
                onClick={handleChatWithPartner}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] hover:from-[#5b4bc4] text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with {arLensChallenge.partnerName}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeARLensChallenge();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-xs transition-colors cursor-pointer"
              >
                Close Challenge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

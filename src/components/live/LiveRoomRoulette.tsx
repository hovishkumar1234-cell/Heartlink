import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LIVE_ROULETTE_ICEBREAKERS } from '../../data/liveData';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Heart,
  Flame,
  Laugh,
  ThumbsUp,
  Clock,
  Shuffle,
  ShieldAlert,
  ChevronRight,
  Eye,
  Radio,
  UserCheck,
  Zap,
} from 'lucide-react';
import { LiveMediaMode } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ReportUserModal } from '../common/ReportUserModal';

export const LiveRoomRoulette: React.FC = () => {
  const {
    currentUser,
    liveRoulette,
    startLiveRoulette,
    leaveLiveRoulette,
    skipLiveRoulettePartner,
    toggleLiveMediaMode,
    toggleLiveAudioMute,
    toggleLiveVideoMute,
    sendLiveReaction,
    extendLiveRound,
    likeLivePartner,
    nextLivePrompt,
    reportUser,
  } = useApp();

  const [isReporting, setIsReporting] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentPrompt =
    LIVE_ROULETTE_ICEBREAKERS[liveRoulette.currentPromptIndex % LIVE_ROULETTE_ICEBREAKERS.length];

  // =========================================================================
  // VIEW: Idle State (Launch Screen)
  // =========================================================================
  if (liveRoulette.status === 'idle') {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Hero Card */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] text-center relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#6C5CE7]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#FD79A8]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Pulse Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold tracking-wide uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00B894] animate-ping" />
            <Radio className="w-3.5 h-3.5" />
            Live Speed-Dating Roulette
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436] tracking-tight">
            Meet active people <span className="text-[#6C5CE7]">right now</span>
          </h2>
          <p className="text-sm text-[#636E72] mt-2 max-w-md mx-auto leading-relaxed">
            Skip the endless swiping and waiting. Jump into casual 3-minute live speed-dating rounds with
            synchronized icebreaker questions, live reactions, and instant chemistry checks.
          </p>

          {/* Media Mode Selector */}
          <div className="mt-6 mb-6">
            <label className="text-xs font-semibold text-[#636E72] uppercase tracking-wider block mb-2.5">
              Choose Your Connection Vibe:
            </label>
            <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
              {[
                {
                  id: 'video' as LiveMediaMode,
                  label: 'Video Call',
                  desc: 'Face to face',
                  icon: Video,
                },
                {
                  id: 'audio' as LiveMediaMode,
                  label: 'Voice Only',
                  desc: 'Chill audio',
                  icon: Mic,
                },
                {
                  id: 'photo' as LiveMediaMode,
                  label: 'Mystery Blur',
                  desc: 'Reveals slowly',
                  icon: Eye,
                },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = liveRoulette.mediaMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => toggleLiveMediaMode(mode.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-sm ring-2 ring-[#6C5CE7]/20'
                        : 'border-[#E9ECEF] bg-[#F8F9FA] hover:border-[#6C5CE7]/40 text-[#636E72]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-[#6C5CE7]' : 'text-[#636E72]'}`} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#6C5CE7]' : 'text-[#2D3436]'}`}>
                      {mode.label}
                    </span>
                    <span className="text-[10px] text-[#636E72]">{mode.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Online presence counter */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#636E72] mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B894]" />
            <span>84 active members online in your area</span>
          </div>

          {/* Big Launch Button */}
          <button
            onClick={startLiveRoulette}
            className="w-full max-w-sm mx-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] text-white font-bold text-base shadow-[0_10px_25px_rgba(108,92,231,0.35)] hover:shadow-[0_12px_30px_rgba(108,92,231,0.5)] active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span>Start Speed-Dating Roulette</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Safety & Community Note */}
          <p className="text-[11px] text-[#636E72] mt-4 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#00B894]" />
            18+ Verified Community • Instant skip & report anytime
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Searching State
  // =========================================================================
  if (liveRoulette.status === 'searching') {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-12 px-4 text-center">
        {/* Radar Radar Animation */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#6C5CE7]/30 animate-ping opacity-75" />
          <div className="absolute inset-4 rounded-full border border-[#FD79A8]/40 animate-pulse" />
          <div className="absolute inset-10 rounded-full border border-[#00B894]/40" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] flex items-center justify-center text-white shadow-[0_8px_30px_rgba(108,92,231,0.4)] z-10 animate-pulse">
            <Radio className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-[#2D3436]">Finding your live match...</h3>
        <p className="text-xs text-[#636E72] mt-1.5 max-w-xs">
          Scanning for available singles nearby looking for a fun conversation.
        </p>

        <button
          onClick={leaveLiveRoulette}
          className="mt-8 px-6 py-2.5 rounded-full border border-[#E9ECEF] text-[#636E72] text-xs font-bold hover:bg-[#E9ECEF]/50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Connected State (Active Speed-Dating Round)
  // =========================================================================
  const partner = liveRoulette.partner;
  if (!partner) return null;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col relative select-none">
      {/* Floating Reactions Container */}
      <div className="absolute inset-x-0 bottom-24 top-16 pointer-events-none z-40 overflow-hidden">
        {liveRoulette.reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-4 text-3xl animate-bounce"
            style={{
              left: `${r.xOffset}%`,
              animation: 'floatUp 2.4s ease-out forwards',
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translateY(-280px) scale(1.4);
            opacity: 0;
          }
        }
      `}</style>

      {/* Main Video/Call Canvas Card */}
      <div className="w-full bg-[#18181B] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(108,92,231,0.18)] border border-[#E9ECEF]/20 relative flex flex-col min-h-[460px] sm:min-h-[520px]">
        {/* Top Overlay Bar: Timer & Prompt */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex flex-col gap-2">
          {/* Header Controls Row */}
          <div className="flex items-center justify-between">
            {/* Round Countdown Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md shadow-md ${
                liveRoulette.secondsRemaining < 30
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-white/20 text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(liveRoulette.secondsRemaining)}</span>
            </div>

            {/* Media Mode Badge */}
            <span className="text-[11px] font-bold text-white/80 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10 uppercase tracking-wider">
              {liveRoulette.mediaMode === 'video'
                ? '🎥 Video'
                : liveRoulette.mediaMode === 'audio'
                ? '🎙️ Voice'
                : '🎭 Mystery Blur'}
            </span>

            {/* Safety & Exit Tools */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsReporting(true)}
                title="Report user"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
              <button
                onClick={leaveLiveRoulette}
                title="Leave room"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Icebreaker Card Banner */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 px-3 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-base shrink-0">🎲</span>
              <p className="text-xs text-white font-medium leading-tight line-clamp-2">
                {currentPrompt}
              </p>
            </div>
            <button
              onClick={nextLivePrompt}
              className="shrink-0 text-[11px] font-bold text-[#FD79A8] hover:text-white bg-black/30 hover:bg-[#FD79A8] px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3" />
              <span>Next</span>
            </button>
          </div>
        </div>

        {/* Video / Call Center Stage */}
        <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-[#2D3436] to-[#121214]">
          {/* Partner Media Feed */}
          {liveRoulette.mediaMode === 'video' && !liveRoulette.isPartnerVideoMuted ? (
            <div className="w-full h-full relative">
              <img
                src={partner.photos[0]}
                alt={partner.name}
                className="w-full h-full object-cover"
              />
              {/* Partner Speaking Indicator Wave */}
              <div className="absolute top-24 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] text-white">
                <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
                <span>{partner.name} is speaking...</span>
              </div>
            </div>
          ) : liveRoulette.mediaMode === 'audio' ? (
            /* Voice Audio Visualizer Mode */
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full border-4 border-[#6C5CE7]/40 animate-ping absolute inset-0" />
                <img
                  src={partner.photos[0]}
                  alt={partner.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#6C5CE7] shadow-xl relative z-10"
                />
              </div>
              {/* Simulated Audio Waveform Bars */}
              <div className="flex items-center gap-1.5 h-10 mb-2">
                {[40, 75, 100, 60, 90, 45, 80, 50, 95, 70, 40].map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-[#6C5CE7] to-[#00B894] rounded-full animate-pulse"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-white text-sm font-bold">Voice-Only Speed Date</p>
              <p className="text-white/60 text-xs mt-0.5">Focus on voice chemistry and laughter</p>
            </div>
          ) : (
            /* Mystery Blur Mode */
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
              <img
                src={partner.photos[0]}
                alt={partner.name}
                className="w-full h-full object-cover transition-all duration-1000"
                style={{
                  filter: `blur(${Math.max(0, (liveRoulette.secondsRemaining / 180) * 25)}px)`,
                }}
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3">
                  <Eye className="w-8 h-8" />
                </div>
                <h4 className="text-white font-extrabold text-base">Mystery Silhouette Mode</h4>
                <p className="text-white/80 text-xs max-w-xs mt-1">
                  The portrait sharpens as you talk and share answers!
                </p>
              </div>
            </div>
          )}

          {/* Self Camera PiP (Picture in Picture) in bottom right */}
          <div className="absolute bottom-20 right-3 sm:right-4 w-28 sm:w-32 h-36 sm:h-40 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl z-30 bg-[#2D3436]">
            {liveRoulette.isVideoMuted ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#2D3436] text-white p-2 text-center">
                <VideoOff className="w-5 h-5 text-red-400 mb-1" />
                <span className="text-[10px] text-white/70">Cam Off</span>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <img
                  src={currentUser?.photos[0]}
                  alt="You"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] text-white px-1.5 py-0.5 rounded font-bold">
                  You
                </span>
              </div>
            )}
            {/* Self mic indicator */}
            <div className="absolute top-1.5 right-1.5">
              {liveRoulette.isAudioMuted ? (
                <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <MicOff className="w-3 h-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#00B894] text-white flex items-center justify-center">
                  <Mic className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {/* Partner Info Scrim Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white text-lg font-bold">
                {partner.name}, {partner.age}
              </span>
              {partner.isVerified && <VerifiedBadge size="sm" userName={partner.name} />}
            </div>
            <p className="text-xs text-white/80">{partner.occupation} • {partner.location.city}</p>
          </div>
        </div>

        {/* Reaction Bar */}
        <div className="bg-[#2D3436] px-4 py-2 flex items-center justify-between border-t border-white/10 z-30">
          <span className="text-[11px] font-bold text-white/60">Tap Reaction:</span>
          <div className="flex items-center gap-3">
            {[
              { emoji: '💖', label: 'Heart' },
              { emoji: '🔥', label: 'Fire' },
              { emoji: '😂', label: 'Laugh' },
              { emoji: '👏', label: 'Clap' },
              { emoji: '✨', label: 'Sparkles' },
            ].map((r) => (
              <button
                key={r.emoji}
                onClick={() => sendLiveReaction(r.emoji)}
                className="text-xl hover:scale-125 active:scale-95 transition-transform cursor-pointer p-1"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>

          {/* Toggle Self Media Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleLiveAudioMute}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer ${
                liveRoulette.isAudioMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {liveRoulette.isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleLiveVideoMute}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer ${
                liveRoulette.isVideoMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {liveRoulette.isVideoMuted ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls Dock */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {/* Skip / Next Partner */}
        <button
          onClick={skipLiveRoulettePartner}
          className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white border border-[#E9ECEF] hover:bg-[#F8F9FA] shadow-[0_4px_15px_rgba(0,0,0,0.04)] text-[#636E72] hover:text-[#2D3436] active:scale-98 transition-all cursor-pointer group"
        >
          <RotateCcw className="w-5 h-5 mb-1 group-hover:-rotate-45 transition-transform" />
          <span className="text-xs font-bold">Skip Partner</span>
          <span className="text-[10px] text-[#636E72]">No pressure</span>
        </button>

        {/* Extend +60s */}
        <button
          onClick={extendLiveRound}
          className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white border border-[#6C5CE7]/30 hover:border-[#6C5CE7] hover:bg-[#6C5CE7]/5 shadow-[0_4px_15px_rgba(108,92,231,0.08)] text-[#6C5CE7] active:scale-98 transition-all cursor-pointer"
        >
          <Clock className="w-5 h-5 mb-1" />
          <span className="text-xs font-bold">+60s Extend</span>
          <span className="text-[10px] text-[#636E72]">Add more time</span>
        </button>

        {/* Mutual Like / Thumbs Up */}
        <button
          onClick={likeLivePartner}
          disabled={liveRoulette.userLiked}
          className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl shadow-md active:scale-98 transition-all cursor-pointer ${
            liveRoulette.isMutualMatch
              ? 'bg-[#00B894] text-white shadow-[0_4px_15px_rgba(0,184,148,0.35)]'
              : liveRoulette.userLiked
              ? 'bg-[#FD79A8] text-white shadow-[0_4px_15px_rgba(253,121,168,0.35)]'
              : 'bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] text-white hover:opacity-95 shadow-[0_4px_15px_rgba(253,121,168,0.35)]'
          }`}
        >
          {liveRoulette.isMutualMatch ? (
            <>
              <UserCheck className="w-5 h-5 mb-1" />
              <span className="text-xs font-extrabold">Matched! 🎉</span>
              <span className="text-[10px] text-white/90">In your matches</span>
            </>
          ) : liveRoulette.userLiked ? (
            <>
              <Heart className="w-5 h-5 mb-1 fill-white" />
              <span className="text-xs font-bold">Liked! 👍</span>
              <span className="text-[10px] text-white/90">Waiting for peer</span>
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 mb-1" />
              <span className="text-xs font-bold">Mutual Match</span>
              <span className="text-[10px] text-white/90">Keep in touch</span>
            </>
          )}
        </button>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <ReportUserModal
          targetUser={partner}
          isOpen={isReporting}
          onClose={() => setIsReporting(false)}
          onSuccess={() => {
            setIsReporting(false);
            skipLiveRoulettePartner();
          }}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SoundWaveProfile, AmbientSyncTrack } from '../../types';
import { playAmbientTrack, stopAmbientTrack } from '../../utils/ambientSound';
import { triggerHaptic } from '../../utils/haptics';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { RecordSoundScapeModal } from './RecordSoundScapeModal';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  RotateCcw,
  Sparkles,
  Heart,
  Lock,
  Unlock,
  Eye,
  Send,
  Plus,
  Radio,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Waves,
  MessageCircle,
} from 'lucide-react';

export const SoundWaveDeck: React.FC = () => {
  const {
    currentUser,
    soundWaveProfiles,
    sendSoundWaveVoiceReply,
    markSoundWaveListened,
    likeUser,
    setActiveScreen,
    setActiveChatMatchId,
    matches,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);

  // Voice reply drawer state
  const [isReplyRecording, setIsReplyRecording] = useState(false);
  const [replySeconds, setReplySeconds] = useState(0);
  const [replyAmbient, setReplyAmbient] = useState<AmbientSyncTrack>('rain_outside');
  const [showReplyDrawer, setShowReplyDrawer] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Studio modal for user's soundscape
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  const playbackTimerRef = useRef<any>(null);
  const replyTimerRef = useRef<any>(null);

  const activeProfile: SoundWaveProfile | undefined = soundWaveProfiles[currentIndex];

  // Stop ambient and timer when changing profiles
  useEffect(() => {
    stopAmbientTrack();
    setIsPlaying(false);
    setPlaybackSeconds(0);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setShowReplyDrawer(false);
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      stopAmbientTrack();
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (replyTimerRef.current) clearInterval(replyTimerRef.current);
    };
  }, []);

  if (!activeProfile) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 text-center border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.08)]">
        <div className="w-16 h-16 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center mx-auto mb-4">
          <Waves className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-[#2D3436]">All Soundscapes Explored!</h3>
        <p className="text-xs text-[#636E72] mt-1 max-w-xs mx-auto">
          You've listened to all active voice profiles. Record your own soundscape or check your matches!
        </p>
        <button
          onClick={() => setIsStudioModalOpen(true)}
          className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] text-white text-xs font-bold shadow-md cursor-pointer"
        >
          + Record My Soundscape
        </button>
      </div>
    );
  }

  // Calculate reveal blur & de-pixelation level
  // Replies count: 0 (25% revealed), 1 (50%), 2 (75%), 3+ (100% unlocked)
  const replies = activeProfile.voiceRepliesCount;
  const isUnlocked = activeProfile.isUnlocked || replies >= 3;
  const hasListened = activeProfile.hasListened;

  const getBlurPx = () => {
    if (isUnlocked) return 0;
    if (replies === 2) return 4;
    if (replies === 1) return 10;
    if (hasListened) return 18;
    return 28;
  };

  const getRevealPercentage = () => {
    if (isUnlocked) return 100;
    if (replies === 2) return 75;
    if (replies === 1) return 50;
    if (hasListened) return 35;
    return 20;
  };

  // Play / Pause Soundscape
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAmbientTrack();
      setIsPlaying(false);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    } else {
      triggerHaptic('light');
      setIsPlaying(true);
      markSoundWaveListened(activeProfile.id);

      if (!isAmbientMuted) {
        playAmbientTrack(activeProfile.ambientTrack, 0.28);
      }

      playbackTimerRef.current = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= activeProfile.audioDurationSeconds) {
            stopAmbientTrack();
            setIsPlaying(false);
            clearInterval(playbackTimerRef.current);
            return activeProfile.audioDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleToggleAmbientMute = () => {
    triggerHaptic('light');
    if (!isAmbientMuted) {
      stopAmbientTrack();
      setIsAmbientMuted(true);
    } else {
      setIsAmbientMuted(false);
      if (isPlaying) {
        playAmbientTrack(activeProfile.ambientTrack, 0.28);
      }
    }
  };

  // Reply Recording handlers
  const handleStartReplyRecording = () => {
    triggerHaptic('medium');
    setIsReplyRecording(true);
    setReplySeconds(0);

    playAmbientTrack(replyAmbient, 0.2);

    replyTimerRef.current = setInterval(() => {
      setReplySeconds((prev) => {
        if (prev >= 20) {
          handleStopReplyRecording();
          return 20;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopReplyRecording = () => {
    triggerHaptic('success');
    setIsReplyRecording(false);
    stopAmbientTrack();
    if (replyTimerRef.current) clearInterval(replyTimerRef.current);
  };

  const handleSendVoiceReplySubmit = () => {
    sendSoundWaveVoiceReply(
      activeProfile.id,
      replySeconds || 15,
      replyAmbient,
      replyText || 'Loved your cadence and answer! Here is my audio note.'
    );
    setShowReplyDrawer(false);
    setReplySeconds(0);
    setReplyText('');
  };

  const handleNextProfile = () => {
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev + 1) % soundWaveProfiles.length);
  };

  const handlePrevProfile = () => {
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev - 1 + soundWaveProfiles.length) % soundWaveProfiles.length);
  };

  const blurPx = getBlurPx();
  const revealPct = getRevealPercentage();

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4 select-none">
      {/* Top Banner & Studio Trigger */}
      <div className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] text-white flex items-center justify-center shadow-sm">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#2D3436] tracking-tight uppercase">
              The Sound-Wave Blind Date
            </h3>
            <span className="text-[10px] text-[#636E72] block">
              Tone, Cadence & Laughter Over Looks
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsStudioModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7] text-[#6C5CE7] hover:text-white transition-all text-xs font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>My Soundscape</span>
        </button>
      </div>

      {/* Main Interactive Sound-Wave Card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(108,92,231,0.12)] border border-[#E9ECEF] flex flex-col relative">
        {/* =================================================================== */}
        {/* PHOTO CANVAS WITH PROGRESSIVE AUDIO WAVEFORM DE-PIXELATION */}
        {/* =================================================================== */}
        <div className="relative h-72 sm:h-80 w-full bg-[#18181B] overflow-hidden flex items-center justify-center">
          {/* Base Photo with Dynamic Blur & CSS Mosaic Filter */}
          <img
            src={activeProfile.photoUrl}
            alt={activeProfile.userName}
            className="w-full h-full object-cover transition-all duration-700 ease-out"
            style={{
              filter: `blur(${blurPx}px) contrast(${isUnlocked ? 1 : 1.15}) saturate(${
                isUnlocked ? 1 : 1.2
              })`,
              transform: `scale(${isUnlocked ? 1 : 1.08})`,
            }}
          />

          {/* Dynamic Audio Waveform Filter Mask Overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 backdrop-blur-none flex flex-col justify-between p-4 pointer-events-none">
              {/* Dynamic Soundwave Grid Scrim Overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#6C5CE7 1.5px, transparent 1.5px)`,
                  backgroundSize: '16px 16px',
                }}
              />
            </div>
          )}

          {/* Top Status Indicators */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
            {/* Visual Reveal Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md shadow-sm ${
                isUnlocked
                  ? 'bg-[#00B894] text-white shadow-[0_2px_10px_rgba(0,184,148,0.4)]'
                  : 'bg-black/60 text-white border border-white/20'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>100% Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#FD79A8]" />
                  <span>{revealPct}% Visual Reveal</span>
                </>
              )}
            </div>

            {/* Ambient Sync Badge */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-xs font-bold">
              <span>{activeProfile.ambientTrackEmoji}</span>
              <span className="text-[11px] truncate max-w-[130px]">
                {activeProfile.ambientTrackLabel}
              </span>
              <button
                onClick={handleToggleAmbientMute}
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 cursor-pointer"
                title={isAmbientMuted ? 'Unmute ambient track' : 'Mute ambient track'}
              >
                {isAmbientMuted ? (
                  <VolumeX className="w-3 h-3 text-red-400" />
                ) : (
                  <Volume2 className="w-3 h-3 text-[#00B894]" />
                )}
              </button>
            </div>
          </div>

          {/* Center Soundwave Pulse Playback Button */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <button
              onClick={handleTogglePlay}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 cursor-pointer group ${
                isPlaying
                  ? 'bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] scale-105 shadow-[0_0_35px_rgba(108,92,231,0.6)]'
                  : 'bg-gradient-to-tr from-[#6C5CE7] to-[#4834D4] hover:scale-110 shadow-[0_0_25px_rgba(108,92,231,0.4)]'
              }`}
            >
              {/* Pulsing ring while playing */}
              {isPlaying && (
                <div className="absolute -inset-2 rounded-full border-2 border-[#FD79A8] animate-ping opacity-60" />
              )}
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white" />
              ) : (
                <Play className="w-8 h-8 fill-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Card Persona Tag Overlay */}
          <div className="absolute bottom-3 inset-x-3 z-20 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-lg drop-shadow-md">
                  {activeProfile.userName}, {activeProfile.userAge}
                </span>
                {activeProfile.isVerified && <VerifiedBadge size="sm" userName={activeProfile.userName} />}
              </div>
              <span className="text-xs text-white/90 drop-shadow-md font-medium">
                {activeProfile.userOccupation} • {activeProfile.distanceKm} km away
              </span>
            </div>

            {/* Voice Cadence Badge */}
            <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-[#FD79A8] text-[10px] font-bold shadow-sm">
              🎙️ {activeProfile.voiceCadenceLabel}
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* INTERACTIVE AUDIO SOUNDSCAPE CONTROLS & TRANSCRIPT */}
        {/* =================================================================== */}
        <div className="p-4 sm:p-5 flex flex-col gap-3.5 bg-white">
          {/* Prompt Question */}
          <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
            <span className="text-[10px] font-extrabold text-[#6C5CE7] uppercase tracking-wider block mb-1">
              Quirky Voice Prompt:
            </span>
            <p className="text-xs font-black text-[#2D3436] leading-tight">
              "{activeProfile.promptQuestion}"
            </p>
          </div>

          {/* Interactive Waveform Visualization */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#636E72]">
              <span className="flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>20s Voice Note & Ambient Mix</span>
              </span>
              <span className="tabular-nums">
                00:{playbackSeconds < 10 ? '0' : ''}
                {playbackSeconds} / 00:{activeProfile.audioDurationSeconds}
              </span>
            </div>

            {/* Waveform Bar Track */}
            <div className="flex items-center gap-1 h-12 w-full px-1 py-1 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] overflow-hidden">
              {activeProfile.waveform.map((bar, i) => {
                const isPassed =
                  (playbackSeconds / activeProfile.audioDurationSeconds) * activeProfile.waveform.length >= i;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      const newSec = Math.floor(
                        (i / activeProfile.waveform.length) * activeProfile.audioDurationSeconds
                      );
                      setPlaybackSeconds(newSec);
                    }}
                    className={`flex-1 rounded-full transition-all cursor-pointer ${
                      isPassed
                        ? 'bg-gradient-to-t from-[#6C5CE7] to-[#FD79A8]'
                        : 'bg-[#E9ECEF] hover:bg-[#6C5CE7]/30'
                    }`}
                    style={{
                      height: `${Math.max(20, bar * 100)}%`,
                      transform: isPlaying && isPassed ? 'scaleY(1.15)' : 'scaleY(1)',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Live Transcript Quote Bubble */}
          <div className="p-3 bg-gradient-to-r from-[#6C5CE7]/5 to-[#FD79A8]/5 rounded-2xl border border-[#6C5CE7]/15">
            <span className="text-[10px] font-extrabold text-[#2D3436] block mb-1">
              💬 Story Transcript:
            </span>
            <p className="text-xs text-[#2D3436] leading-relaxed italic">
              "{activeProfile.promptAnswerTranscript}"
            </p>
          </div>

          {/* ================================================================= */}
          {/* VISUAL REVEAL PROGRESS TRACKER (3-Step Voice Note Exchange) */}
          {/* ================================================================= */}
          <div className="pt-2 border-t border-[#E9ECEF] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#2D3436] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>Visual Reveal Progress:</span>
              </span>
              <span className="font-black text-[#6C5CE7]">
                {replies >= 3 ? '✨ Unlocked!' : `${replies} of 3 Voice Notes Exchanged`}
              </span>
            </div>

            {/* 4-Step Progress Segments */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { stage: 0, label: 'Waveform', desc: 'Listen' },
                { stage: 1, label: 'Silhouette', desc: '1st Voice' },
                { stage: 2, label: 'Frosted', desc: '2nd Voice' },
                { stage: 3, label: 'Unlocked', desc: '3rd Voice 🎉' },
              ].map((s) => {
                const isPassed = replies >= s.stage || (s.stage === 0 && hasListened);
                const isCurrent = (replies === s.stage && !isUnlocked) || (s.stage === 3 && isUnlocked);

                return (
                  <div
                    key={s.stage}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isPassed
                        ? 'border-[#00B894] bg-[#00B894]/10 text-[#00B894]'
                        : isCurrent
                        ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 text-[#6C5CE7]'
                        : 'border-[#E9ECEF] bg-[#F8F9FA] text-[#636E72]'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold block">{s.label}</span>
                    <span className="text-[9px] opacity-80 block">{s.desc}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-[#636E72] text-center">
              {isUnlocked
                ? 'Full unblurred profile unlocked! Start chatting below.'
                : `Exchange ${3 - replies} more voice note${3 - replies === 1 ? '' : 's'} to automatically de-pixelate and unlock the full profile!`}
            </p>
          </div>

          {/* Action Row: Send Voice Reply & Like/Pass */}
          <div className="pt-2 flex items-center gap-2">
            {/* Previous Profile */}
            <button
              onClick={handlePrevProfile}
              className="p-3 rounded-2xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#636E72] hover:text-[#2D3436] transition-colors cursor-pointer"
              title="Previous soundscape"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Voice Reply CTA */}
            <button
              onClick={() => setShowReplyDrawer((prev) => !prev)}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] text-white font-extrabold text-xs shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 fill-white" />
              <span>
                {showReplyDrawer
                  ? 'Close Voice Recorder'
                  : `Send 20s Voice Reply (+25% Unblur)`}
              </span>
            </button>

            {/* Like Profile */}
            <button
              onClick={() => {
                triggerHaptic('celebration');
                likeUser(activeProfile.userId);
              }}
              className="p-3 rounded-2xl border border-[#FD79A8] bg-[#FD79A8]/10 hover:bg-[#FD79A8] text-[#FD79A8] hover:text-white transition-all cursor-pointer"
              title="Like Sound-Wave Profile"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Next Profile */}
            <button
              onClick={handleNextProfile}
              className="p-3 rounded-2xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#636E72] hover:text-[#2D3436] transition-colors cursor-pointer"
              title="Next soundscape"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VOICE REPLY RECORDER DRAWER */}
      {/* ===================================================================== */}
      {showReplyDrawer && (
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(108,92,231,0.12)] border border-[#6C5CE7]/30 flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00B894] animate-pulse" />
              <h4 className="text-xs font-black text-[#2D3436] uppercase tracking-wider">
                Record Voice Reply to {activeProfile.userName}
              </h4>
            </div>
            <span className="text-[11px] font-bold text-[#6C5CE7]">
              Unlocks +25% Clarity
            </span>
          </div>

          {/* Select Ambient Track for your reply */}
          <div>
            <label className="text-[11px] font-bold text-[#636E72] block mb-1">
              Select Background Setting for Your Reply:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'rain_outside' as AmbientSyncTrack, label: '🌧️ Rain' },
                { id: 'lofi_vinyl' as AmbientSyncTrack, label: '☕ Lo-Fi' },
                { id: 'cafe_jazz' as AmbientSyncTrack, label: '🎷 Jazz' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setReplyAmbient(opt.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    replyAmbient === opt.id
                      ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                      : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#636E72]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Record button & timer */}
          <div className="bg-[#18181B] rounded-2xl p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={
                  isReplyRecording ? handleStopReplyRecording : handleStartReplyRecording
                }
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isReplyRecording
                    ? 'bg-red-500 animate-pulse text-white'
                    : 'bg-[#FD79A8] hover:bg-[#e05688] text-white'
                }`}
              >
                <Mic className="w-5 h-5 fill-white" />
              </button>
              <div>
                <span className="text-xs font-bold block">
                  {isReplyRecording ? 'Recording voice note...' : 'Tap Mic to Record (20s)'}
                </span>
                <span className="text-[10px] text-white/60">
                  {replySeconds > 0 ? `Captured: ${replySeconds}s` : 'Playing ambient in background'}
                </span>
              </div>
            </div>

            <span className="text-xs font-black px-2 py-1 rounded-lg bg-white/20">
              00:{replySeconds < 10 ? '0' : ''}
              {replySeconds} / 00:20
            </span>
          </div>

          {/* Optional Note Transcript */}
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Add an optional text note with your voice reply..."
            className="w-full px-3 py-2 rounded-xl border border-[#E9ECEF] text-xs text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none bg-[#F8F9FA]"
          />

          {/* Submit Voice Reply Button */}
          <button
            onClick={handleSendVoiceReplySubmit}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00B894] to-[#009688] text-white font-extrabold text-xs shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Audio Reply & De-Pixelate (+25%) 🚀</span>
          </button>
        </div>
      )}

      {/* Record SoundScape Studio Modal */}
      <RecordSoundScapeModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
      />
    </div>
  );
};

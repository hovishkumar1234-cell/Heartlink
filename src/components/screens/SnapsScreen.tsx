import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DualCameraVibeFeed } from '../snaps/DualCameraVibeFeed';
import { CaptureDualCamModal } from '../snaps/CaptureDualCamModal';
import { DisappearingSnapCreatorModal } from '../snaps/DisappearingSnapCreatorModal';
import { DisappearingSnapModal } from '../snaps/DisappearingSnapModal';
import { ARLensChallengeModal } from '../snaps/ARLensChallengeModal';
import { SAMPLE_DISAPPEARING_SNAPS, AR_THIS_OR_THAT_QUESTIONS } from '../../data/snapData';
import { SelfDestructSnap, ARLensChallengeType } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import {
  Camera,
  Sparkles,
  Flame,
  Plus,
  Play,
  RotateCcw,
  Zap,
  Clock,
  Send,
  Eye,
  Smile,
} from 'lucide-react';

export const SnapsScreen: React.FC = () => {
  const {
    currentUser,
    users,
    matches,
    messages,
    arLensChallenge,
    startARLensChallenge,
    setActiveChatMatchId,
    setActiveScreen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'vibes' | 'ar_lens' | 'disappearing'>('vibes');
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isSnapCreatorOpen, setIsSnapCreatorOpen] = useState(false);
  const [targetMatchForSnap, setTargetMatchForSnap] = useState<string | undefined>();
  const [activeViewingSnap, setActiveViewingSnap] = useState<SelfDestructSnap | null>(null);

  // Collect all self-destructing snaps from messages
  const existingSnapsInChat: SelfDestructSnap[] = messages
    .filter((m) => m.attachmentType === 'snap' && m.snapData)
    .map((m) => m.snapData as SelfDestructSnap);

  const handleStartARLens = (partnerId: string, challengeType: ARLensChallengeType = 'this_or_that') => {
    triggerHaptic('medium');
    startARLensChallenge(partnerId, challengeType);
  };

  const handleOpenSnapCreator = (matchId?: string) => {
    triggerHaptic('light');
    setTargetMatchForSnap(matchId);
    setIsSnapCreatorOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-12 animate-in fade-in duration-200">
      {/* Screen Title & Tagline Banner */}
      <div className="w-full bg-white rounded-3xl p-5 border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.08)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2D3436] tracking-tight flex items-center gap-2">
                <span>Casual Snaps & AR</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FD79A8]/15 text-[#FD79A8] text-[10px] font-extrabold uppercase">
                  Unfiltered
                </span>
              </h2>
              <p className="text-xs text-[#636E72]">
                Dual-cam vibes, disappearing media & multiplayer AR filters
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              setIsCaptureModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Capture My Vibe</span>
          </button>
        </div>

        {/* Navigation Tabs Strip */}
        <div className="flex items-center gap-2 border-t border-[#E9ECEF] pt-3">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('vibes');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'vibes'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Today's Vibe</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('ar_lens');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ar_lens'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FD79A8]" />
            <span>AR Lens Games</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('disappearing');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'disappearing'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Expiring Snaps</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Today's Vibe Dual-Camera Feed */}
      {activeTab === 'vibes' && (
        <DualCameraVibeFeed
          onOpenCaptureModal={() => setIsCaptureModalOpen(true)}
          onOpenSnapCreator={handleOpenSnapCreator}
          onStartARLens={(partnerId) => handleStartARLens(partnerId, 'this_or_that')}
        />
      )}

      {/* Tab 2: AR Lens Challenges Hub */}
      {activeTab === 'ar_lens' && (
        <div className="w-full flex flex-col gap-4">
          {/* Spotlight AR Challenge Card */}
          <div className="w-full rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-[#18181B] text-white p-5 border border-purple-500/20 shadow-xl relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FD79A8]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#FD79A8]">
                Featured Lens Challenge
              </span>
              <span className="text-xs font-bold text-white/70">Multiplayer Camera</span>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-black tracking-tight mb-1">
                "This or That" Head-Tilt AR 👈👉
              </h3>
              <p className="text-xs text-white/70 leading-relaxed max-w-md">
                Tilt your head left or right to make instant choices with your matches. See your compatibility chemistry in real time!
              </p>
            </div>

            {/* Match partner selection picker */}
            <div className="relative z-10 flex flex-col gap-2 pt-2 border-t border-white/10">
              <p className="text-[11px] font-bold text-white/60">Choose a match to challenge:</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {users
                  .filter((u) => u.id !== currentUser?.id)
                  .slice(0, 5)
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartARLens(user.id, 'this_or_that')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      <img
                        src={user.photos[0]}
                        alt={user.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{user.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* AR Lens Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Challenge 1 */}
            <div className="p-4 rounded-3xl bg-white border border-[#E9ECEF] shadow-xs flex flex-col justify-between gap-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7] mb-2 font-black text-lg">
                  👈👉
                </div>
                <h4 className="text-sm font-extrabold text-[#2D3436]">This or That Lens</h4>
                <p className="text-xs text-[#636E72] mt-0.5 leading-relaxed">
                  Rapid-fire head tilt choices across weekend rituals, date vibes, and spontaneous travel.
                </p>
              </div>
              <button
                onClick={() => {
                  const partner = users.find((u) => u.id !== currentUser?.id);
                  if (partner) handleStartARLens(partner.id, 'this_or_that');
                }}
                className="w-full py-2 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7] hover:text-white text-[#6C5CE7] text-xs font-extrabold transition-colors cursor-pointer"
              >
                Play Now
              </button>
            </div>

            {/* Challenge 2 */}
            <div className="p-4 rounded-3xl bg-white border border-[#E9ECEF] shadow-xs flex flex-col justify-between gap-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#00B894]/10 flex items-center justify-center text-[#00B894] mb-2 font-black text-lg">
                  🎵
                </div>
                <h4 className="text-sm font-extrabold text-[#2D3436]">Guess the Song AR</h4>
                <p className="text-xs text-[#636E72] mt-0.5 leading-relaxed">
                  Hum or tap along with floating waveform notes to guess your partner's top guilty pleasure song.
                </p>
              </div>
              <button
                onClick={() => {
                  const partner = users.find((u) => u.id !== currentUser?.id);
                  if (partner) handleStartARLens(partner.id, 'guess_the_song');
                }}
                className="w-full py-2 rounded-xl bg-[#00B894]/10 hover:bg-[#00B894] hover:text-white text-[#00B894] text-xs font-extrabold transition-colors cursor-pointer"
              >
                Play Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Disappearing Ephemeral Snaps Hub */}
      {activeTab === 'disappearing' && (
        <div className="w-full flex flex-col gap-4">
          {/* Action Header Card */}
          <div className="w-full rounded-3xl bg-white p-5 border border-[#E9ECEF] shadow-[0_4px_20px_rgba(108,92,231,0.06)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#2D3436]">Visual-First Ephemeral Media</h3>
              <p className="text-xs text-[#636E72]">
                Photos & doodles that expire after 3s, 5s, or 10s. No chat pressure.
              </p>
            </div>
            <button
              onClick={() => handleOpenSnapCreator()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Snap</span>
            </button>
          </div>

          {/* Active / Sample Snaps Grid */}
          <div className="w-full">
            <h4 className="text-xs font-black text-[#2D3436] mb-2.5 px-1 uppercase tracking-wider">
              Recent Disappearing Snaps
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Ready to view sample snaps */}
              {SAMPLE_DISAPPEARING_SNAPS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveViewingSnap({
                      id: sample.id,
                      matchId: 'sample_match',
                      senderId: 'sample_partner',
                      senderName: 'Sofia Chen',
                      receiverId: currentUser?.id || 'me',
                      mediaType: 'photo',
                      mediaUrl: sample.previewUrl,
                      caption: sample.caption,
                      stickerEmoji: sample.stickerEmoji,
                      viewDurationSeconds: sample.viewDurationSeconds,
                      isOpened: false,
                      hasExpired: false,
                      canReplay: true,
                      createdAt: new Date().toISOString(),
                    });
                  }}
                  className="rounded-2xl overflow-hidden bg-white border border-[#E9ECEF] shadow-xs cursor-pointer group hover:border-[#FD79A8] transition-all flex flex-col"
                >
                  <div className="relative aspect-[4/5] bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={sample.previewUrl}
                      alt="Snap Preview"
                      className="w-full h-full object-cover filter blur-sm group-hover:blur-none transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-2 text-center text-white">
                      <div className="w-9 h-9 rounded-full bg-[#FD79A8] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-1.5">
                        <Flame className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] font-extrabold leading-tight">Tap to View</span>
                      <span className="text-[9px] text-white/80">{sample.viewDurationSeconds}s timer</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white">
                    <p className="text-[11px] font-bold text-[#2D3436] truncate">Sofia Chen</p>
                    <p className="text-[9px] text-[#636E72] truncate">{sample.caption}</p>
                  </div>
                </div>
              ))}

              {/* Chat-derived snaps */}
              {existingSnapsInChat.map((snap) => (
                <div
                  key={snap.id}
                  onClick={() => {
                    if (!snap.hasExpired) {
                      triggerHaptic('light');
                      setActiveViewingSnap(snap);
                    }
                  }}
                  className={`rounded-2xl overflow-hidden bg-white border shadow-xs flex flex-col transition-all ${
                    snap.hasExpired
                      ? 'border-[#E9ECEF] opacity-60'
                      : 'border-[#E9ECEF] hover:border-[#FD79A8] cursor-pointer'
                  }`}
                >
                  <div className="relative aspect-[4/5] bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={snap.mediaUrl}
                      alt="Snap"
                      className={`w-full h-full object-cover ${snap.hasExpired ? 'grayscale' : 'blur-sm'}`}
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2 text-center text-white">
                      {snap.hasExpired ? (
                        <>
                          <Clock className="w-5 h-5 text-zinc-400 mb-1" />
                          <span className="text-[10px] font-bold text-zinc-300">Expired</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-5 h-5 text-[#FD79A8] mb-1 animate-pulse" />
                          <span className="text-[10px] font-extrabold">Tap to View</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white">
                    <p className="text-[11px] font-bold text-[#2D3436] truncate">{snap.senderName}</p>
                    <p className="text-[9px] text-[#636E72]">{snap.hasExpired ? 'Vanished' : `${snap.viewDurationSeconds}s timer`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button on Mobile: Capture My Vibe */}
      <div className="fixed bottom-20 right-4 sm:hidden z-30">
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsCaptureModalOpen(true);
          }}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] text-white shadow-[0_8px_25px_rgba(108,92,231,0.4)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          title="Capture Today's Vibe"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>

      {/* Capture Dual-Cam Modal */}
      <CaptureDualCamModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
      />

      {/* Disappearing Snap Creator Modal */}
      <DisappearingSnapCreatorModal
        isOpen={isSnapCreatorOpen}
        onClose={() => setIsSnapCreatorOpen(false)}
        targetMatchId={targetMatchForSnap}
      />

      {/* Disappearing Snap Fullscreen Viewer Modal */}
      <DisappearingSnapModal
        snap={activeViewingSnap}
        onClose={() => setActiveViewingSnap(null)}
      />

      {/* AR Lens Challenge Modal */}
      <ARLensChallengeModal
        isOpen={!!arLensChallenge}
        onClose={() => {}}
      />
    </div>
  );
};

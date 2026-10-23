import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DualCameraVibe } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { VerifiedBadge } from '../common/VerifiedBadge';
import {
  Camera,
  Heart,
  Sparkles,
  SwitchCamera,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Plus,
  Flame,
  Layers,
} from 'lucide-react';

interface DualCameraVibeFeedProps {
  onOpenCaptureModal: () => void;
  onOpenSnapCreator: (targetMatchId?: string) => void;
  onStartARLens: (partnerId: string) => void;
}

export const DualCameraVibeFeed: React.FC<DualCameraVibeFeedProps> = ({
  onOpenCaptureModal,
  onOpenSnapCreator,
  onStartARLens,
}) => {
  const {
    currentUser,
    dualCameraVibes,
    likeDualCameraVibe,
    matches,
    users,
    setActiveChatMatchId,
    setActiveScreen,
  } = useApp();

  // Track swapped camera view state per vibe card (vibeId -> boolean)
  const [swappedCards, setSwappedCards] = useState<Record<string, boolean>>({});

  const toggleSwap = (vibeId: string) => {
    triggerHaptic('light');
    setSwappedCards((prev) => ({
      ...prev,
      [vibeId]: !prev[vibeId],
    }));
  };

  const handleLike = (vibeId: string) => {
    triggerHaptic('light');
    likeDualCameraVibe(vibeId);
  };

  const myVibe = dualCameraVibes.find((v) => v.userId === currentUser?.id);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top Stories Reel Carousel */}
      <div className="w-full bg-white rounded-3xl p-3.5 border border-[#E9ECEF] shadow-[0_4px_20px_rgba(108,92,231,0.06)]">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
            <span className="text-xs font-black text-[#2D3436] tracking-tight">Today's Vibe Stories</span>
          </div>
          <span className="text-[10px] text-[#636E72] font-semibold">24h unedited reality</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {/* User's own story circle or post trigger */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenCaptureModal();
            }}
            className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer focus:outline-none"
          >
            <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#FD79A8] via-[#6C5CE7] to-[#00B894] flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                <img
                  src={currentUser?.photos[0] || ''}
                  alt="You"
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs">
                <Plus className="w-2.5 h-2.5" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#2D3436] truncate max-w-[60px]">
              {myVibe ? 'My Vibe' : '+ Post'}
            </span>
          </button>

          {/* Stories from active users */}
          {dualCameraVibes.map((vibe) => (
            <button
              key={`story_${vibe.id}`}
              onClick={() => {
                triggerHaptic('light');
                const el = document.getElementById(`vibe_${vibe.id}`);
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer focus:outline-none"
            >
              <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                  <img
                    src={vibe.userAvatar}
                    alt={vibe.userName}
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                {vibe.isVerified && (
                  <div className="absolute bottom-0 right-0">
                    <VerifiedBadge size="sm" userName={vibe.userName} />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-semibold text-[#636E72] group-hover:text-[#2D3436] truncate max-w-[60px]">
                {vibe.userName.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual-Camera Feed Cards */}
      <div className="w-full flex flex-col gap-5">
        {dualCameraVibes.map((vibe) => {
          const isSwapped = !!swappedCards[vibe.id];
          const mainImage = isSwapped ? vibe.frontPhotoUrl : vibe.backPhotoUrl;
          const pipImage = isSwapped ? vibe.backPhotoUrl : vibe.frontPhotoUrl;
          const mainLabel = isSwapped ? 'Selfie Cam' : 'Scene Cam';
          const pipLabel = isSwapped ? 'Scene' : 'Selfie';

          // Match lookup
          const existingMatch = matches.find(
            (m) =>
              (m.userId1 === currentUser?.id && m.userId2 === vibe.userId) ||
              (m.userId2 === currentUser?.id && m.userId1 === vibe.userId)
          );

          return (
            <div
              key={vibe.id}
              id={`vibe_${vibe.id}`}
              className="w-full rounded-3xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.08)] overflow-hidden flex flex-col transition-all hover:shadow-[0_12px_40px_rgba(108,92,231,0.12)]"
            >
              {/* Card Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-[#E9ECEF]/60">
                <div className="flex items-center gap-2.5">
                  <img
                    src={vibe.userAvatar}
                    alt={vibe.userName}
                    className="w-9 h-9 rounded-full object-cover border border-[#E9ECEF]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-[#2D3436]">
                        {vibe.userName}, <span className="tabular-nums font-semibold">{vibe.userAge}</span>
                      </h4>
                      {vibe.isVerified && <VerifiedBadge size="sm" userName={vibe.userName} />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#636E72]">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#FD79A8]" />
                        <span>{vibe.locationTag}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{vibe.timeAgoLabel}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] text-[10px] font-black uppercase tracking-wider">
                  Dual-Cam
                </span>
              </div>

              {/* Dual Camera Viewport with Interactive PiP */}
              <div className="relative w-full aspect-[4/5] bg-black overflow-hidden flex items-center justify-center group">
                {/* Main Large View (Back scene or Front selfie) */}
                <img
                  src={mainImage}
                  alt={`${vibe.userName} primary camera view`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none transition-all duration-300"
                />

                {/* PiP Inset Window (Secondary camera) */}
                <button
                  type="button"
                  onClick={() => toggleSwap(vibe.id)}
                  title={`Tap to switch with ${pipLabel}`}
                  className="absolute top-3.5 right-3.5 w-24 h-32 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-black cursor-pointer group/pip transition-transform active:scale-95 hover:scale-102 z-20"
                >
                  <img
                    src={pipImage}
                    alt={`${vibe.userName} secondary camera view`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover/pip:bg-black/40 flex items-center justify-center opacity-0 group-hover/pip:opacity-100 transition-opacity text-white text-[10px] font-bold gap-1">
                    <SwitchCamera className="w-3.5 h-3.5" />
                    <span>Swap</span>
                  </div>
                  <div className="absolute bottom-1 left-1.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.2 rounded text-[8px] text-white font-semibold">
                    {pipLabel}
                  </div>
                </button>

                {/* Bottom Overlay Info & Caption */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-15 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {vibe.promptLabel}
                    </span>
                  </div>
                  <p className="text-xs text-white/95 font-medium leading-relaxed drop-shadow-sm">
                    {vibe.caption}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-white flex items-center justify-between border-t border-[#E9ECEF]/60">
                {/* Likes Button */}
                <button
                  type="button"
                  onClick={() => handleLike(vibe.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                    vibe.likedByMe
                      ? 'bg-[#FD79A8]/15 text-[#FD79A8] font-bold'
                      : 'hover:bg-[#F8F9FA] text-[#636E72] hover:text-[#FD79A8]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform ${
                      vibe.likedByMe ? 'fill-[#FD79A8] text-[#FD79A8] scale-110' : ''
                    }`}
                  />
                  <span className="text-xs font-bold tabular-nums">{vibe.likesCount}</span>
                </button>

                {/* Direct Casual Interactivity Buttons */}
                <div className="flex items-center gap-2">
                  {/* AR Lens Challenge Button */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onStartARLens(vibe.userId);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 border border-[#6C5CE7]/30 text-[#6C5CE7] text-xs font-bold transition-all cursor-pointer active:scale-95"
                    title={`Start AR Lens challenge with ${vibe.userName}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
                    <span>AR Lens</span>
                  </button>

                  {/* Reply with Disappearing Snap */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenSnapCreator(existingMatch?.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] text-white text-xs font-bold shadow-xs transition-all hover:opacity-95 cursor-pointer active:scale-95"
                    title={`Send self-destructing snap reply to ${vibe.userName}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Snap Reply</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Minimize2,
  Maximize2,
  RefreshCw,
  Lock,
  Smile,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { callSounds } from '../../utils/callSounds';

const REACTION_EMOJIS = ['❤️', '🔥', '😂', '😍', '✨', '🥂', '👋'];

export const CallOverlay: React.FC = () => {
  const {
    activeCall,
    endCall,
    toggleCallMute,
    toggleCallVideo,
    toggleCallSpeaker,
    toggleCallCameraFront,
    setMinimizeCall,
    sendCallReaction,
  } = useApp();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [partnerTalking, setPartnerTalking] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Setup local media if video call
  useEffect(() => {
    if (!activeCall) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const requestMedia = async () => {
      if (activeCall.type === 'video' && !activeCall.isVideoOff) {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: activeCall.isCameraFront ? 'user' : 'environment' },
              audio: true,
            });
            if (isMounted) {
              localStreamRef.current = stream;
              setHasCameraPermission(true);
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
              }
            }
          } else {
            if (isMounted) setHasCameraPermission(false);
          }
        } catch {
          if (isMounted) setHasCameraPermission(false);
        }
      } else {
        // Stop video tracks if video is muted
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = false));
        }
      }
    };

    requestMedia();

    return () => {
      isMounted = false;
    };
  }, [activeCall?.type, activeCall?.isVideoOff, activeCall?.isCameraFront, Boolean(activeCall)]);

  // Simulate subtle partner talking activity pulse for lively feel
  useEffect(() => {
    if (!activeCall || activeCall.status !== 'connected') return;
    const interval = setInterval(() => {
      setPartnerTalking(Math.random() > 0.35);
    }, 1800);
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  if (!activeCall) return null;

  const { partner, type, status, durationSeconds, isMuted, isVideoOff, isSpeakerOn, isMinimized, reactions } =
    activeCall;

  // Format seconds to mm:ss
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendReaction = (emoji: string) => {
    triggerHaptic('light');
    callSounds.playReactionPop();
    sendCallReaction(emoji);
    setShowEmojiPicker(false);
  };

  // Minimized Picture-in-Picture floating badge
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 p-2 bg-[#1A1D20]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setMinimizeCall(false);
          }}
          className="flex items-center gap-2 text-left cursor-pointer group"
          title="Tap to expand call"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/30 shrink-0">
            <img
              src={partner.photos[0]}
              alt={partner.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {status === 'connected' && (
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#00B894] ring-2 ring-black animate-pulse" />
            )}
          </div>
          <div className="pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-[#6C5CE7] transition-colors">
                {partner.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white font-mono">
                {status === 'connected' ? formatDuration(durationSeconds) : 'Connecting...'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
              {type === 'video' ? <Video className="w-2.5 h-2.5 text-[#FD79A8]" /> : <Phone className="w-2.5 h-2.5 text-[#00B894]" />}
              <span>{type === 'video' ? 'Video Call' : 'Audio Call'}</span>
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 pl-1 border-l border-white/10">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              toggleCallMute();
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setMinimizeCall(false);
            }}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Full Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('warning');
              endCall();
            }}
            className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Screen Call Modal View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full h-full max-w-md mx-auto bg-gradient-to-b from-[#1E202A] via-[#12131A] to-[#0A0B0E] text-white flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Floating animated in-call emoji reactions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
          {reactions.map((r) => (
            <div
              key={r.id}
              style={{ left: `${r.x}%` }}
              className="absolute bottom-24 text-3xl animate-bounce-slow transform transition-all duration-1000 -translate-y-80 opacity-0 animate-in fade-in"
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Top Floating App Bar */}
        <div className="relative z-30 pt-6 px-4 pb-2 flex items-center justify-between">
          {/* Encryption / Quality Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] text-zinc-300 font-medium">
            <Lock className="w-3 h-3 text-[#00B894]" />
            <span>End-to-End Encrypted</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Minimize button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setMinimizeCall(true);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors cursor-pointer"
              title="Minimize to Picture-in-Picture"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Call Background or Partner Feed */}
        {type === 'video' ? (
          <div className="absolute inset-0 z-10 overflow-hidden">
            {/* Partner Video Background Feed */}
            <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center">
              <img
                src={partner.photos[0]}
                alt={partner.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  partnerTalking ? 'scale-[1.02] brightness-105' : 'scale-100 brightness-95'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50" />

              {/* Live Audio Activity Wave on Partner Feed */}
              {status === 'connected' && partnerTalking && (
                <div className="absolute top-16 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#00B894] animate-ping" />
                  <span className="text-[10px] text-zinc-200 font-medium">{partner.name} speaking</span>
                </div>
              )}
            </div>

            {/* Local Camera Floating PiP in corner */}
            <div className="absolute top-16 right-4 z-20 w-28 h-38 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-zinc-900 flex flex-col justify-between group">
              {isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-400 p-2 text-center">
                  <VideoOff className="w-6 h-6 mb-1 text-zinc-500" />
                  <span className="text-[9px] font-bold">Camera Off</span>
                </div>
              ) : (
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  {!hasCameraPermission && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-zinc-300 p-1 text-center">
                      <div className="w-8 h-8 rounded-full bg-[#6C5CE7] flex items-center justify-center font-bold text-white text-xs mb-1">
                        You
                      </div>
                      <span className="text-[9px]">Camera Active</span>
                    </div>
                  )}
                </>
              )}

              {/* PiP Overlay Badge */}
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-white font-semibold">
                You
              </div>
            </div>
          </div>
        ) : (
          /* Audio Call Visualizer / Avatar Display */
          <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6">
            {/* Glowing Pulse Wave Rings */}
            <div className="relative flex items-center justify-center mb-8">
              {status === 'connected' && (
                <>
                  <div
                    className={`absolute rounded-full border border-[#6C5CE7]/30 transition-all duration-700 ${
                      partnerTalking ? 'w-56 h-56 scale-110 opacity-70 animate-ping' : 'w-48 h-48 opacity-20'
                    }`}
                  />
                  <div
                    className={`absolute rounded-full bg-gradient-to-tr from-[#6C5CE7]/20 to-[#FD79A8]/20 blur-xl transition-all duration-500 ${
                      partnerTalking ? 'w-52 h-52 scale-125' : 'w-40 h-40 scale-100'
                    }`}
                  />
                </>
              )}

              {/* Partner Avatar with HD ring */}
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white/30 shadow-[0_0_35px_rgba(108,92,231,0.5)]">
                <img
                  src={partner.photos[0]}
                  alt={partner.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Verification & Audio status badge */}
              {partner.isVerified && (
                <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#00B894] text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3 h-3" />
                  <span>VERIFIED</span>
                </div>
              )}
            </div>

            {/* Audio Wave Visualizer Bars */}
            {status === 'connected' && (
              <div className="flex items-center gap-1.5 h-10 mb-4">
                {[0.4, 0.7, 0.9, 0.6, 0.8, 1, 0.5, 0.85, 0.4].map((height, i) => (
                  <span
                    key={i}
                    style={{
                      height: partnerTalking ? `${Math.max(12, height * 38)}px` : '8px',
                      transitionDuration: '250ms',
                    }}
                    className={`w-1 rounded-full transition-all ${
                      i % 2 === 0 ? 'bg-[#6C5CE7]' : 'bg-[#FD79A8]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Partner Info and Call Status */}
        <div className="relative z-30 text-center px-4 mb-3">
          <h2 className="text-xl font-black text-white flex items-center justify-center gap-1.5 drop-shadow-md">
            <span>{partner.name}</span>
            <span className="text-base text-zinc-400 font-normal">, {partner.age}</span>
          </h2>
          <p className="text-xs text-zinc-300 font-medium mt-0.5 drop-shadow-sm">{partner.occupation}</p>

          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {status === 'outgoing' ? (
              <span className="text-xs text-[#FD79A8] font-bold animate-pulse flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Calling {partner.name}...</span>
              </span>
            ) : status === 'connected' ? (
              <span className="text-xs text-[#00B894] font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
                <span>{formatDuration(durationSeconds)}</span>
              </span>
            ) : (
              <span className="text-xs text-red-400 font-bold">Call Ended</span>
            )}
          </div>
        </div>

        {/* Emoji Reactions Tray Popup */}
        {showEmojiPicker && (
          <div className="relative z-30 mx-auto mb-2 p-2 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/20 flex items-center gap-2 shadow-2xl animate-in zoom-in-95 duration-150">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSendReaction(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* In-Call Controls Bottom Dock */}
        <div className="relative z-30 pb-10 pt-4 px-6 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="flex items-center justify-around max-w-sm mx-auto">
            {/* Microphone Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                toggleCallMute();
              }}
              className={`w-13 h-13 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg ${
                isMuted
                  ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                  : 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-[9px] mt-0.5 font-bold">{isMuted ? 'Muted' : 'Mic'}</span>
            </button>

            {/* Video Toggle (if video call) */}
            {type === 'video' ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  toggleCallVideo();
                }}
                className={`w-13 h-13 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isVideoOff
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                    : 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                <span className="text-[9px] mt-0.5 font-bold">{isVideoOff ? 'Off' : 'Video'}</span>
              </button>
            ) : (
              /* Speakerphone Toggle for audio call */
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  toggleCallSpeaker();
                }}
                className={`w-13 h-13 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isSpeakerOn
                    ? 'bg-[#6C5CE7] border-2 border-[#6C5CE7] text-white'
                    : 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
                }`}
                title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="text-[9px] mt-0.5 font-bold">{isSpeakerOn ? 'Speaker' : 'Ear'}</span>
              </button>
            )}

            {/* Flip Camera (if video) or Quick Emoji Reaction */}
            {type === 'video' ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  toggleCallCameraFront();
                }}
                className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Flip Camera"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 font-bold">Flip</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg"
                title="React with Emoji"
              >
                <Smile className="w-5 h-5 text-[#FD79A8]" />
                <span className="text-[9px] mt-0.5 font-bold">React</span>
              </button>
            )}

            {/* Emoji Reaction button for video call */}
            {type === 'video' && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg"
                title="React with Emoji"
              >
                <Smile className="w-5 h-5 text-[#FD79A8]" />
                <span className="text-[9px] mt-0.5 font-bold">React</span>
              </button>
            )}

            {/* Big Red Hang Up / End Call Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('warning');
                endCall();
              }}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all cursor-pointer"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

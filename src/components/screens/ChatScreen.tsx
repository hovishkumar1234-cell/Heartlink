import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  MoreVertical,
  Send,
  Shield,
  UserX,
  Flag,
  Sparkles,
  Check,
  CheckCheck,
  MapPin,
  Image as ImageIcon,
  Heart,
  Smile,
  X,
  Briefcase,
  Gamepad2,
  Compass,
  Shuffle,
  Camera,
  Flame,
  Clock,
  Eye,
  Coffee,
  Share2,
  HeartHandshake,
  Calendar,
  Phone,
  Video,
  PhoneIncoming,
  PhoneMissed,
  PhoneCall,
} from 'lucide-react';
import { MessageReaction, AiWingmanPrompt, SelfDestructSnap } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ReportUserModal } from '../common/ReportUserModal';
import { MiniGameCard } from '../chat/MiniGameCard';
import { MiniGameModal } from '../chat/MiniGameModal';
import { AiWingmanDrawer } from '../chat/AiWingmanDrawer';
import { VoiceNotePlayer } from '../chat/VoiceNotePlayer';
import { HoldToRecordButton } from '../chat/HoldToRecordButton';
import { KarmaBadgeStrip } from '../common/KarmaBadgeStrip';
import { ScheduleDateModal } from '../chat/ScheduleDateModal';
import { MoveToSocialsModal } from '../chat/MoveToSocialsModal';
import { PoliteDepartureModal } from '../chat/PoliteDepartureModal';
import { DisappearingSnapCreatorModal } from '../snaps/DisappearingSnapCreatorModal';
import { DisappearingSnapModal } from '../snaps/DisappearingSnapModal';
import { ARLensChallengeModal } from '../snaps/ARLensChallengeModal';
import { generateLocalWingmanPrompts, fetchAiWingmanPrompts, getMutualInterests } from '../../utils/aiWingman';

const QUICK_REACTIONS = ['❤️', '😂', '🔥', '😮', '👏', '🥺', '✨', '🥂'];

export const ChatScreen: React.FC = () => {
  const {
    currentUser,
    users,
    matches,
    messages,
    activeChatMatchId,
    setActiveScreen,
    setActiveChatMatchId,
    sendMessage,
    sendVoiceMessage,
    sendMiniGame,
    respondToMiniGame,
    reactToMessage,
    markMessagesAsRead,
    unmatchUser,
    blockUser,
    reportUser,
    showToast,
    typingMatchIds,
    arLensChallenge,
    startARLensChallenge,
    startCall,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showPartnerProfile, setShowPartnerProfile] = useState(false);
  const [showMiniGameModal, setShowMiniGameModal] = useState(false);
  const [showWingmanDrawer, setShowWingmanDrawer] = useState(false);
  const [showSnapCreatorModal, setShowSnapCreatorModal] = useState(false);
  const [activeViewingSnap, setActiveViewingSnap] = useState<SelfDestructSnap | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [showDepartureModal, setShowDepartureModal] = useState(false);
  const [wingmanPrompts, setWingmanPrompts] = useState<AiWingmanPrompt[]>([]);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  // Emoji Reactions State
  const [activeReactionMenuMsgId, setActiveReactionMenuMsgId] = useState<string | null>(null);
  const [heartBurstMsgId, setHeartBurstMsgId] = useState<string | null>(null);
  const lastTapRef = useRef<{ [msgId: string]: number }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close emoji popover on global click
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveReactionMenuMsgId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const activeMatch = matches.find((m) => m.id === activeChatMatchId);
  const partnerId = activeMatch
    ? activeMatch.userId1 === currentUser?.id
      ? activeMatch.userId2
      : activeMatch.userId1
    : null;
  const partner = users.find((u) => u.id === partnerId);

  // Live real-time typing status of the partner
  const isPartnerTyping = activeMatch ? typingMatchIds.includes(activeMatch.id) : false;

  // Filter messages belonging to this match
  const conversationMessages = messages.filter((m) => m.matchId === activeChatMatchId);

  // Auto-scroll to bottom when messages change or partner starts typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, isPartnerTyping]);

  // Mark incoming messages as read upon viewing the chat
  useEffect(() => {
    if (activeChatMatchId) {
      markMessagesAsRead(activeChatMatchId);
    }
  }, [activeChatMatchId, conversationMessages.length]);

  // Load contextual AI Wingman conversation prompts based on mutual interests
  useEffect(() => {
    if (currentUser && partner) {
      const initial = generateLocalWingmanPrompts(currentUser, partner);
      setWingmanPrompts(initial.topics);
      fetchAiWingmanPrompts(
        currentUser,
        partner,
        'mutual_sparks',
        conversationMessages.map((m) => m.text)
      ).then((res) => {
        if (res && res.topics?.length > 0) {
          setWingmanPrompts(res.topics);
        }
      });
    }
  }, [currentUser?.id, partner?.id]);

  const mutualInterests = currentUser && partner ? getMutualInterests(currentUser, partner) : [];

  if (!currentUser || !activeMatch || !partner) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-zinc-400 text-sm mb-4">Conversation not found or has been closed.</p>
        <button
          onClick={() => setActiveScreen('matches')}
          className="px-4 py-2 rounded-xl bg-[#00FF66] text-black font-semibold text-xs"
        >
          Back to Matches
        </button>
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    sendMessage(activeMatch.id, textToSend.trim());
    setInputText('');
  };

  const handleUnmatch = () => {
    if (confirm(`Are you sure you want to unmatch ${partner.name}? This cannot be undone.`)) {
      unmatchUser(partner.id);
      setShowMenu(false);
    }
  };

  const handleBlock = () => {
    if (confirm(`Block ${partner.name}? They will not be able to contact you or see your profile.`)) {
      blockUser(partner.id);
      setShowMenu(false);
    }
  };



  const handleDoubleTap = (msgId: string) => {
    reactToMessage(msgId, '❤️');
    setHeartBurstMsgId(msgId);
    setTimeout(() => {
      setHeartBurstMsgId((curr) => (curr === msgId ? null : curr));
    }, 750);
  };

  const handleTouchEnd = (e: React.TouchEvent, msgId: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[msgId] || 0;
    if (now - lastTap < 320) {
      e.preventDefault();
      handleDoubleTap(msgId);
      lastTapRef.current[msgId] = 0;
    } else {
      lastTapRef.current[msgId] = now;
    }
  };

  interface GroupedReaction {
    emoji: string;
    count: number;
    hasReacted: boolean;
    userNames: string[];
  }

  const getGroupedReactions = (reactions: MessageReaction[] = []): GroupedReaction[] => {
    const map = new Map<string, string[]>();
    for (const r of reactions) {
      if (!map.has(r.emoji)) {
        map.set(r.emoji, []);
      }
      map.get(r.emoji)!.push(r.userId);
    }

    return Array.from(map.entries()).map(([emoji, userIds]) => {
      const hasReacted = userIds.includes(currentUser.id);
      const userNames = userIds.map((uid) => {
        if (uid === currentUser.id) return 'You';
        if (uid === partner.id) return partner.name;
        return 'Someone';
      });

      return {
        emoji,
        count: userIds.length,
        hasReacted,
        userNames,
      };
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col max-w-md mx-auto bg-[#F8F9FA] border-x border-[#E9ECEF] shadow-xs">
      {/* Chat Top App Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E9ECEF] px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveChatMatchId(null);
              setActiveScreen('matches');
            }}
            className="p-1.5 -ml-1 text-[#636E72] hover:text-[#2D3436] rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Partner Avatar & Live Header Info */}
          <button
            type="button"
            onClick={() => setShowPartnerProfile(true)}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
            title={`View ${partner.name}'s profile`}
          >
            <div
              className={`relative w-10 h-10 rounded-full overflow-hidden bg-[#F1F2F6] border transition-all duration-300 ${
                isPartnerTyping
                  ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/40 shadow-[0_0_10px_rgba(108,92,231,0.3)]'
                  : 'border-[#E9ECEF] group-hover:border-[#6C5CE7]/60'
              }`}
            >
              <img
                src={partner.photos[0]}
                alt={partner.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#2D3436] truncate max-w-[130px] group-hover:text-[#6C5CE7] transition-colors">
                  {partner.name}
                </span>
                {partner.isVerified && (
                  <VerifiedBadge size="xs" userName={partner.name} />
                )}
              </div>
              <KarmaBadgeStrip
                score={partner.karmaScore || 96}
                badges={partner.karmaBadges}
                size="sm"
              />
            </div>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Audio Call Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              startCall(partner.id, 'audio');
            }}
            className="p-2 rounded-xl text-[#636E72] hover:text-[#00B894] hover:bg-[#00B894]/10 transition-all cursor-pointer"
            title={`Audio Call ${partner.name}`}
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              startCall(partner.id, 'video');
            }}
            className="p-2 rounded-xl text-[#636E72] hover:text-[#FD79A8] hover:bg-[#FD79A8]/10 transition-all cursor-pointer"
            title={`Video Call ${partner.name}`}
          >
            <Video className="w-4 h-4" />
          </button>

          {/* AI Wingman Prompt Launcher Button in Header (Secondary #FD79A8) */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowWingmanDrawer(true);
            }}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-[#FD79A8]/10 hover:bg-[#FD79A8]/20 border border-[#FD79A8]/30 text-[#FD79A8] transition-all text-xs font-bold shrink-0 cursor-pointer shadow-xs"
            title="Open AI Wingman for dynamic conversation starters"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">AI Wingman</span>
          </button>

          {/* Safety Actions Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-[#636E72] hover:text-[#2D3436] rounded-xl transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white border border-[#E9ECEF] shadow-xl p-1.5 z-40 text-xs">
                <button
                  onClick={() => {
                    setShowPartnerProfile(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#2D3436] hover:text-[#6C5CE7] hover:bg-[#F8F9FA] transition-colors cursor-pointer font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FD79A8]" />
                  <span>View Full Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    startCall(partner.id, 'audio');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#2D3436] hover:text-[#00B894] hover:bg-[#00B894]/10 transition-colors cursor-pointer font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-[#00B894]" />
                  <span>Audio Call</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    startCall(partner.id, 'video');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#2D3436] hover:text-[#FD79A8] hover:bg-[#FD79A8]/10 transition-colors cursor-pointer font-medium"
                >
                  <Video className="w-3.5 h-3.5 text-[#FD79A8]" />
                  <span>Video Call</span>
                </button>
                <button
                  onClick={() => {
                    setShowReportDialog(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#2D3436] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer font-medium"
                >
                  <Flag className="w-3.5 h-3.5 text-red-500" />
                  <span>Report {partner.name}</span>
                </button>
                <button
                  onClick={handleBlock}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#2D3436] hover:text-red-500 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Block User</span>
                </button>
                <button
                  onClick={handleUnmatch}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#2D3436] hover:text-[#636E72] hover:bg-[#F8F9FA] transition-colors font-medium cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Unmatch</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anti-Ghosting Slot Status & Progression Strip */}
      {activeMatch.slotStatus === 'graduated_date' ? (
        <div className="bg-[#00B894]/10 border-b border-[#00B894]/20 px-3.5 py-2 flex items-center justify-between text-xs text-[#00B894] z-20">
          <span className="flex items-center gap-1.5 font-bold">
            <Coffee className="w-4 h-4 text-[#00B894]" />
            <span>IRL Date Planned · Chat slot graduated (+8 Karma)</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00B894] text-white font-black uppercase">
            Graduated
          </span>
        </div>
      ) : activeMatch.slotStatus === 'graduated_socials' ? (
        <div className="bg-[#FD79A8]/10 border-b border-[#FD79A8]/20 px-3.5 py-2 flex items-center justify-between text-xs text-[#FD79A8] z-20">
          <span className="flex items-center gap-1.5 font-bold">
            <Share2 className="w-4 h-4 text-[#FD79A8]" />
            <span>Moved Off-App · Chat slot freed (+5 Karma)</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FD79A8] text-white font-black uppercase">
            Off-App
          </span>
        </div>
      ) : activeMatch.slotStatus === 'departed_politely' ? (
        <div className="bg-zinc-100 border-b border-[#E9ECEF] px-3.5 py-2 flex items-center justify-between text-xs text-[#636E72] z-20">
          <span className="flex items-center gap-1.5 font-bold">
            <HeartHandshake className="w-4 h-4 text-[#00B894]" />
            <span>Polite Departure · Chat closed with Zero-Ghost Karma</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00B894] text-white font-black uppercase">
            Closed
          </span>
        </div>
      ) : (
        <div className="bg-white border-b border-[#E9ECEF] px-3.5 py-2 flex items-center justify-between gap-1.5 text-xs shadow-2xs z-20">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
            <span className="text-[10px] font-black text-[#636E72] uppercase tracking-wider">
              Active Chat Slot:
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowDateModal(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 text-[#6C5CE7] text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              title="Plan an IRL date to graduate this slot"
            >
              <Coffee className="w-3 h-3" />
              <span>Plan Date</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowSocialsModal(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-[#FD79A8]/10 hover:bg-[#FD79A8]/20 text-[#FD79A8] text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              title="Exchange socials to graduate this chat off-app"
            >
              <Share2 className="w-3 h-3" />
              <span>Socials</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowDepartureModal(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-[#00B894]/10 hover:bg-[#00B894]/20 text-[#00B894] text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              title="Send a courteous 1-tap departure (+Karma)"
            >
              <HeartHandshake className="w-3 h-3" />
              <span>Depart (+Karma)</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Match Header Badge */}
        <div className="flex flex-col items-center justify-center my-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FD79A8]/15 border border-[#FD79A8]/30 flex items-center justify-center text-[#FD79A8] mb-2 shadow-xs">
            <Heart className="w-6 h-6 fill-[#FD79A8]" />
          </div>
          <p className="text-xs font-bold text-[#2D3436]">
            You matched with {partner.name}
          </p>
          <p className="text-[11px] text-[#636E72] max-w-xs mt-0.5">
            Goal: {partner.relationshipGoal.replace('-', ' ')} · Both verified on HeartLink
          </p>
        </div>

        {/* Interactive 2-Minute Game Prompt Banner (Skip awkward "Hey" openers) */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-3.5 mb-2 shadow-[0_4px_20px_rgba(108,92,231,0.06)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6C5CE7] tracking-wider uppercase flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Interactive 2-Min Mini-Games</span>
            </span>
            <span className="text-[10px] text-[#636E72] font-semibold">
              No awkward "Hey" 👋
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowMiniGameModal(true);
              }}
              className="py-2 px-2 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F2F6] border border-[#E9ECEF] text-left transition-all group cursor-pointer"
            >
              <span className="text-sm block mb-0.5">🎲</span>
              <span className="text-[10px] font-bold text-[#2D3436] group-hover:text-[#6C5CE7] block leading-tight">
                Two Truths & Lie
              </span>
              <span className="text-[9px] text-[#636E72] block truncate">Spot the lie</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowMiniGameModal(true);
              }}
              className="py-2 px-2 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F2F6] border border-[#E9ECEF] text-left transition-all group cursor-pointer"
            >
              <span className="text-sm block mb-0.5">🎧</span>
              <span className="text-[10px] font-bold text-[#2D3436] group-hover:text-[#6C5CE7] block leading-tight">
                Music Blind-Test
              </span>
              <span className="text-[9px] text-[#636E72] block truncate">Audio vibe check</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowMiniGameModal(true);
              }}
              className="py-2 px-2 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F2F6] border border-[#E9ECEF] text-left transition-all group cursor-pointer"
            >
              <span className="text-sm block mb-0.5">⚡</span>
              <span className="text-[10px] font-bold text-[#2D3436] group-hover:text-[#6C5CE7] block leading-tight">
                Quick Trivia
              </span>
              <span className="text-[9px] text-[#636E72] block truncate">Chemistry quiz</span>
            </button>
          </div>
        </div>

        {/* AI Wingman Dynamic Conversation Opener Box */}
        {conversationMessages.length < 3 && wingmanPrompts.length > 0 && (
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 mb-2 shadow-[0_4px_20px_rgba(108,92,231,0.06)] relative overflow-hidden animate-in fade-in duration-200">
            <div className="w-1 absolute left-0 inset-y-0 bg-[#FD79A8]" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#FD79A8] tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Wingman Dynamic Opener
              </span>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setActivePromptIndex((prev) => (prev + 1) % wingmanPrompts.length);
                }}
                className="text-[10px] text-[#636E72] hover:text-[#6C5CE7] flex items-center gap-1 font-bold transition-colors cursor-pointer"
                title="Shuffle dynamic topic"
              >
                <Shuffle className="w-3 h-3" />
                <span>Next ({activePromptIndex + 1}/{wingmanPrompts.length})</span>
              </button>
            </div>

            {/* Context Note */}
            <div className="text-[11px] text-[#00B894] font-bold mb-1.5 flex items-center gap-1">
              <span>✨</span>
              <span>{wingmanPrompts[activePromptIndex]?.context || 'Contextual conversation spark'}</span>
            </div>

            {/* The Suggested Opener Quote */}
            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-xs text-[#2D3436] leading-relaxed mb-3 font-medium">
              “{wingmanPrompts[activePromptIndex]?.suggestedOpener}”
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowWingmanDrawer(true);
                }}
                className="text-[11px] text-[#636E72] hover:text-[#6C5CE7] underline underline-offset-2 transition-colors cursor-pointer"
              >
                More coaching angles
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setInputText(wingmanPrompts[activePromptIndex].suggestedOpener);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#F1F2F6] border border-[#E9ECEF] text-xs text-[#636E72] hover:text-[#2D3436] font-medium transition-colors cursor-pointer"
                >
                  Edit In Bar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    handleSend(undefined, wingmanPrompts[activePromptIndex].suggestedOpener);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3 fill-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages bubbles */}
        {conversationMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const groupedReactions = getGroupedReactions(msg.reactions);
          const isMenuOpen = activeReactionMenuMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                isMe ? 'ml-auto' : 'mr-auto'
              } group`}
            >
              {/* Bubble and Action Row */}
              <div
                className={`relative flex items-end gap-1.5 ${
                  isMe ? 'flex-row justify-end' : 'flex-row-reverse justify-end'
                }`}
              >
                {/* Reaction Picker Popover Trigger Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReactionMenuMsgId(isMenuOpen ? null : msg.id);
                    }}
                    title="Add emoji reaction"
                    className="p-1 rounded-full text-zinc-400 hover:text-[#00FF66] hover:bg-white/10 opacity-70 group-hover:opacity-100 transition-all cursor-pointer focus:outline-none"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  {/* Floating Emoji Reaction Bar */}
                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute bottom-full mb-2 z-50 flex items-center gap-1 p-1.5 rounded-full bg-[#121219]/95 backdrop-blur-md border border-[#00FF66]/40 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,102,0.25)] animate-in fade-in zoom-in-95 duration-150 ${
                        isMe ? 'right-0' : 'left-0'
                      }`}
                    >
                      {QUICK_REACTIONS.map((emoji) => {
                        const hasReacted = msg.reactions?.some(
                          (r) => r.emoji === emoji && r.userId === currentUser.id
                        );
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              reactToMessage(msg.id, emoji);
                              setActiveReactionMenuMsgId(null);
                            }}
                            title={`React with ${emoji}`}
                            className={`w-7 h-7 flex items-center justify-center text-base rounded-full hover:scale-125 active:scale-95 transition-all hover:bg-white/10 cursor-pointer ${
                              hasReacted ? 'bg-[#00FF66]/20 ring-1 ring-[#00FF66]' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message Bubble: Voice Note, Interactive Mini-Game Card, or Text */}
                {msg.attachmentType === 'voice' ? (
                  <div
                    onDoubleClick={() => handleDoubleTap(msg.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, msg.id)}
                    title="Double tap to react ❤️"
                    className="relative"
                  >
                    <VoiceNotePlayer
                      audioUrl={msg.attachmentUrl}
                      duration={msg.voiceDuration}
                      waveform={msg.voiceWaveform}
                      isMe={isMe}
                    />

                    {/* Fleeting Heart Burst Overlay on double tap */}
                    {heartBurstMsgId === msg.id && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden rounded-2xl">
                        <span className="text-2xl animate-ping drop-shadow-[0_0_12px_rgba(253,121,168,0.9)]">
                          ❤️
                        </span>
                      </div>
                    )}
                  </div>
                ) : msg.attachmentType === 'minigame' && msg.gameData ? (
                  <div className="flex flex-col gap-1.5 w-full">
                    {msg.text && (
                      <div
                        className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#6C5CE7]/15 text-[#2D3436] font-medium border border-[#6C5CE7]/30 rounded-br-xs self-end'
                            : 'bg-white text-[#2D3436] rounded-bl-xs border border-[#E9ECEF] shadow-xs self-start'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                    <MiniGameCard
                      message={msg}
                      currentUserId={currentUser.id}
                      partnerName={partner.name}
                      onRespond={(id, res) => respondToMiniGame(id, res)}
                      onOpenGamesModal={() => setShowMiniGameModal(true)}
                    />
                  </div>
                ) : msg.attachmentType === 'snap' && msg.snapData ? (
                  <div className="flex flex-col gap-1 w-full max-w-[260px]">
                    {msg.snapData.hasExpired ? (
                      <div
                        className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                          isMe
                            ? 'bg-zinc-100 border-[#E9ECEF] text-[#636E72] rounded-br-xs'
                            : 'bg-white border-[#E9ECEF] text-[#636E72] rounded-bl-xs'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-[#2D3436] text-[11px] truncate">Snap Vanished 🔥</p>
                          <p className="text-[10px] text-[#636E72]">Media self-destructed</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setActiveViewingSnap(msg.snapData!);
                        }}
                        className={`p-3 rounded-2xl border text-left text-xs flex items-center gap-2.5 transition-all cursor-pointer group shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-[#6C5CE7]/15 to-[#FD79A8]/15 border-[#6C5CE7]/30 hover:border-[#6C5CE7] rounded-br-xs'
                            : 'bg-gradient-to-r from-[#FD79A8]/15 to-[#6C5CE7]/15 border-[#FD79A8]/30 hover:border-[#FD79A8] rounded-bl-xs'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                          <Flame className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="font-black text-[#2D3436] text-[11px] flex items-center gap-1">
                            <span>Tap to View Snap</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-[#FD79A8] text-white text-[8px] font-extrabold uppercase">
                              {msg.snapData.viewDurationSeconds}s
                            </span>
                          </p>
                          <p className="text-[10px] text-[#636E72] truncate">
                            {msg.snapData.caption || 'Self-destructing photo doodle'}
                          </p>
                        </div>
                        <Eye className="w-4 h-4 text-[#6C5CE7] group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    )}
                  </div>
                ) : msg.attachmentType === 'ar_challenge' ? (
                  <div className="flex flex-col gap-1 w-full max-w-[270px]">
                    <div
                      className={`p-3.5 rounded-2xl border text-left flex flex-col gap-2 ${
                        isMe
                          ? 'bg-[#6C5CE7]/10 border-[#6C5CE7]/30 rounded-br-xs'
                          : 'bg-white border-[#E9ECEF] rounded-bl-xs shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] flex items-center justify-center text-white">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#2D3436]">AR Lens Challenge</p>
                          <p className="text-[10px] text-[#636E72]">Multiplayer "This or That" 👈👉</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          startARLensChallenge(partner.id, 'this_or_that');
                        }}
                        className="w-full py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#4834D4] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Play AR Challenge</span>
                      </button>
                    </div>
                  </div>
                ) : msg.attachmentType === 'irl_date' ? (
                  <div className="p-3.5 rounded-2xl bg-white border border-[#00B894]/30 shadow-xs flex flex-col gap-2 max-w-[280px]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#00B894]/15 flex items-center justify-center text-[#00B894]">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#2D3436]">IRL Date Scheduled! ☕</p>
                        <p className="text-[10px] text-[#00B894] font-bold">+8 Karma Awarded</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#2D3436] font-medium leading-relaxed">{msg.text}</p>
                    <div className="flex items-center gap-1 text-[10px] text-[#636E72] pt-1.5 border-t border-[#E9ECEF]">
                      <Calendar className="w-3 h-3 text-[#6C5CE7]" />
                      <span>Active chat slot graduated</span>
                    </div>
                  </div>
                ) : msg.attachmentType === 'social_exchange' ? (
                  <div className="p-3.5 rounded-2xl bg-white border border-[#FD79A8]/30 shadow-xs flex flex-col gap-2 max-w-[280px]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FD79A8]/15 flex items-center justify-center text-[#FD79A8]">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#2D3436]">Off-App Socials Exchanged 📲</p>
                        <p className="text-[10px] text-[#FD79A8] font-bold">+5 Karma Awarded</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#2D3436] font-medium leading-relaxed">{msg.text}</p>
                    <div className="flex items-center gap-1 text-[10px] text-[#636E72] pt-1.5 border-t border-[#E9ECEF]">
                      <span>Chat slot graduated</span>
                    </div>
                  </div>
                ) : msg.attachmentType === 'polite_departure' ? (
                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] shadow-xs flex flex-col gap-2 max-w-[280px]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#00B894]/15 flex items-center justify-center text-[#00B894]">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#2D3436]">Courteous 1-Tap Departure 💌</p>
                        <p className="text-[10px] text-[#00B894] font-bold">Zero-Ghosting Karma Awarded</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#2D3436] font-medium leading-relaxed">{msg.text}</p>
                    <div className="flex items-center gap-1 text-[10px] text-[#636E72] pt-1.5 border-t border-[#E9ECEF]">
                      <span>Chat concluded respectfully</span>
                    </div>
                  </div>
                ) : msg.attachmentType === 'call_log' ? (
                  <div
                    className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between gap-3 max-w-[280px] ${
                      isMe
                        ? 'bg-white border-[#E9ECEF] rounded-br-xs'
                        : 'bg-white border-[#E9ECEF] rounded-bl-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          msg.callLog?.status === 'missed'
                            ? 'bg-red-50 text-red-500'
                            : msg.callLog?.type === 'video'
                            ? 'bg-[#FD79A8]/15 text-[#FD79A8]'
                            : 'bg-[#00B894]/15 text-[#00B894]'
                        }`}
                      >
                        {msg.callLog?.status === 'missed' ? (
                          <PhoneMissed className="w-4 h-4" />
                        ) : msg.callLog?.type === 'video' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <Phone className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2D3436]">
                          {msg.callLog?.type === 'video' ? 'Video Call' : 'Audio Call'}
                        </p>
                        <p className="text-[10px] text-[#636E72]">
                          {msg.callLog?.status === 'missed'
                            ? 'Missed call'
                            : msg.callLog && msg.callLog.durationSeconds > 0
                            ? `${Math.floor(msg.callLog.durationSeconds / 60)}m ${msg.callLog.durationSeconds % 60}s`
                            : msg.text}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        startCall(partner.id, msg.callLog?.type || 'audio');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 text-[#6C5CE7] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      title="Call back"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call Back</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onDoubleClick={() => handleDoubleTap(msg.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, msg.id)}
                    title="Double tap to react ❤️"
                    className={`relative p-3.5 rounded-2xl text-xs leading-relaxed select-none transition-shadow ${
                      isMe
                        ? 'bg-[#6C5CE7] text-white font-medium rounded-br-xs shadow-[0_4px_16px_rgba(108,92,231,0.22)]'
                        : 'bg-white text-[#2D3436] rounded-bl-xs border border-[#E9ECEF] shadow-[0_4px_16px_rgba(108,92,231,0.06)]'
                    }`}
                  >
                    {msg.text}

                    {/* Fleeting Heart Burst Overlay on double tap */}
                    {heartBurstMsgId === msg.id && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden rounded-2xl">
                        <span className="text-2xl animate-ping drop-shadow-[0_0_12px_rgba(253,121,168,0.9)]">
                          ❤️
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Emoji Reaction Badges Pill Strip */}
              {groupedReactions.length > 0 && (
                <div
                  className={`flex flex-wrap items-center gap-1 mt-1 ${
                    isMe ? 'justify-end pr-1' : 'justify-start pl-1'
                  }`}
                >
                  {groupedReactions.map((item) => (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reactToMessage(msg.id, item.emoji);
                      }}
                      title={`${item.userNames.join(', ')} · Click to ${
                        item.hasReacted ? 'remove' : 'add'
                      }`}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs transition-all cursor-pointer select-none active:scale-95 ${
                        item.hasReacted
                          ? 'bg-[#6C5CE7]/15 border border-[#6C5CE7] text-[#6C5CE7] shadow-xs font-bold'
                          : 'bg-white border border-[#E9ECEF] text-[#636E72] hover:border-[#6C5CE7]/40 hover:text-[#2D3436]'
                      }`}
                    >
                      <span className="text-xs leading-none">{item.emoji}</span>
                      <span className="text-[10px] font-bold tabular-nums">{item.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp & Status (Read Receipts) */}
              <div className="flex items-center gap-1 mt-1 text-[9px] text-[#636E72] px-1 font-medium">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {isMe && (
                  <span
                    className="inline-flex items-center"
                    title={
                      msg.isRead || msg.status === 'read'
                        ? 'Read · Seen by recipient'
                        : 'Sent'
                    }
                  >
                    {msg.isRead || msg.status === 'read' ? (
                      <CheckCheck
                        className="w-3.5 h-3.5 text-[#00B894] inline ml-0.5 animate-in fade-in zoom-in-75 duration-200"
                        aria-label="Seen by recipient"
                      />
                    ) : (
                      <Check
                        className="w-3 h-3 text-[#636E72] inline ml-0.5"
                        aria-label="Sent"
                      />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Partner Typing Bubble in message thread */}
        {isPartnerTyping && (
          <div className="flex flex-col items-start mr-auto max-w-[85%] animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="py-2.5 px-3.5 rounded-2xl rounded-bl-xs bg-white border border-[#E9ECEF] flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-bounce" />
            </div>
            <span className="text-[9px] text-[#6C5CE7] mt-1 px-1 font-bold">
              {partner.name} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bottom Bar */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-16 sm:bottom-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#E9ECEF] shadow-[0_-4px_20px_rgba(108,92,231,0.06)] flex items-center gap-2"
      >
        {/* AI Wingman Prompt Launcher Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setShowWingmanDrawer(true);
          }}
          className="w-10 h-10 rounded-xl bg-[#FD79A8]/10 hover:bg-[#FD79A8]/20 border border-[#FD79A8]/30 text-[#FD79A8] font-bold flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 group shadow-xs"
          title={`Ask AI Wingman for contextual topics with ${partner.name}`}
          aria-label="AI Wingman Prompts"
        >
          <Sparkles className="w-4 h-4 group-hover:scale-110 animate-pulse transition-transform" />
        </button>

        {/* Interactive 2-Min Mini-Game Launcher Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setShowMiniGameModal(true);
          }}
          className="w-10 h-10 rounded-xl bg-[#F8F9FA] hover:bg-[#EDE9FE] border border-[#E9ECEF] hover:border-[#6C5CE7]/50 text-[#6C5CE7] font-bold flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 group shadow-xs"
          title={`Play 2-Min Mini-Game with ${partner.name}`}
          aria-label="Play 2-Min Mini-Game"
        >
          <Gamepad2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>

        {/* Send Self-Destructing Snap Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setShowSnapCreatorModal(true);
          }}
          className="w-10 h-10 rounded-xl bg-[#FD79A8]/10 hover:bg-[#FD79A8]/20 border border-[#FD79A8]/30 text-[#FD79A8] font-bold flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 group shadow-xs"
          title={`Send disappearing snap to ${partner.name}`}
          aria-label="Send Disappearing Snap"
        >
          <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${partner.name}...`}
          className="flex-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3.5 py-2.5 text-xs text-[#2D3436] placeholder-[#636E72]/70 focus:outline-none focus:border-[#6C5CE7] transition-colors"
        />

        {/* Hold to Record Voice Note Button (MediaRecorder API) */}
        <HoldToRecordButton
          onSendVoice={(audioUrl, duration, waveform) => {
            sendVoiceMessage(activeMatch.id, audioUrl, duration, waveform);
          }}
        />

        {inputText.trim() ? (
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-bold flex items-center justify-center shadow-[0_4px_16px_rgba(108,92,231,0.3)] transition-all shrink-0 active:scale-95 animate-in fade-in zoom-in-95 duration-150 cursor-pointer"
            title="Send text message"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : null}
      </form>

      {/* Individual Partner Profile View Modal */}
      {showPartnerProfile && partner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9ECEF] w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto p-5 sm:p-6 shadow-[0_20px_60px_rgba(108,92,231,0.2)] flex flex-col">
            {/* Grab handle on mobile */}
            <div className="w-10 h-1 bg-[#E9ECEF] rounded-full mx-auto mb-3" />

            {/* Profile Header Row with discreet Report button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B894] ring-2 ring-[#00B894]/20" title="Online now" />
                <h3 className="text-xl font-bold text-[#2D3436]">
                  {partner.name}, <span className="tabular-nums font-semibold">{partner.age}</span>
                </h3>
                {partner.isVerified && (
                  <VerifiedBadge size="md" userName={partner.name} />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Discreet Report User button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowReportDialog(true);
                  }}
                  className="p-1.5 text-[#636E72] hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title={`Report ${partner.name}`}
                  aria-label={`Report ${partner.name}`}
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPartnerProfile(false)}
                  className="p-1.5 text-[#636E72] hover:text-[#2D3436] rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Photo */}
            <div className="rounded-2xl overflow-hidden aspect-[4/5] border border-[#E9ECEF] mb-4 bg-[#F1F2F6] shadow-xs">
              <img
                src={partner.photos[0]}
                alt={partner.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Unboxed details strip */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#636E72] pb-3 border-b border-[#E9ECEF] mb-4">
              <span>{partner.occupation}</span>
              <span aria-hidden="true">·</span>
              <span>{partner.location.city}</span>
              <span aria-hidden="true">·</span>
              <span>Goal: {partner.relationshipGoal.replace('-', ' ')}</span>
              {partner.height && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{partner.height}</span>
                </>
              )}
            </div>

            {/* About Bio */}
            {partner.bio && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider mb-1.5">About</h4>
                <p className="text-xs text-[#2D3436] leading-relaxed">{partner.bio}</p>
              </div>
            )}

            {/* Prompts list with Secondary #FD79A8 accent */}
            {partner.prompts && partner.prompts.length > 0 && (
              <div className="space-y-3 mb-4">
                {partner.prompts.map((p, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
                    <p className="text-xs font-bold text-[#FD79A8] mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{p.question}</span>
                    </p>
                    <p className="text-xs font-medium text-[#2D3436] leading-relaxed">{p.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Secondary Photos */}
            {partner.photos.slice(1).map((photo, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-[#E9ECEF] mb-3 aspect-[3/4] shadow-xs">
                <img
                  src={photo}
                  alt={`${partner.name} ${i + 2}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Discreet Report User link at bottom of profile */}
            <div className="pt-4 pb-2 text-center border-t border-[#E9ECEF] mt-2">
              <button
                type="button"
                onClick={() => setShowReportDialog(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#636E72] hover:text-red-500 py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report {partner.name}</span>
              </button>
              <p className="text-[10px] text-[#636E72]/80 mt-0.5">
                Reports are 100% confidential and reviewed by HeartLink moderation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Safety Report Modal */}
      <ReportUserModal
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetUser={partner}
        onSuccess={() => {
          setShowPartnerProfile(false);
          setActiveChatMatchId(null);
          setActiveScreen('matches');
        }}
      />

      {/* 2-Minute Mini-Game Launcher Modal */}
      <MiniGameModal
        isOpen={showMiniGameModal}
        onClose={() => setShowMiniGameModal(false)}
        partnerName={partner.name}
        onLaunchGame={(gameData, introText) => {
          sendMiniGame(activeMatch.id, gameData, introText);
        }}
      />

      {/* AI Wingman Contextual Conversation Drawer */}
      <AiWingmanDrawer
        isOpen={showWingmanDrawer}
        onClose={() => setShowWingmanDrawer(false)}
        currentUser={currentUser}
        partner={partner}
        recentMessages={conversationMessages.map((m) => m.text)}
        onSelectPrompt={(text, sendImmediately) => {
          if (sendImmediately) {
            handleSend(undefined, text);
          } else {
            setInputText(text);
          }
        }}
      />

      {/* Disappearing Snap Creator Modal */}
      <DisappearingSnapCreatorModal
        isOpen={showSnapCreatorModal}
        onClose={() => setShowSnapCreatorModal(false)}
        targetMatchId={activeMatch.id}
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

      {/* Schedule IRL Date Modal */}
      <ScheduleDateModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        matchId={activeMatch.id}
        partnerName={partner.name}
      />

      {/* Move to Socials Modal */}
      <MoveToSocialsModal
        isOpen={showSocialsModal}
        onClose={() => setShowSocialsModal(false)}
        matchId={activeMatch.id}
        partnerName={partner.name}
      />

      {/* Polite Departure Modal */}
      <PoliteDepartureModal
        isOpen={showDepartureModal}
        onClose={() => setShowDepartureModal(false)}
        matchId={activeMatch.id}
        partnerName={partner.name}
      />
    </div>
  );
};

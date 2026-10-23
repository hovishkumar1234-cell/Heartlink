import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KARMA_BADGE_DEFINITIONS } from '../../data/karmaData';
import { KarmaBadgeType, KarmaBadgeInfo } from '../../types';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Share2,
  HeartHandshake,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Award,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface BadgeProgressInfo {
  badge: KarmaBadgeInfo;
  isEarned: boolean;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
  remainingText: string;
  actionHint: string;
}

export const KarmaStatus: React.FC = () => {
  const {
    currentUser,
    userKarma,
    activeChatLimit,
    activeChatMatches,
    users,
    setActiveScreen,
    setActiveChatMatchId,
  } = useApp();

  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [selectedBadgeType, setSelectedBadgeType] = useState<KarmaBadgeType | null>(null);

  if (!currentUser) return null;

  const currentActiveCount = activeChatMatches.length;
  const isSlotsFull = currentActiveCount >= activeChatLimit;
  const remainingSlots = Math.max(0, activeChatLimit - currentActiveCount);

  // Compute tier details based on userKarma score
  const getTierInfo = (score: number) => {
    if (score >= 95) {
      return {
        name: 'Spotlight Emerald',
        color: '#00B894',
        bgLight: 'bg-emerald-500/10',
        borderCol: 'border-emerald-500/30',
        textCol: 'text-emerald-700',
        boost: '+25% Feed Boost',
      };
    }
    if (score >= 88) {
      return {
        name: 'Gold Standard',
        color: '#FDCB6E',
        bgLight: 'bg-amber-500/10',
        borderCol: 'border-amber-500/30',
        textCol: 'text-amber-800',
        boost: '+15% Feed Boost',
      };
    }
    if (score >= 80) {
      return {
        name: 'Rising Star',
        color: '#6C5CE7',
        bgLight: 'bg-[#6C5CE7]/10',
        borderCol: 'border-[#6C5CE7]/30',
        textCol: 'text-[#6C5CE7]',
        boost: '+10% Feed Boost',
      };
    }
    return {
      name: 'Building Karma',
      color: '#636E72',
      bgLight: 'bg-gray-500/10',
      borderCol: 'border-gray-300',
      textCol: 'text-gray-700',
      boost: 'Standard Visibility',
    };
  };

  const tier = getTierInfo(userKarma.score);

  // Calculate progress for each reputation badge
  const calculateAllBadgeProgress = (): BadgeProgressInfo[] => {
    const list: BadgeProgressInfo[] = [];

    // 1. Prompt Responder (< 20 min reply time, high response rate)
    const promptEarned = userKarma.badges.includes('prompt_responder');
    const promptTargetMinutes = 20;
    const promptCurrent = userKarma.avgResponseMinutes;
    const promptProgress = promptEarned
      ? 100
      : Math.min(100, Math.round((promptTargetMinutes / Math.max(1, promptCurrent)) * 100));
    list.push({
      badge: KARMA_BADGE_DEFINITIONS.prompt_responder,
      isEarned: promptEarned,
      currentValue: promptCurrent,
      targetValue: promptTargetMinutes,
      unit: 'min avg reply',
      progressPercent: promptProgress,
      remainingText: promptEarned
        ? 'Earned! Average reply under 20 mins'
        : `${promptCurrent}m average. Target is under 20 mins`,
      actionHint: 'Reply promptly to matches within 20 minutes to maintain this badge.',
    });

    // 2. Verified Show-Up (IRL dates completed)
    const showUpEarned = userKarma.badges.includes('verified_show_up');
    const showUpTarget = 5;
    const showUpCurrent = userKarma.irlDatesCompleted;
    const showUpProgress = showUpEarned
      ? 100
      : Math.min(100, Math.round((showUpCurrent / showUpTarget) * 100));
    const showUpRemaining = Math.max(0, showUpTarget - showUpCurrent);
    list.push({
      badge: KARMA_BADGE_DEFINITIONS.verified_show_up,
      isEarned: showUpEarned,
      currentValue: showUpCurrent,
      targetValue: showUpTarget,
      unit: 'dates attended',
      progressPercent: showUpProgress,
      remainingText: showUpEarned
        ? 'Earned! 100% Date Reliability'
        : `${showUpCurrent}/${showUpTarget} dates scheduled & completed (${showUpRemaining} more needed)`,
      actionHint: 'Plan and attend real-world meetups using the in-chat "Schedule Date" graduation.',
    });

    // 3. Zero-Ghost Karma (Polite departures instead of dangling chats)
    const ghostFreeEarned = userKarma.badges.includes('zero_ghost_karma');
    const ghostFreeTarget = 5;
    const ghostFreeCurrent = userKarma.politeDeparturesSent;
    const ghostFreeProgress = ghostFreeEarned
      ? 100
      : Math.min(100, Math.round((ghostFreeCurrent / ghostFreeTarget) * 100));
    const ghostFreeRemaining = Math.max(0, ghostFreeTarget - ghostFreeCurrent);
    list.push({
      badge: KARMA_BADGE_DEFINITIONS.zero_ghost_karma,
      isEarned: ghostFreeEarned,
      currentValue: ghostFreeCurrent,
      targetValue: ghostFreeTarget,
      unit: 'clean departures',
      progressPercent: ghostFreeProgress,
      remainingText: ghostFreeEarned
        ? 'Earned! Clean closures on every conversation'
        : `${ghostFreeCurrent}/${ghostFreeTarget} polite departures sent (${ghostFreeRemaining} more needed)`,
      actionHint: 'Send a respectful 1-tap departure message when someone is not a romantic fit.',
    });

    // 4. Intentional Dater (Ghost-free streak maintaining 3-chat limit)
    const intentionalEarned = userKarma.badges.includes('intentional_dater');
    const intentionalTarget = 21;
    const intentionalCurrent = userKarma.ghostFreeStreakDays;
    const intentionalProgress = intentionalEarned
      ? 100
      : Math.min(100, Math.round((intentionalCurrent / intentionalTarget) * 100));
    const intentionalRemaining = Math.max(0, intentionalTarget - intentionalCurrent);
    list.push({
      badge: KARMA_BADGE_DEFINITIONS.intentional_dater,
      isEarned: intentionalEarned,
      currentValue: intentionalCurrent,
      targetValue: intentionalTarget,
      unit: 'day streak',
      progressPercent: intentionalProgress,
      remainingText: intentionalEarned
        ? 'Earned! Focuses energy on max 3 active connections'
        : `${intentionalCurrent}/${intentionalTarget} day intentional streak (${intentionalRemaining} days left)`,
      actionHint: 'Keep active chats at or under 3 and never abandon a match unreplied.',
    });

    return list;
  };

  const allBadgesProgress = calculateAllBadgeProgress();

  // Find the NEXT reputation badge to unlock (first unearned, or closest to 100%)
  const unearnedBadges = allBadgesProgress.filter((b) => !b.isEarned);
  const nextBadge =
    unearnedBadges.length > 0
      ? unearnedBadges.sort((a, b) => b.progressPercent - a.progressPercent)[0]
      : null;

  // Currently focused badge in the preview card
  const activeFocusBadge =
    selectedBadgeType
      ? allBadgesProgress.find((b) => b.badge.type === selectedBadgeType) || nextBadge
      : nextBadge;

  const handleOpenChat = (matchId: string) => {
    triggerHaptic('light');
    setActiveChatMatchId(matchId);
    setActiveScreen('chat');
  };

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-3xl p-5 shadow-[0_8px_30px_rgba(108,92,231,0.07)] text-[#2D3436] space-y-5">
      {/* 1. Header: Anti-Ghosting Karma Engine & Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#2D3436] leading-tight flex items-center gap-1.5">
              <span>Anti-Ghosting Karma</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7]">
                Engine
              </span>
            </h3>
            <p className="text-[11px] text-[#636E72]">
              Reputation & intentional dating status
            </p>
          </div>
        </div>

        {/* Score & Tier Pill */}
        <div className="flex flex-col items-end">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-extrabold text-xs shadow-xs"
            style={{ backgroundColor: tier.color }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="tabular-nums">{userKarma.score}</span>
            <span className="text-[10px] opacity-90">/ 100</span>
          </div>
          <span className="text-[10px] font-bold text-[#00B894] mt-0.5">
            {tier.boost}
          </span>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-3 gap-2 bg-[#F8F9FA] p-2.5 rounded-2xl border border-[#E9ECEF]/80 text-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#636E72] flex items-center gap-1 font-medium">
            <Flame className="w-3 h-3 text-[#FD79A8]" /> Streak
          </span>
          <span className="text-xs font-bold text-[#2D3436] mt-0.5">
            {userKarma.ghostFreeStreakDays} Days
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-[#E9ECEF]">
          <span className="text-[10px] text-[#636E72] flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-[#00B894]" /> Avg Reply
          </span>
          <span className="text-xs font-bold text-[#2D3436] mt-0.5">
            ~{userKarma.avgResponseMinutes}m
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#636E72] flex items-center gap-1 font-medium">
            <Award className="w-3 h-3 text-[#6C5CE7]" /> Tier
          </span>
          <span className="text-xs font-bold text-[#6C5CE7] mt-0.5 truncate max-w-[85px]">
            {userKarma.tierName.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* 2. Active Chat Limit Status (out of 3) */}
      <div className="bg-gradient-to-br from-[#F8F9FA] to-white border border-[#E9ECEF] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#6C5CE7]" />
            <span className="text-xs font-bold text-[#2D3436]">Active Chat Limit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                isSlotsFull
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-200'
                  : 'bg-emerald-500/10 text-emerald-700 border border-emerald-200'
              }`}
            >
              {currentActiveCount} / {activeChatLimit} Slots Full
            </span>
          </div>
        </div>

        {/* Visual Slots Graphic */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: activeChatLimit }).map((_, index) => {
            const match = activeChatMatches[index];
            const partnerId =
              match?.userId1 === currentUser.id ? match?.userId2 : match?.userId1;
            const partnerUser = users.find((u) => u.id === partnerId);

            if (match && partnerUser) {
              return (
                <div
                  key={match.id}
                  onClick={() => handleOpenChat(match.id)}
                  className="group relative cursor-pointer bg-white border border-[#6C5CE7]/30 rounded-xl p-2.5 flex flex-col items-center text-center shadow-xs hover:border-[#6C5CE7] hover:shadow-md transition-all"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mb-1.5 ring-2 ring-[#6C5CE7]/30 group-hover:ring-[#6C5CE7] transition-all">
                    <img
                      src={partnerUser.photos[0]}
                      alt={partnerUser.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                  </div>
                  <span className="text-[11px] font-bold text-[#2D3436] truncate w-full">
                    {partnerUser.name}
                  </span>
                  <span className="text-[9px] font-semibold text-[#6C5CE7] mt-0.5">
                    Active Slot {index + 1}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={`empty_slot_${index}`}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveScreen('matches');
                }}
                className="cursor-pointer border-2 border-dashed border-[#E9ECEF] hover:border-[#6C5CE7]/50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center bg-[#F8F9FA]/60 hover:bg-[#6C5CE7]/5 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1">
                  <span className="text-sm font-bold">+</span>
                </div>
                <span className="text-[10px] font-bold text-[#00B894]">Available</span>
                <span className="text-[9px] text-[#636E72]">Slot {index + 1}</span>
              </div>
            );
          })}
        </div>

        {/* Slot status feedback helper message */}
        <div className="pt-1">
          {isSlotsFull ? (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-[11px] text-rose-800 leading-snug">
              <Info className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">All 3 active slots occupied. </span>
                To message someone new, graduate a slot by scheduling an IRL date (+8 Karma), exchanging socials (+5 Karma), or sending a polite 1-tap departure (+6 Karma).
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-[#636E72]">
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {remainingSlots} open slot{remainingSlots > 1 ? 's' : ''} available for genuine focus.
              </span>
              <button
                onClick={() => setActiveScreen('matches')}
                className="text-[11px] font-bold text-[#6C5CE7] hover:underline flex items-center gap-0.5"
              >
                Go to Chats <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Progress Toward Next Reputation Badge */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#FD79A8]" />
            <h4 className="text-xs font-bold text-[#2D3436]">
              {nextBadge ? 'Next Reputation Badge Progress' : 'Reputation Badges Mastered'}
            </h4>
          </div>
          {nextBadge && (
            <span className="text-[11px] font-black text-[#6C5CE7]">
              {nextBadge.progressPercent}% Completed
            </span>
          )}
        </div>

        {activeFocusBadge ? (
          <div className="bg-gradient-to-br from-[#6C5CE7]/5 via-[#FD79A8]/5 to-transparent border border-[#6C5CE7]/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white"
                  style={{ backgroundColor: `${activeFocusBadge.badge.color}20` }}
                >
                  <span>{activeFocusBadge.badge.emoji}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-black text-[#2D3436]">
                      {activeFocusBadge.badge.label}
                    </h5>
                    {activeFocusBadge.isEarned ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#636E72] mt-0.5 line-clamp-1">
                    {activeFocusBadge.badge.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#2D3436]">
                  {activeFocusBadge.remainingText}
                </span>
                <span className="font-black text-[#6C5CE7] tabular-nums">
                  {activeFocusBadge.progressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E9ECEF] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#6C5CE7] via-[#FD79A8] to-[#00B894]"
                  style={{ width: `${Math.max(8, activeFocusBadge.progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Action Guidance */}
            <div className="bg-white/90 border border-[#E9ECEF] rounded-xl p-2.5 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#2D3436] leading-relaxed">
                <span className="font-bold">Next Step: </span>
                {activeFocusBadge.actionHint}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
            <span className="text-2xl">🌟</span>
            <h5 className="text-xs font-bold text-emerald-900">All Reputation Badges Unlocked!</h5>
            <p className="text-[11px] text-emerald-700">
              You are an elite dater on HeartLink with maximum feed visibility and verified reliability.
            </p>
          </div>
        )}

        {/* 4. Badges Collection Grid */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider">
              Reputation Badges Showcase
            </span>
            <span className="text-[10px] font-semibold text-[#6C5CE7]">
              {userKarma.badges.length} of {allBadgesProgress.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {allBadgesProgress.map((item) => {
              const isSelected = selectedBadgeType === item.badge.type;
              return (
                <button
                  key={item.badge.type}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedBadgeType(isSelected ? null : item.badge.type);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    item.isEarned
                      ? isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white border-emerald-200 hover:border-emerald-300'
                      : isSelected
                      ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] ring-1 ring-[#6C5CE7]'
                      : 'bg-[#F8F9FA] border-[#E9ECEF] opacity-75 hover:opacity-100'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: `${item.badge.color}20` }}
                  >
                    <span>{item.badge.emoji}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#2D3436] truncate block">
                        {item.badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {item.isEarned ? (
                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Earned
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold text-amber-700">
                          {item.progressPercent}% · {item.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Collapsible: How Anti-Ghosting Karma Works */}
      <div className="border-t border-[#E9ECEF] pt-3">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsHowItWorksOpen(!isHowItWorksOpen);
          }}
          className="w-full flex items-center justify-between text-xs font-bold text-[#636E72] hover:text-[#2D3436] py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#6C5CE7]" />
            How the 3-Chat Limit & Badges Work
          </span>
          {isHowItWorksOpen ? (
            <ChevronUp className="w-4 h-4 text-[#636E72]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#636E72]" />
          )}
        </button>

        {isHowItWorksOpen && (
          <div className="mt-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-3.5 space-y-2.5 text-xs text-[#2D3436] animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#6C5CE7]/15 text-[#6C5CE7] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <p className="text-[11px] text-[#636E72]">
                <strong className="text-[#2D3436]">Max 3 Active Chats:</strong> No hoarding 50 dead conversations. Everyone gives and receives real conversational attention.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <p className="text-[11px] text-[#636E72]">
                <strong className="text-[#2D3436]">3 Slot Graduation Paths:</strong> To chat with someone new, graduate a slot via ☕ IRL Date (+8 Karma), 📲 Move to Socials (+5 Karma), or 🕊️ 1-Tap Polite Departure (+6 Karma).
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FD79A8]/20 text-[#FD79A8] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <p className="text-[11px] text-[#636E72]">
                <strong className="text-[#2D3436]">Karma Feed Boost:</strong> Members with Green-Flag reputation badges receive up to a <span className="font-bold text-[#00B894]">+25% algorithmic boost</span> on Discovery cards.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

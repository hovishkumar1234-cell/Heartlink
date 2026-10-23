import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VerifiedBadge } from '../common/VerifiedBadge';
import {
  Zap,
  Clock,
  Sparkles,
  Heart,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageCircle,
  Flame,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const RapidMatchView: React.FC = () => {
  const {
    currentUser,
    rapidMatch,
    startRapidMatch,
    answerRapidPrompt,
    sendRapidChatMessage,
    saveRapidMatch,
    closeRapidMatch,
    setActiveScreen,
    setActiveChatMatchId,
    matches,
  } = useApp();

  const [chatInput, setChatInput] = useState('');

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendRapidChatMessage(chatInput);
    setChatInput('');
  };

  // =========================================================================
  // VIEW: Idle / Daily Launcher
  // =========================================================================
  if (!rapidMatch) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#FD79A8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-[#6C5CE7]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FD79A8]/10 text-[#FD79A8] text-xs font-bold tracking-wide uppercase mb-4">
            <Zap className="w-3.5 h-3.5 fill-[#FD79A8]" />
            Daily 3-Minute Rapid Match
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436] tracking-tight">
            High-speed chemistry <span className="text-[#FD79A8]">countdown</span>
          </h2>
          <p className="text-sm text-[#636E72] mt-2 max-w-md mx-auto leading-relaxed">
            Get instantly paired with 1 high-compatibility match for a 3-minute rapid interaction.
            Answer 3 quick-fire vibe prompts, exchange quick notes, and mutually decide if you want
            to save the connection before it vanishes forever!
          </p>

          {/* Chemistry Highlights */}
          <div className="grid grid-cols-3 gap-3 my-6 max-w-md mx-auto text-left">
            <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
              <span className="text-base block mb-1">⏱️</span>
              <span className="text-xs font-extrabold text-[#2D3436] block">3 Minutes</span>
              <span className="text-[10px] text-[#636E72]">Fast & low pressure</span>
            </div>
            <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
              <span className="text-base block mb-1">🎯</span>
              <span className="text-xs font-extrabold text-[#2D3436] block">3 Prompts</span>
              <span className="text-[10px] text-[#636E72]">Synchronized reveals</span>
            </div>
            <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
              <span className="text-base block mb-1">💜</span>
              <span className="text-xs font-extrabold text-[#2D3436] block">Mutual Save</span>
              <span className="text-[10px] text-[#636E72]">Both must tap Save</span>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={startRapidMatch}
            className="w-full max-w-sm mx-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] text-white font-bold text-base shadow-[0_10px_25px_rgba(253,121,168,0.35)] hover:shadow-[0_12px_30px_rgba(253,121,168,0.5)] active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span>Join 3-Minute Rapid Match</span>
          </button>

          <p className="text-[11px] text-[#636E72] mt-4 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00B894]" />
            Active daily between 12 PM - 10 PM • 94% mutual connection rate
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Saved State (Success Celebration)
  // =========================================================================
  if (rapidMatch.status === 'saved') {
    const partner = rapidMatch.partner;
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(108,92,231,0.12)] border border-[#E9ECEF] text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-[#00B894]/10 text-[#00B894] flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-[#2D3436]">Connection Locked In! 🎉</h3>
        <p className="text-xs text-[#636E72] mt-1 max-w-xs">
          Both you and <span className="font-bold text-[#2D3436]">{partner.name}</span> chose to save
          each other before the countdown ended!
        </p>

        {/* Partner Card Preview */}
        <div className="w-full my-6 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center gap-3 text-left">
          <img
            src={partner.photos[0]}
            alt={partner.name}
            className="w-14 h-14 rounded-2xl object-cover border border-[#E9ECEF]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-[#2D3436]">
                {partner.name}, {partner.age}
              </span>
              {partner.isVerified && <VerifiedBadge size="sm" userName={partner.name} />}
            </div>
            <span className="text-xs text-[#636E72] block">{partner.occupation}</span>
            <span className="text-[11px] font-bold text-[#00B894] mt-0.5 block">
              ✨ Rapid Match Compatible
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              const match = matches.find(
                (m) =>
                  (m.userId1 === currentUser?.id && m.userId2 === partner.id) ||
                  (m.userId2 === currentUser?.id && m.userId1 === partner.id)
              );
              if (match) {
                setActiveChatMatchId(match.id);
                setActiveScreen('chat');
              }
              closeRapidMatch();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open Chat with {partner.name}</span>
          </button>

          <button
            onClick={closeRapidMatch}
            className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#636E72] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
          >
            Back to Live Hub
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Expired State (Timer Ran Out)
  // =========================================================================
  if (rapidMatch.status === 'expired') {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-[#2D3436]">Time’s Up!</h3>
        <p className="text-xs text-[#636E72] mt-1 max-w-xs">
          The 3-minute window has closed without both sides locking in a save. No hard feelings —
          rapid matching is all about spontaneity!
        </p>

        <button
          onClick={closeRapidMatch}
          className="mt-6 px-6 py-3 rounded-2xl bg-[#6C5CE7] text-white text-xs font-bold shadow-md hover:bg-[#4834D4] transition-all cursor-pointer"
        >
          Try Another Rapid Match
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Active 3-Minute Rapid Match
  // =========================================================================
  const partner = rapidMatch.partner;
  const currentPrompt = rapidMatch.prompts[rapidMatch.currentPromptIndex];
  const userHasAnswered = currentPrompt
    ? rapidMatch.userAnswers[currentPrompt.id] !== undefined
    : false;
  const partnerHasAnswered = currentPrompt
    ? rapidMatch.partnerAnswers[currentPrompt.id] !== undefined
    : false;

  const totalAnswered = Object.keys(rapidMatch.userAnswers).length;
  const isUrgent = rapidMatch.secondsRemaining < 60;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4 select-none">
      {/* Top Countdown & Urgency Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] flex items-center justify-between gap-3">
        {/* Partner Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={partner.photos[0]}
              alt={partner.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#E9ECEF]"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00B894] border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-[#2D3436]">
                {partner.name}, {partner.age}
              </span>
              {partner.isVerified && <VerifiedBadge size="sm" userName={partner.name} />}
            </div>
            <span className="text-[11px] text-[#636E72]">{partner.occupation} • {partner.location.distanceKm} km</span>
          </div>
        </div>

        {/* 3-Minute Urgency Clock */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-black text-sm shadow-sm transition-colors ${
            isUrgent
              ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
              : 'bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/20'
          }`}
        >
          <Clock className={`w-4 h-4 ${isUrgent ? 'animate-spin text-red-600' : ''}`} />
          <span>{formatSeconds(rapidMatch.secondsRemaining)}</span>
        </div>
      </div>

      {/* Synchronized Prompt Chemistry Card */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider">
              Prompt {rapidMatch.currentPromptIndex + 1} of {rapidMatch.prompts.length}
            </span>
          </div>
          <span className="text-xs font-bold text-[#636E72]">
            {totalAnswered} / {rapidMatch.prompts.length} answered
          </span>
        </div>

        {/* Prompt Question */}
        <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] mb-3 flex items-start gap-2.5">
          <span className="text-xl">{currentPrompt?.emoji}</span>
          <p className="text-sm font-extrabold text-[#2D3436] leading-tight">
            {currentPrompt?.question}
          </p>
        </div>

        {/* Synchronized Options List */}
        <div className="grid grid-cols-1 gap-2">
          {currentPrompt?.options.map((option, idx) => {
            const isUserPick = rapidMatch.userAnswers[currentPrompt.id] === idx;
            const isPartnerPick = rapidMatch.partnerAnswers[currentPrompt.id] === idx;
            const isMutualPick = isUserPick && isPartnerPick;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => answerRapidPrompt(currentPrompt.id, idx)}
                className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isMutualPick
                    ? 'border-[#00B894] bg-[#00B894]/10 ring-2 ring-[#00B894]/30'
                    : isUserPick
                    ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 ring-2 ring-[#6C5CE7]/20'
                    : 'border-[#E9ECEF] bg-white hover:border-[#6C5CE7]/40'
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    isMutualPick
                      ? 'text-[#00B894]'
                      : isUserPick
                      ? 'text-[#6C5CE7]'
                      : 'text-[#2D3436]'
                  }`}
                >
                  {option}
                </span>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isUserPick && (
                    <span className="px-2 py-0.5 rounded-full bg-[#6C5CE7] text-white text-[10px] font-bold">
                      You
                    </span>
                  )}
                  {partnerHasAnswered && isPartnerPick && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FD79A8] text-white text-[10px] font-bold">
                      {partner.name}
                    </span>
                  )}
                  {isMutualPick && (
                    <span className="text-xs">🔥 Match!</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Prompt status feedback */}
        <div className="mt-3 text-center">
          {!userHasAnswered ? (
            <p className="text-[11px] text-[#636E72]">Tap your choice to reveal both answers!</p>
          ) : !partnerHasAnswered ? (
            <p className="text-[11px] text-[#6C5CE7] animate-pulse font-medium">
              Waiting for {partner.name} to choose...
            </p>
          ) : (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00B894]/15 text-[#00B894] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Answers Synchronized!
            </div>
          )}
        </div>
      </div>

      {/* Mini Rapid Chat Exchange */}
      <div className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] flex flex-col gap-2.5">
        <span className="text-xs font-bold text-[#636E72] uppercase tracking-wider">
          Rapid Chat Reaction:
        </span>

        {/* Messages Stream */}
        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
          {rapidMatch.chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${
                  msg.sender === 'me'
                    ? 'bg-[#6C5CE7] text-white rounded-br-xs'
                    : 'bg-[#F8F9FA] text-[#2D3436] border border-[#E9ECEF] rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSendChat} className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Quick message to ${partner.name}...`}
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-xs text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-[#6C5CE7] text-white hover:bg-[#4834D4] transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* The Crucial Save Match Decision Dock */}
      <div className="bg-gradient-to-r from-[#FD79A8]/10 via-[#6C5CE7]/10 to-[#00B894]/10 rounded-3xl p-5 border border-[#FD79A8]/30 shadow-md flex flex-col items-center text-center">
        <h4 className="text-sm font-extrabold text-[#2D3436]">
          Save Match Before Countdown Ends!
        </h4>
        <p className="text-xs text-[#636E72] mt-0.5 max-w-xs">
          Both partners must lock in a save or this connection disappears forever.
        </p>

        {/* Partner status badge */}
        <div className="my-3">
          {rapidMatch.partnerSaved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B894] text-white text-xs font-bold shadow-sm">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              {partner.name} tapped Save Match!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#636E72] text-xs font-medium border border-[#E9ECEF]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {partner.name} is deciding...
            </span>
          )}
        </div>

        {/* Save Match Button */}
        <button
          onClick={saveRapidMatch}
          disabled={rapidMatch.userSaved}
          className={`w-full max-w-sm py-3.5 px-6 rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            rapidMatch.userSaved
              ? 'bg-[#00B894] text-white'
              : 'bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] text-white hover:opacity-95 active:scale-98 shadow-[0_8px_20px_rgba(253,121,168,0.35)]'
          }`}
        >
          <Heart className={`w-4 h-4 ${rapidMatch.userSaved ? 'fill-white' : ''}`} />
          <span>
            {rapidMatch.userSaved
              ? 'Match Saved! Waiting for Partner... 🤞'
              : '💜 Lock In & Save Match'}
          </span>
        </button>
      </div>
    </div>
  );
};

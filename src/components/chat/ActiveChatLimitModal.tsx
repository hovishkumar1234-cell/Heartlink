import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { triggerHaptic } from '../../utils/haptics';
import { ScheduleDateModal } from './ScheduleDateModal';
import { MoveToSocialsModal } from './MoveToSocialsModal';
import { PoliteDepartureModal } from './PoliteDepartureModal';
import {
  ShieldAlert,
  Sparkles,
  X,
  Coffee,
  Share2,
  HeartHandshake,
  MessageCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const ActiveChatLimitModal: React.FC = () => {
  const {
    currentUser,
    users,
    matches,
    activeChatMatches,
    pendingBlockedMatchId,
    setPendingBlockedMatchId,
    userKarma,
  } = useApp();

  const [dateModalMatchId, setDateModalMatchId] = useState<string | null>(null);
  const [socialsModalMatchId, setSocialsModalMatchId] = useState<string | null>(null);
  const [departureModalMatchId, setDepartureModalMatchId] = useState<string | null>(null);

  if (!pendingBlockedMatchId) return null;

  const pendingMatch = matches.find((m) => m.id === pendingBlockedMatchId);
  const pendingPartnerId = pendingMatch
    ? pendingMatch.userId1 === currentUser?.id
      ? pendingMatch.userId2
      : pendingMatch.userId1
    : null;
  const pendingPartner = users.find((u) => u.id === pendingPartnerId);

  const getPartnerForMatch = (mId: string) => {
    const match = matches.find((m) => m.id === mId);
    if (!match) return null;
    const pId = match.userId1 === currentUser?.id ? match.userId2 : match.userId1;
    return users.find((u) => u.id === pId);
  };

  const handleClose = () => {
    triggerHaptic('light');
    setPendingBlockedMatchId(null);
  };

  const selectedDatePartner = dateModalMatchId ? getPartnerForMatch(dateModalMatchId) : null;
  const selectedSocialsPartner = socialsModalMatchId ? getPartnerForMatch(socialsModalMatchId) : null;
  const selectedDeparturePartner = departureModalMatchId ? getPartnerForMatch(departureModalMatchId) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-md p-5 border border-[#E9ECEF] shadow-2xl flex flex-col gap-4 text-[#2D3436] max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-sm font-black">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#2D3436]">
                  Active Chat Limit Reached (3 / 3)
                </h3>
                <p className="text-[11px] text-[#636E72]">Anti-Ghosting Karma Protection</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-[#E9ECEF] flex items-center justify-center text-[#636E72] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Philosophy Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#6C5CE7]/10 via-[#00B894]/10 to-[#FD79A8]/10 border border-[#6C5CE7]/20 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-black text-[#2D3436]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
                <span>Want to message {pendingPartner ? pendingPartner.name : 'this match'}?</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C5CE7] text-white">
                Intentional Dating
              </span>
            </div>
            <p className="text-[11px] text-[#636E72] leading-relaxed">
              To prevent flakiness and ghosting, HeartLink limits you to 3 active conversations. To unlock this new chat, progress or politely close one of your current 3:
            </p>
          </div>

          {/* Current 3 Active Chats */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#636E72]">
              Your 3 Active Conversations
            </h4>

            {activeChatMatches.map((m) => {
              const partner = getPartnerForMatch(m.id);
              if (!partner) return null;

              return (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl border border-[#E9ECEF] bg-[#F8F9FA] flex flex-col gap-2.5 shadow-2xs"
                >
                  {/* Partner Overview */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src={partner.photos[0]}
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E9ECEF]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#2D3436] truncate">{partner.name}</p>
                      <p className="text-[10px] text-[#636E72] truncate">
                        {m.lastMessage || 'Conversation active'}
                      </p>
                    </div>
                  </div>

                  {/* 3 Resolution Actions */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#E9ECEF]/60">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setDateModalMatchId(m.id);
                      }}
                      className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#6C5CE7]/10 border border-[#E9ECEF] hover:border-[#6C5CE7] text-[#2D3436] text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Propose an in-person date to graduate this slot"
                    >
                      <Coffee className="w-3 h-3 text-[#6C5CE7]" />
                      <span>IRL Date</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSocialsModalMatchId(m.id);
                      }}
                      className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#FD79A8]/10 border border-[#E9ECEF] hover:border-[#FD79A8] text-[#2D3436] text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Exchange Instagram or phone to graduate off-app"
                    >
                      <Share2 className="w-3 h-3 text-[#FD79A8]" />
                      <span>Socials</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setDepartureModalMatchId(m.id);
                      }}
                      className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#00B894]/10 border border-[#E9ECEF] hover:border-[#00B894] text-[#00B894] text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Send a courteous 1-tap departure message (+Karma)"
                    >
                      <HeartHandshake className="w-3 h-3 text-[#00B894]" />
                      <span>Depart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#636E72] font-bold text-xs transition-colors cursor-pointer mt-1"
          >
            I'll decide later
          </button>
        </div>
      </div>

      {/* Sub-modals for each graduation method */}
      {dateModalMatchId && selectedDatePartner && (
        <ScheduleDateModal
          isOpen={true}
          onClose={() => setDateModalMatchId(null)}
          matchId={dateModalMatchId}
          partnerName={selectedDatePartner.name}
        />
      )}

      {socialsModalMatchId && selectedSocialsPartner && (
        <MoveToSocialsModal
          isOpen={true}
          onClose={() => setSocialsModalMatchId(null)}
          matchId={socialsModalMatchId}
          partnerName={selectedSocialsPartner.name}
        />
      )}

      {departureModalMatchId && selectedDeparturePartner && (
        <PoliteDepartureModal
          isOpen={true}
          onClose={() => setDepartureModalMatchId(null)}
          matchId={departureModalMatchId}
          partnerName={selectedDeparturePartner.name}
        />
      )}
    </>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Heart,
  MessageCircle,
  Sparkles,
  Check,
  ChevronRight,
  Flag,
  X,
  Coffee,
  Share2,
  HeartHandshake,
  ShieldAlert,
  Zap,
  Phone,
  Video,
} from 'lucide-react';
import { Match, User } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ReportUserModal } from '../common/ReportUserModal';
import { KarmaBadgeStrip } from '../common/KarmaBadgeStrip';
import { ActiveChatLimitModal } from '../chat/ActiveChatLimitModal';
import { triggerHaptic } from '../../utils/haptics';

export const MatchesScreen: React.FC = () => {
  const {
    currentUser,
    users,
    matches,
    messages,
    setActiveChatMatchId,
    setActiveScreen,
    typingMatchIds,
    tryOpenChat,
    userKarma,
    activeChatLimit,
    activeChatMatches,
    startCall,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [reportingUser, setReportingUser] = useState<User | null>(null);

  if (!currentUser) return null;

  // Find all matches involving current user
  const userMatches = matches.filter(
    (m) => m.userId1 === currentUser.id || m.userId2 === currentUser.id
  );

  // Helper to get matched user object
  const getPartner = (m: Match): User | undefined => {
    const partnerId = m.userId1 === currentUser.id ? m.userId2 : m.userId1;
    return users.find((u) => u.id === partnerId);
  };

  // Helper to format timestamp
  const formatTime = (isoString?: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date('2026-10-20T09:45:00Z');
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Separate matches without any messages ("New Matches") from active conversations
  const newMatchesList = userMatches.filter((m) => !m.lastMessage);
  const activeConversations = userMatches.filter((m) => !!m.lastMessage);

  // Apply search query
  const filteredConversations = activeConversations.filter((m) => {
    const partner = getPartner(m);
    if (!partner) return false;
    return (
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.lastMessage && m.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleSelectMatch = (matchId: string) => {
    triggerHaptic('light');
    tryOpenChat(matchId);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-4 px-4 max-w-md mx-auto flex flex-col bg-[#F8F9FA]">
      {/* Top Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-[#636E72] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search matches & conversations..."
          className="w-full bg-white border border-[#E9ECEF] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#2D3436] placeholder-[#636E72]/70 shadow-xs focus:outline-none focus:border-[#6C5CE7] transition-colors"
        />
      </div>

      {/* Anti-Ghosting Active Chat Limit Meter Card */}
      <div className="mb-5 p-4 rounded-3xl bg-white border border-[#E9ECEF] shadow-[0_4px_20px_rgba(108,92,231,0.06)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activeChatMatches.length >= activeChatLimit ? 'bg-[#FD79A8]' : 'bg-[#00B894] animate-pulse'
              }`}
            />
            <h3 className="text-xs font-black text-[#2D3436] tracking-tight">
              Active Chat Slots ({activeChatMatches.length} / {activeChatLimit})
            </h3>
          </div>
          <KarmaBadgeStrip score={userKarma.score} badges={userKarma.badges} size="sm" />
        </div>

        {/* 3 Visual Slot Circles */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => {
            const activeMatch = activeChatMatches[index];
            const partner = activeMatch ? getPartner(activeMatch) : null;

            return partner ? (
              <div
                key={activeMatch.id}
                onClick={() => handleSelectMatch(activeMatch.id)}
                className="p-2 rounded-2xl bg-[#F8F9FA] hover:bg-[#F3EEFF] border border-[#6C5CE7]/30 hover:border-[#6C5CE7] transition-all flex flex-col items-center text-center cursor-pointer group shadow-2xs"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden mb-1 border-2 border-[#6C5CE7]">
                  <img
                    src={partner.photos[0]}
                    alt={partner.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00B894] ring-1 ring-white" />
                </div>
                <span className="text-[10px] font-black text-[#2D3436] truncate max-w-[85px]">
                  {partner.name.split(' ')[0]}
                </span>
                <span className="text-[8px] font-bold text-[#6C5CE7] uppercase">Active</span>
              </div>
            ) : (
              <div
                key={`empty_slot_${index}`}
                className="p-2 rounded-2xl bg-[#F8F9FA]/60 border border-dashed border-[#636E72]/30 flex flex-col items-center justify-center text-center min-h-[78px]"
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-[#636E72]/40 flex items-center justify-center text-[#636E72] mb-1">
                  <span className="text-xs font-bold">+</span>
                </div>
                <span className="text-[9px] font-semibold text-[#636E72]">Open Slot</span>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-[#636E72] leading-tight">
          Capped at 3 simultaneous chats to eliminate ghosting. Schedule a date, exchange socials, or send a polite departure to free up a slot!
        </p>
      </div>

      {/* Section 1: New Matches Horizontal Strip */}
      {newMatchesList.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FD79A8]" />
              New Matches ({newMatchesList.length})
            </span>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
            {newMatchesList.map((m) => {
              const partner = getPartner(m);
              if (!partner) return null;

              return (
                <div
                  key={m.id}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <div
                    onClick={() => {
                      triggerHaptic('light');
                      setInspectUser(partner);
                    }}
                    title={`View ${partner.name}'s profile`}
                    className="relative cursor-pointer"
                  >
                    {/* Glowing ring for uncontacted matches (#6C5CE7 to #FD79A8) */}
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] shadow-[0_4px_16px_rgba(108,92,231,0.25)] group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        <img
                          src={partner.photos[0]}
                          alt={partner.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Online presence indicator dot (#00B894) */}
                    <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#00B894] ring-2 ring-white" title="Online" />
                    {partner.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <VerifiedBadge size="xs" userName={partner.name} interactive={false} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleSelectMatch(m.id)}
                    className="text-[11px] font-bold text-[#2D3436] hover:text-[#6C5CE7] max-w-[64px] truncate cursor-pointer transition-colors"
                  >
                    {partner.name.split(' ')[0]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Active Conversations List */}
      <div className="flex-1">
        <h3 className="text-xs font-bold text-[#636E72] uppercase tracking-wider mb-3">
          Messages ({activeConversations.length})
        </h3>

        {filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map((m) => {
              const partner = getPartner(m);
              if (!partner) return null;

              const unread = m.userId1 === currentUser.id ? m.unreadCount1 : m.unreadCount2;

              return (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectMatch(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectMatch(m.id);
                    }
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white hover:bg-[#FDFBFF] border border-[#E9ECEF] hover:border-[#6C5CE7]/30 text-left flex items-center gap-3.5 shadow-[0_4px_20px_rgba(108,92,231,0.06)] hover:shadow-md transition-all group cursor-pointer focus:outline-none focus:border-[#6C5CE7]"
                >
                  {/* Avatar - click to inspect full profile */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      setInspectUser(partner);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        triggerHaptic('light');
                        setInspectUser(partner);
                      }
                    }}
                    title={`View ${partner.name}'s profile`}
                    className="relative shrink-0 cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="w-13 h-13 rounded-2xl overflow-hidden bg-[#F1F2F6] border border-[#E9ECEF] group-hover:border-[#6C5CE7]/40 transition-colors">
                      <img
                        src={partner.photos[0]}
                        alt={partner.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online presence indicator dot (#00B894) */}
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00B894] ring-2 ring-white" title="Online" />
                    {partner.isVerified && (
                      <div className="absolute -bottom-1 -right-1">
                        <VerifiedBadge size="xs" userName={partner.name} interactive={false} />
                      </div>
                    )}
                  </div>

                  {/* Message Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors truncate">
                          {partner.name}
                        </span>
                        {partner.isVerified && (
                          <VerifiedBadge size="xs" userName={partner.name} />
                        )}
                        {m.isSuperLike && (
                          <span className="text-[10px] text-[#6C5CE7] font-bold">★ SuperLike</span>
                        )}
                        {m.slotStatus === 'graduated_date' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#00B894]/15 text-[#00B894] font-extrabold flex items-center gap-0.5">
                            <Coffee className="w-2.5 h-2.5" /> Date Planned
                          </span>
                        )}
                        {m.slotStatus === 'graduated_socials' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FD79A8]/15 text-[#FD79A8] font-extrabold flex items-center gap-0.5">
                            <Share2 className="w-2.5 h-2.5" /> On Socials
                          </span>
                        )}
                        {m.slotStatus === 'departed_politely' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-zinc-100 text-[#636E72] font-bold flex items-center gap-0.5">
                            <HeartHandshake className="w-2.5 h-2.5 text-[#00B894]" /> Closed
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#636E72] tabular-nums font-medium">
                        {formatTime(m.lastMessageAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {typingMatchIds.includes(m.id) ? (
                        <p className="text-xs text-[#6C5CE7] font-semibold flex items-center gap-1.5 animate-pulse">
                          <span className="flex gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#6C5CE7] animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-1 rounded-full bg-[#6C5CE7] animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-1 rounded-full bg-[#6C5CE7] animate-bounce" />
                          </span>
                          <span>typing...</span>
                        </p>
                      ) : (
                        <p className={`text-xs truncate ${unread > 0 ? 'text-[#2D3436] font-bold' : 'text-[#636E72]'}`}>
                          {m.lastMessage || 'Say hello...'}
                        </p>
                      )}
                      {unread > 0 && !typingMatchIds.includes(m.id) && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#6C5CE7] text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#636E72]/50 group-hover:text-[#6C5CE7] transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-[#E9ECEF] p-8 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center justify-center text-[#6C5CE7] mb-3">
              <MessageCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-[#2D3436] mb-1">No messages yet</p>
            <p className="text-xs text-[#636E72] max-w-xs mb-5 leading-relaxed">
              When you mutually match with members on HeartLink, your conversations will appear here.
            </p>
            <button
              onClick={() => setActiveScreen('discover')}
              className="px-5 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Start Discovering
            </button>
          </div>
        )}
      </div>

      {/* Profile Detail View Modal for Matches */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9ECEF] w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto p-5 sm:p-6 shadow-[0_20px_60px_rgba(108,92,231,0.2)] flex flex-col">
            <div className="w-10 h-1 bg-[#E9ECEF] rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B894] ring-2 ring-[#00B894]/20" title="Online" />
                <h3 className="text-xl font-bold text-[#2D3436]">
                  {inspectUser.name}, <span className="tabular-nums font-semibold">{inspectUser.age}</span>
                </h3>
                {inspectUser.isVerified && (
                  <VerifiedBadge size="md" userName={inspectUser.name} />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setReportingUser(inspectUser);
                  }}
                  className="p-1.5 text-[#636E72] hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title={`Report ${inspectUser.name}`}
                  aria-label={`Report ${inspectUser.name}`}
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setInspectUser(null)}
                  className="p-1.5 text-[#636E72] hover:text-[#2D3436] rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/5] border border-[#E9ECEF] mb-4 bg-[#F1F2F6] shadow-xs">
              <img
                src={inspectUser.photos[0]}
                alt={inspectUser.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#636E72] pb-3 border-b border-[#E9ECEF] mb-4">
              <span>{inspectUser.occupation}</span>
              <span aria-hidden="true">·</span>
              <span>{inspectUser.location.city}</span>
              <span aria-hidden="true">·</span>
              <span>Goal: {inspectUser.relationshipGoal.replace('-', ' ')}</span>
            </div>

            {inspectUser.bio && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider mb-1.5">About</h4>
                <p className="text-xs text-[#2D3436] leading-relaxed">{inspectUser.bio}</p>
              </div>
            )}

            {inspectUser.prompts && inspectUser.prompts.length > 0 && (
              <div className="space-y-3 mb-4">
                {inspectUser.prompts.map((p, i) => (
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

            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setInspectUser(null);
                  startCall(inspectUser.id, 'audio');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#00B894]/10 hover:bg-[#00B894]/20 border border-[#00B894]/30 text-[#00B894] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title={`Audio Call ${inspectUser.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Audio Call</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setInspectUser(null);
                  startCall(inspectUser.id, 'video');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#FD79A8]/10 hover:bg-[#FD79A8]/20 border border-[#FD79A8]/30 text-[#FD79A8] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title={`Video Call ${inspectUser.name}`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Call</span>
              </button>
            </div>

            <button
              onClick={() => {
                const targetMatch = matches.find(
                  (m) =>
                    (m.userId1 === currentUser.id && m.userId2 === inspectUser.id) ||
                    (m.userId2 === currentUser.id && m.userId1 === inspectUser.id)
                );
                if (targetMatch) {
                  setInspectUser(null);
                  tryOpenChat(targetMatch.id);
                }
              }}
              className="w-full py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-bold text-sm shadow-[0_4px_18px_rgba(108,92,231,0.3)] transition-all cursor-pointer"
            >
              Open Conversation
            </button>

            {/* Discreet Report User link */}
            <div className="pt-4 pb-1 text-center border-t border-[#E9ECEF] mt-4">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setReportingUser(inspectUser);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#636E72] hover:text-red-500 py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report {inspectUser.name}</span>
              </button>
              <p className="text-[10px] text-[#636E72]/80 mt-0.5">
                Reports are 100% confidential and reviewed by HeartLink moderation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Discreet Report User Modal */}
      <ReportUserModal
        isOpen={Boolean(reportingUser)}
        onClose={() => setReportingUser(null)}
        targetUser={reportingUser}
        onSuccess={() => {
          setInspectUser(null);
          setReportingUser(null);
        }}
      />

      {/* Anti-Ghosting Active Chat Limit Modal */}
      <ActiveChatLimitModal />
    </div>
  );
};

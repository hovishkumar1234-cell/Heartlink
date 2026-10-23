import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, Send, Sparkles, X } from 'lucide-react';
import { generateLocalWingmanPrompts, fetchAiWingmanPrompts, getMutualInterests } from '../../utils/aiWingman';
import { AiWingmanPrompt } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';

export const MatchCelebrationModal: React.FC = () => {
  const {
    matchCelebration,
    setMatchCelebration,
    sendMessage,
    setActiveChatMatchId,
    setActiveScreen,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [prompts, setPrompts] = useState<AiWingmanPrompt[]>([]);

  const user1 = matchCelebration?.user1;
  const user2 = matchCelebration?.user2;
  const matchId = matchCelebration?.matchId;

  useEffect(() => {
    if (user1 && user2) {
      const initial = generateLocalWingmanPrompts(user1, user2);
      setPrompts(initial.topics.slice(0, 2));

      fetchAiWingmanPrompts(user1, user2).then((res) => {
        if (res && res.topics?.length > 0) {
          setPrompts(res.topics.slice(0, 2));
        }
      });
    }
  }, [user1?.id, user2?.id]);

  if (!matchCelebration || !user1 || !user2 || !matchId) return null;

  const mutualInterests = getMutualInterests(user1, user2);

  const handleSendAndOpenChat = (textToSend?: string) => {
    const finalMsg = textToSend || messageText;
    if (finalMsg.trim()) {
      sendMessage(matchId, finalMsg.trim());
    }
    setActiveChatMatchId(matchId);
    setActiveScreen('chat');
    setMatchCelebration(null);
  };

  const handleKeepSwiping = () => {
    setMatchCelebration(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md flex flex-col items-center text-center p-6 bg-white border border-[#E9ECEF] rounded-3xl shadow-[0_20px_60px_rgba(108,92,231,0.2)] overflow-hidden">
        {/* Top Dismiss */}
        <button
          onClick={handleKeepSwiping}
          className="absolute top-4 right-4 p-2 text-[#636E72] hover:text-[#2D3436] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Match Accent Pulse (#00B894 Mint Leaf) */}
        <div className="absolute top-1/4 -translate-y-1/2 w-52 h-52 bg-[#00B894]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Animated Celebration Title with Success (#00B894) */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#FD79A8] tracking-widest uppercase mb-1">
          <Sparkles className="w-4 h-4 text-[#FD79A8]" />
          <span>Mutual Connection</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00B894] tracking-tight mb-2 drop-shadow-xs">
          It’s a Match!
        </h2>
        <p className="text-xs text-[#636E72] mb-6 max-w-xs leading-relaxed">
          You and <span className="text-[#2D3436] font-bold">{user2.name}</span> both liked each other.
        </p>

        {/* Dual Avatars Interlocked */}
        <div className="flex items-center justify-center relative mb-6">
          {/* User 1 Photo */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-white shadow-xl -mr-4 z-10">
            <img
              src={user1.photos[0]}
              alt={user1.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Glowing Center Heart (#FD79A8 Blush Pink) */}
          <div className="relative z-30 w-11 h-11 rounded-full bg-white border-2 border-[#FD79A8] flex items-center justify-center text-[#FD79A8] shadow-[0_4px_16px_rgba(253,121,168,0.5)] -my-4 animate-bounce">
            <Heart className="w-5 h-5 fill-[#FD79A8]" />
          </div>

          {/* User 2 Photo */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-[#00B894] shadow-xl -ml-4 z-20">
            <img
              src={user2.photos[0]}
              alt={user2.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {user2.isVerified && (
              <div className="absolute bottom-1 right-1">
                <VerifiedBadge size="sm" userName={user2.name} interactive={false} />
              </div>
            )}
          </div>
        </div>

        {/* AI Wingman Contextual Prompt Suggestions (Secondary #FD79A8 Triggers) */}
        <div className="w-full mb-4 text-left">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-[#FD79A8] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Break The Ice Openers
            </span>
            <span className="text-[10px] text-[#636E72]">
              {mutualInterests.length > 0 ? `Shared: ${mutualInterests.slice(0, 2).join(' & ')}` : 'Contextual'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {prompts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSendAndOpenChat(p.suggestedOpener)}
                className="w-full text-left p-3 rounded-2xl bg-[#F8F9FA] hover:bg-white border border-[#E9ECEF] hover:border-[#FD79A8] text-xs text-[#636E72] hover:text-[#2D3436] transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                    {p.headline}
                  </span>
                  <span className="text-[10px] text-[#FD79A8] font-semibold flex items-center gap-1">
                    Send <Send className="w-3 h-3 text-[#FD79A8]" />
                  </span>
                </div>
                <p className="text-[11px] text-[#636E72] group-hover:text-[#2D3436] line-clamp-2 leading-relaxed">
                  “{p.suggestedOpener}”
                </p>
                <p className="text-[9px] text-[#00B894] font-semibold mt-1">
                  ✨ {p.context}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Message Input */}
        <div className="w-full flex items-center gap-2 mb-4">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendAndOpenChat();
            }}
            placeholder={`Say hello to ${user2.name}...`}
            className="flex-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3.5 py-2.5 text-xs text-[#2D3436] placeholder-[#636E72]/70 focus:outline-none focus:border-[#6C5CE7]"
          />
          <button
            onClick={() => handleSendAndOpenChat()}
            className="px-4 py-2.5 rounded-xl bg-[#6C5CE7] text-white font-bold text-xs hover:bg-[#4834D4] shadow-[0_4px_16px_rgba(108,92,231,0.3)] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Keep Swiping Button */}
        <button
          onClick={handleKeepSwiping}
          className="text-xs font-semibold text-[#636E72] hover:text-[#2D3436] transition-colors cursor-pointer"
        >
          Keep Swiping
        </button>
      </div>
    </div>
  );
};

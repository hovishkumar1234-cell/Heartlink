import React, { useState } from 'react';
import { KarmaBadgeType } from '../../types';
import { KARMA_BADGE_DEFINITIONS } from '../../data/karmaData';
import { Sparkles, ShieldCheck, Zap, Info, X, TrendingUp } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface KarmaBadgeStripProps {
  score?: number;
  badges?: KarmaBadgeType[];
  size?: 'sm' | 'md' | 'lg';
  showDetailsModalOnClick?: boolean;
  className?: string;
}

export const KarmaBadgeStrip: React.FC<KarmaBadgeStripProps> = ({
  score = 96,
  badges = ['prompt_responder', 'zero_ghost_karma', 'intentional_dater'],
  size = 'md',
  showDetailsModalOnClick = true,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);

  const getTier = (s: number) => {
    if (s >= 95) return { name: 'Spotlight Emerald', color: '#00B894', boost: '+25% Feed Boost' };
    if (s >= 88) return { name: 'Gold Standard', color: '#FDCB6E', boost: '+15% Feed Boost' };
    if (s >= 80) return { name: 'Rising Star', color: '#6C5CE7', boost: '+10% Feed Boost' };
    return { name: 'Building Karma', color: '#636E72', boost: 'Standard' };
  };

  const tier = getTier(score);

  const handleClick = (e: React.MouseEvent) => {
    if (!showDetailsModalOnClick) return;
    e.stopPropagation();
    triggerHaptic('light');
    setShowModal(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`inline-flex flex-wrap items-center gap-1.5 ${
          showDetailsModalOnClick ? 'cursor-pointer group' : ''
        } ${className}`}
      >
        {/* Karma Score Pill */}
        <div
          className={`inline-flex items-center gap-1 rounded-full font-black text-white shadow-xs transition-transform group-hover:scale-105 ${
            size === 'sm'
              ? 'px-2 py-0.5 text-[9px]'
              : size === 'lg'
              ? 'px-3 py-1.5 text-xs'
              : 'px-2.5 py-0.5 text-[10px]'
          }`}
          style={{ backgroundColor: tier.color }}
          title={`Karma Score: ${score}/100 · ${tier.name}`}
        >
          <Sparkles className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
          <span className="tabular-nums">{score} Karma</span>
        </div>

        {/* Individual Green-Flag Badges */}
        {badges.slice(0, size === 'sm' ? 2 : 3).map((badgeKey) => {
          const badge = KARMA_BADGE_DEFINITIONS[badgeKey];
          if (!badge) return null;
          return (
            <div
              key={badge.type}
              className={`inline-flex items-center gap-0.5 rounded-full bg-white border border-[#E9ECEF] text-[#2D3436] font-bold shadow-2xs ${
                size === 'sm'
                  ? 'px-1.5 py-0.2 text-[8px]'
                  : 'px-2 py-0.5 text-[9px]'
              }`}
              title={`${badge.label}: ${badge.description}`}
            >
              <span>{badge.emoji}</span>
              <span className="truncate max-w-[85px]">{badge.label}</span>
            </div>
          );
        })}

        {badges.length > 3 && size !== 'sm' && (
          <span className="text-[9px] font-bold text-[#636E72]">
            +{badges.length - 3}
          </span>
        )}
      </div>

      {/* Karma & Reputation Explanation Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-sm p-5 border border-[#E9ECEF] shadow-2xl flex flex-col gap-4 text-[#2D3436] animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs font-black"
                  style={{ backgroundColor: tier.color }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2D3436] flex items-center gap-1.5">
                    <span>{score} Karma</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00B894]/15 text-[#00B894] font-extrabold uppercase">
                      {tier.name}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#636E72]">Anti-Ghosting Reputation Score</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-[#F8F9FA] hover:bg-[#E9ECEF] flex items-center justify-center text-[#636E72] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feed Boost Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#00B894]/10 via-[#6C5CE7]/10 to-[#FD79A8]/10 border border-[#00B894]/20 flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-[#00B894] shrink-0" />
              <div className="text-[11px]">
                <p className="font-black text-[#2D3436]">{tier.boost} Active</p>
                <p className="text-[#636E72]">
                  Responsive daters with high karma earn higher visibility in the discovery queue!
                </p>
              </div>
            </div>

            {/* Badges List */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-[#636E72]">
                Earned Green-Flag Badges
              </h4>
              {badges.map((bKey) => {
                const b = KARMA_BADGE_DEFINITIONS[bKey];
                if (!b) return null;
                return (
                  <div
                    key={b.type}
                    className="p-2.5 rounded-2xl border border-[#E9ECEF] bg-[#F8F9FA] flex items-start gap-2.5"
                  >
                    <span className="text-lg shrink-0 mt-0.5">{b.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#2D3436]">{b.label}</span>
                        <span className="text-[9px] font-bold text-[#00B894] bg-[#00B894]/10 px-1.5 py-0.2 rounded-md">
                          {b.shortTag}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#636E72] mt-0.5 leading-relaxed">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3 Active Chats Rule Explanation */}
            <div className="p-3 rounded-2xl bg-[#6C5CE7]/5 border border-[#6C5CE7]/20 text-[11px] space-y-1">
              <p className="font-extrabold text-[#6C5CE7] flex items-center gap-1">
                <span>🛡️ The 3-Chat Limit Philosophy</span>
              </p>
              <p className="text-[#636E72] leading-relaxed">
                Matches are capped at 3 active chats simultaneously. To chat with someone new, daters must schedule an IRL date, exchange socials, or send a polite departure message.
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

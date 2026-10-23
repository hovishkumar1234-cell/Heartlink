import React, { useState, useEffect } from 'react';
import { User, AiWingmanPrompt, AiWingmanResponse } from '../../types';
import { fetchAiWingmanPrompts, getMutualInterests } from '../../utils/aiWingman';
import { triggerHaptic } from '../../utils/haptics';
import {
  Sparkles,
  RefreshCw,
  Send,
  Edit3,
  Copy,
  Check,
  Flame,
  Heart,
  Lightbulb,
  X,
  Compass,
  MessageCircle,
} from 'lucide-react';

interface AiWingmanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  partner: User;
  onSelectPrompt: (text: string, sendImmediately: boolean) => void;
  recentMessages?: string[];
}

export const AiWingmanDrawer: React.FC<AiWingmanDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  partner,
  onSelectPrompt,
  recentMessages = [],
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AiWingmanResponse | null>(null);
  const [activeTone, setActiveTone] = useState<'mutual_sparks' | 'playful' | 'deep' | 'creative'>('mutual_sparks');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mutualInterests = getMutualInterests(currentUser, partner);

  const loadPrompts = async (tone = activeTone) => {
    setLoading(true);
    try {
      const result = await fetchAiWingmanPrompts(currentUser, partner, tone, recentMessages);
      setData(result);
    } catch (err) {
      console.error('Failed to load wingman prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPrompts(activeTone);
    }
  }, [isOpen, activeTone, partner.id]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAction = (text: string, sendImmediately: boolean) => {
    triggerHaptic('medium');
    onSelectPrompt(text, sendImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E9ECEF] w-full max-w-lg max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#2D3436]">
        {/* Top Handle for mobile gestures */}
        <div className="w-10 h-1 bg-[#E9ECEF] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#E9ECEF] flex items-center justify-between bg-gradient-to-r from-[#F8F9FA] via-white to-[#F8F9FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 flex items-center justify-center text-[#6C5CE7] shadow-sm">
              <Sparkles className="w-5 h-5 text-[#FD79A8]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-[#2D3436] tracking-tight">AI Wingman</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/20">
                  Gemini Flash
                </span>
              </div>
              <p className="text-[11px] text-[#636E72]">
                Dynamic contextual openers for <span className="text-[#2D3436] font-semibold">{partner.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                loadPrompts(activeTone);
              }}
              disabled={loading}
              title="Generate fresh angles"
              className="p-2 text-[#636E72] hover:text-[#6C5CE7] hover:bg-[#F8F9FA] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6C5CE7]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#636E72] hover:text-[#2D3436] hover:bg-[#F8F9FA] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mutual Sparks Bar */}
        <div className="px-5 py-2.5 bg-[#F8F9FA] border-b border-[#E9ECEF] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#2D3436]">
            <Compass className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span className="font-semibold text-[#2D3436]">Mutual Sparks:</span>
            {mutualInterests.length > 0 ? (
              <span className="text-[#636E72]">
                {mutualInterests.slice(0, 3).join(', ')}
              </span>
            ) : (
              <span className="text-[#636E72]">Creative Lifestyle & Music</span>
            )}
          </div>
          <span className="text-[10px] text-[#FD79A8] font-bold bg-[#FD79A8]/10 px-2 py-0.5 rounded-md border border-[#FD79A8]/20">
            No Awkward "Hey"s
          </span>
        </div>

        {/* Tone Selection Tabs */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'mutual_sparks', label: '🎯 Mutual Sparks' },
            { id: 'playful', label: '🎲 Playful & Witty' },
            { id: 'deep', label: '💭 Deep & Authentic' },
            { id: 'creative', label: '💡 Creative Hook' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTone(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTone === tab.id
                  ? 'bg-[#6C5CE7] text-white shadow-sm'
                  : 'bg-[#F8F9FA] text-[#636E72] hover:text-[#2D3436] border border-[#E9ECEF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3.5">
          {loading && !data ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 flex items-center justify-center text-[#6C5CE7] mb-3 animate-spin">
                <Sparkles className="w-5 h-5 text-[#FD79A8]" />
              </div>
              <p className="text-xs font-semibold text-[#2D3436]">AI Wingman Analyzing Profiles...</p>
              <p className="text-[11px] text-[#636E72] mt-1">Cross-referencing shared music, hobbies & vibes</p>
            </div>
          ) : (
            <>
              {/* Mutual Analysis Box */}
              {data?.mutualAnalysis && (
                <div className="p-3 rounded-2xl bg-[#FD79A8]/5 border border-[#FD79A8]/20">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FD79A8] uppercase tracking-wider mb-1">
                    <Heart className="w-3 h-3 fill-[#FD79A8]" />
                    <span>Chemistry Insight</span>
                  </div>
                  <p className="text-xs text-[#2D3436] leading-relaxed">
                    {data.mutualAnalysis}
                  </p>
                </div>
              )}

              {/* Topic Cards */}
              <div className="space-y-3">
                {data?.topics.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-white border border-[#E9ECEF] hover:border-[#6C5CE7]/40 shadow-sm transition-all group"
                  >
                    {/* Header with Headline & Context */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-xs font-bold text-[#2D3436] group-hover:text-[#6C5CE7] transition-colors">
                          {t.headline}
                        </h4>
                        <p className="text-[11px] text-[#6C5CE7] font-medium mt-0.5 flex items-center gap-1">
                          <span>✨</span>
                          <span>{t.context}</span>
                        </p>
                      </div>
                    </div>

                    {/* Suggested Opener verbatim quote */}
                    <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-xs text-[#2D3436] font-medium leading-relaxed my-2 relative">
                      <span className="text-[#6C5CE7] font-bold">“</span>
                      {t.suggestedOpener}
                      <span className="text-[#6C5CE7] font-bold">”</span>
                    </div>

                    {/* Why it works */}
                    {t.whyItWorks && (
                      <p className="text-[10px] text-[#636E72] italic mb-3 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Why it works: {t.whyItWorks}</span>
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E9ECEF]">
                      <button
                        onClick={() => handleCopy(t.id, t.suggestedOpener)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#636E72] hover:text-[#2D3436] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer border border-[#E9ECEF]"
                        title="Copy text"
                      >
                        {copiedId === t.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#00B894]" />
                            <span className="text-[#00B894]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleAction(t.suggestedOpener, false)}
                        className="px-3 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#2D3436] text-[11px] font-medium flex items-center gap-1.5 transition-colors border border-[#E9ECEF] cursor-pointer"
                        title="Edit in chat input before sending"
                      >
                        <Edit3 className="w-3 h-3 text-[#6C5CE7]" />
                        <span>Edit In Bar</span>
                      </button>

                      <button
                        onClick={() => handleAction(t.suggestedOpener, true)}
                        className="px-3 py-1.5 rounded-lg bg-[#6C5CE7] hover:bg-[#5A49DF] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Send this message directly to conversation"
                      >
                        <Send className="w-3 h-3 fill-white" />
                        <span>Send Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coaching Tip at bottom */}
              {data?.coachingTip && (
                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-start gap-2 text-[11px] text-[#636E72]">
                  <Flame className="w-3.5 h-3.5 text-[#FD79A8] shrink-0 mt-0.5" />
                  <p>{data.coachingTip}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Refresh Action */}
        <div className="p-4 bg-[#F8F9FA] border-t border-[#E9ECEF] flex items-center justify-between">
          <p className="text-[10px] text-[#636E72]">
            Tailored in real-time by HeartLink AI Wingman
          </p>
          <button
            onClick={() => {
              triggerHaptic('light');
              loadPrompts(activeTone);
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#E9ECEF] text-xs font-semibold text-[#2D3436] border border-[#E9ECEF] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#6C5CE7]' : ''}`} />
            <span>Generate New Angles</span>
          </button>
        </div>
      </div>
    </div>
  );
};

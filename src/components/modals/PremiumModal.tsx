import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Crown, Sparkles, Check, X, Shield, Globe, RotateCcw, Heart } from 'lucide-react';

export const PremiumModal: React.FC = () => {
  const { isPremiumModalOpen, setIsPremiumModalOpen, upgradeToPremium } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'month' | 'year'>('month');

  if (!isPremiumModalOpen) return null;

  const features = [
    { icon: Heart, title: 'Unlimited Likes', desc: 'No daily swipe caps or cool-downs.' },
    { icon: Sparkles, title: 'See Who Liked You', desc: 'Instantly match with members who already liked you.' },
    { icon: Globe, title: 'Passport / Travel Mode', desc: 'Connect with people in any city worldwide.' },
    { icon: RotateCcw, title: 'Unlimited Rewinds', desc: 'Take back accidental passes with zero limits.' },
    { icon: Crown, title: 'Priority Profile Visibility', desc: 'Get shown 3x more often to high-compatibility matches.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white border border-[#E9ECEF] w-full max-w-md rounded-3xl overflow-hidden p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-[#2D3436]">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#FD79A8]/20 via-[#6C5CE7]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Dismiss */}
        <button
          onClick={() => setIsPremiumModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-[#636E72] hover:text-[#2D3436] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center justify-center text-[#6C5CE7] mx-auto mb-2.5 shadow-sm">
            <Crown className="w-6 h-6 text-[#6C5CE7]" />
          </div>
          <h2 className="text-xl font-extrabold text-[#2D3436]">Upgrade to HeartLink Platinum</h2>
          <p className="text-xs text-[#6C5CE7] font-semibold mt-0.5">Maximize your genuine dating opportunities</p>
        </div>

        {/* Features List */}
        <div className="space-y-2.5 mb-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
                <div className="p-1.5 rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7] shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D3436]">{feat.title}</h4>
                  <p className="text-[11px] text-[#636E72] leading-tight mt-0.5">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedPlan('month')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedPlan === 'month'
                ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] text-[#2D3436] shadow-sm ring-1 ring-[#6C5CE7]'
                : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#636E72]'
            }`}
          >
            <div className="text-[11px] font-semibold text-[#636E72]">1 Month</div>
            <div className="text-lg font-black text-[#2D3436] mt-0.5 tabular-nums">$14.99</div>
            <div className="text-[10px] text-[#636E72]">Billed monthly</div>
          </button>

          <button
            onClick={() => setSelectedPlan('year')}
            className={`relative p-3 rounded-2xl border text-center transition-all ${
              selectedPlan === 'year'
                ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] text-[#2D3436] shadow-sm ring-1 ring-[#6C5CE7]'
                : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#636E72]'
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#00B894] text-white shadow-sm">
              BEST VALUE
            </span>
            <div className="text-[11px] font-semibold text-[#636E72]">12 Months</div>
            <div className="text-lg font-black text-[#2D3436] mt-0.5 tabular-nums">$7.99<span className="text-xs font-normal">/mo</span></div>
            <div className="text-[10px] text-[#00B894] font-semibold">Save 46% annually</div>
          </button>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={upgradeToPremium}
          className="w-full py-3.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-extrabold text-xs shadow-[0_8px_25px_rgba(108,92,231,0.25)] active:scale-[0.98] transition-all"
        >
          Unlock Platinum Access Now
        </button>

        <p className="text-[10px] text-[#636E72] text-center mt-3">
          Core safety, reporting, and mutual messaging features remain 100% free for everyone.
        </p>
      </div>
    </div>
  );
};

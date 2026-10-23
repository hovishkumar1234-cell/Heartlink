import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { setActiveScreen, login } = useApp();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-between p-6 text-center max-w-md mx-auto bg-[#F8F9FA] text-[#2D3436]">
      {/* Top spacing */}
      <div className="w-full flex justify-end">
        <span className="text-[11px] font-semibold tracking-wider text-[#636E72] bg-white border border-[#E9ECEF] px-3 py-1 rounded-full shadow-sm">
          18+ ADULTS ONLY
        </span>
      </div>

      {/* Main Logo & Glow */}
      <div className="flex flex-col items-center my-auto">
        <div className="relative mb-6">
          {/* Soft Indigo / Blush glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6C5CE7]/25 to-[#FD79A8]/25 blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-white border-2 border-[#6C5CE7]/30 flex items-center justify-center shadow-[0_8px_30px_rgba(108,92,231,0.18)]">
            <Heart className="w-12 h-12 text-[#6C5CE7] fill-[#FD79A8]" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2D3436] mb-2">
          Heart<span className="text-[#6C5CE7]">Link</span>
        </h1>
        <p className="text-[#6C5CE7] text-sm font-bold tracking-wide uppercase mb-3">
          Fresh, Approachable & Welcoming
        </p>
        <p className="text-[#636E72] text-xs sm:text-sm max-w-xs leading-relaxed">
          The verified dating platform designed for genuine intent, mutual matching, and low-pressure socializing.
        </p>

        {/* Quick Safety Trust Pills */}
        <div className="flex items-center gap-3 mt-6 text-xs text-[#636E72]">
          <div className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#00B894]" />
            <span>Selfie Verified</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1 font-medium">
            <Sparkles className="w-4 h-4 text-[#FD79A8]" />
            <span>Mutual Matches Only</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="w-full flex flex-col gap-3 pt-6">
        <button
          onClick={() => setActiveScreen('onboarding')}
          className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(108,92,231,0.25)] active:scale-[0.98] transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveScreen('auth')}
          className="w-full h-12 rounded-xl bg-white hover:bg-[#F8F9FA] border border-[#E9ECEF] text-[#2D3436] font-semibold text-sm flex items-center justify-center active:scale-[0.98] transition-all shadow-sm"
        >
          <span>I Already Have An Account</span>
        </button>

        {/* Demo Fast-Track button */}
        <button
          onClick={() => login('user_maya')}
          className="text-xs text-[#636E72] hover:text-[#6C5CE7] pt-1 transition-colors font-medium"
        >
          Preview as Maya Patel (25, Verified Member)
        </button>

        <p className="text-[11px] text-[#636E72] mt-2">
          By signing up, you verify you are 18+ and agree to our Safety Guidelines.
        </p>
      </div>
    </div>
  );
};

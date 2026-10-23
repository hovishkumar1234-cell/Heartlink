import React from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, ShieldCheck, Heart, Sparkles, Download } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    activeScreen,
    setActiveScreen,
    viewMode,
    setViewMode,
    setIsApkModalOpen,
    matches,
  } = useApp();

  const totalUnread = matches.reduce((acc, m) => {
    if (!currentUser) return acc;
    return acc + (m.userId1 === currentUser.id ? m.unreadCount1 : m.unreadCount2);
  }, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#6C5CE7] text-white shadow-[0_4px_20px_rgba(108,92,231,0.25)] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => setActiveScreen(currentUser ? 'discover' : 'splash')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white text-[#FD79A8] flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
            <Heart className="w-4 h-4 fill-[#FD79A8]" />
          </div>
          <span className="flex items-center gap-1 font-extrabold text-lg tracking-tight">
            Heart<span className="text-[#FD79A8]">Link</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
          {currentUser && (
            <>
              <button
                onClick={() => setActiveScreen('discover')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
                  activeScreen === 'discover' ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-[#FD79A8]' : ''
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setActiveScreen('soundwave')}
                className={`relative flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
                  activeScreen === 'soundwave' ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-[#FD79A8]' : ''
                }`}
              >
                <span>Sound-Wave</span>
                <span className="text-[9px] bg-[#FD79A8] px-1.5 py-0.5 rounded-full font-extrabold text-white">NEW</span>
              </button>
              <button
                onClick={() => setActiveScreen('live')}
                className={`relative flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
                  activeScreen === 'live' ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-[#FD79A8]' : ''
                }`}
              >
                <span>Live Hub</span>
                <span className="w-2 h-2 rounded-full bg-[#00B894] ring-2 ring-[#6C5CE7] animate-pulse" />
              </button>
              <button
                onClick={() => setActiveScreen('matches')}
                className={`relative transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
                  activeScreen === 'matches' || activeScreen === 'chat' ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-[#FD79A8]' : ''
                }`}
              >
                Matches
                {totalUnread > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-[#FD79A8] text-white shadow-sm">
                    {totalUnread}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveScreen('safety')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
                  activeScreen === 'safety' ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-[#FD79A8]' : ''
                }`}
              >
                Safety Center
              </button>
              <button
                onClick={() => setActiveScreen('user_profile')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
                  activeScreen === 'user_profile' ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-[#FD79A8]' : ''
                }`}
              >
                My Profile
              </button>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveScreen('admin')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
                    activeScreen === 'admin' ? 'text-white font-bold underline underline-offset-4 decoration-2 decoration-[#FD79A8]' : ''
                  }`}
                >
                  Admin Console
                </button>
              )}
            </>
          )}
          {!currentUser && (
            <>
              <button
                onClick={() => setActiveScreen('onboarding')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => setActiveScreen('safety')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Safety & Verification
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: View Mode & Install APK helper */}
        <div className="flex items-center gap-3 shrink-0">
          {/* View mode toggle (Phone frame vs Web full-width) */}
          <div className="hidden lg:flex items-center bg-[#4834D4] rounded-xl p-1 text-xs border border-white/15">
            <button
              onClick={() => setViewMode('mobile')}
              title="Android Mobile Frame Simulation"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-white text-[#4834D4] font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Preview</span>
            </button>
            <button
              onClick={() => setViewMode('responsive')}
              title="Responsive Web Mode"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'responsive'
                  ? 'bg-white text-[#4834D4] font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Web</span>
            </button>
          </div>

          {/* Primary Action Button (APK / How to install) */}
          <button
            onClick={() => setIsApkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#2D3436] bg-white hover:bg-[#F8F9FA] rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>Install / APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, MessageCircle, Shield, User, ShieldAlert, Zap, Camera } from 'lucide-react';
import { Screen } from '../../types';

export const BottomNav: React.FC = () => {
  const { currentUser, activeScreen, setActiveScreen, matches, goingNowBroadcasts } = useApp();

  if (!currentUser) return null;

  const totalUnread = matches.reduce((acc, m) => {
    return acc + (m.userId1 === currentUser.id ? m.unreadCount1 : m.unreadCount2);
  }, 0);

  const navItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
    screen: Screen;
    badge?: number;
    isLive?: boolean;
  }> = [
    {
      id: 'discover',
      label: 'Discover',
      icon: Flame,
      active: activeScreen === 'discover',
      screen: 'discover' as const,
    },
    {
      id: 'snaps',
      label: 'Snaps',
      icon: Camera,
      active: activeScreen === 'snaps',
      screen: 'snaps' as const,
    },
    {
      id: 'live',
      label: 'Live',
      icon: Zap,
      active: activeScreen === 'live',
      screen: 'live' as const,
      isLive: true,
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: MessageCircle,
      active: activeScreen === 'matches' || activeScreen === 'chat',
      screen: 'matches' as const,
      badge: totalUnread > 0 ? totalUnread : undefined,
    },
    {
      id: 'safety',
      label: 'Safety',
      icon: Shield,
      active: activeScreen === 'safety',
      screen: 'safety' as const,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      active: activeScreen === 'user_profile',
      screen: 'user_profile' as const,
    },
  ];

  if (currentUser.role === 'admin') {
    navItems.push({
      id: 'admin',
      label: 'Admin',
      icon: ShieldAlert,
      active: activeScreen === 'admin',
      screen: 'admin' as const,
    });
  }

  const gridColsClass =
    navItems.length === 7
      ? 'grid-cols-7'
      : navItems.length === 6
      ? 'grid-cols-6'
      : navItems.length === 5
      ? 'grid-cols-5'
      : 'grid-cols-4';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E9ECEF] shadow-[0_-4px_25px_rgba(108,92,231,0.08)] pb-safe">
      <div className={`grid ${gridColsClass} items-center h-16 max-w-lg mx-auto px-1.5`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.screen)}
              className="relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all group focus:outline-none cursor-pointer"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-active:scale-90 ${
                    item.active
                      ? 'text-[#6C5CE7] stroke-[2.5]'
                      : 'text-[#636E72] group-hover:text-[#2D3436]'
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#FD79A8] text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
                {item.isLive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00B894] ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  item.active ? 'text-[#6C5CE7] font-bold' : 'text-[#636E72] group-hover:text-[#2D3436]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

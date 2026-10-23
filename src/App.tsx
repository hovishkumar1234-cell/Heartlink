/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { SplashScreen } from './components/screens/SplashScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { PhotoUploadScreen } from './components/screens/PhotoUploadScreen';
import { DiscoverScreen } from './components/screens/DiscoverScreen';
import { MatchesScreen } from './components/screens/MatchesScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { UserProfileScreen } from './components/screens/UserProfileScreen';
import { SafetyCenterScreen } from './components/screens/SafetyCenterScreen';
import { AdminDashboardScreen } from './components/screens/AdminDashboardScreen';
import { LiveConnectionsScreen } from './components/screens/LiveConnectionsScreen';
import { SoundWaveScreen } from './components/screens/SoundWaveScreen';
import { SnapsScreen } from './components/screens/SnapsScreen';
import { MatchCelebrationModal } from './components/screens/MatchCelebrationModal';
import { ApkBuildGuideModal } from './components/modals/ApkBuildGuideModal';
import { PremiumModal } from './components/modals/PremiumModal';
import { CallOverlay } from './components/call/CallOverlay';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeScreen, viewMode, currentUser } = useApp();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'photo_upload':
        return <PhotoUploadScreen />;
      case 'discover':
        return <DiscoverScreen />;
      case 'soundwave':
        return <SoundWaveScreen />;
      case 'snaps':
        return <SnapsScreen />;
      case 'live':
        return <LiveConnectionsScreen />;
      case 'matches':
        return <MatchesScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'user_profile':
        return <UserProfileScreen />;
      case 'safety':
        return <SafetyCenterScreen />;
      case 'admin':
        return <AdminDashboardScreen />;
      default:
        return <DiscoverScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2D3436] flex flex-col selection:bg-[#6C5CE7] selection:text-white">
      {/* Top Header Navbar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-2 sm:px-4 py-3 sm:py-5">
        {/* Android Frame Simulator on Desktop if viewMode === 'mobile' */}
        {viewMode === 'mobile' ? (
          <div className="w-full flex justify-center py-1">
            {/* Phone Container */}
            <div className="w-full max-w-[420px] rounded-[44px] bg-[#FFFFFF] border-[8px] border-[#E9ECEF] shadow-[0_20px_50px_-10px_rgba(108,92,231,0.15)] overflow-hidden flex flex-col relative min-h-[660px] max-h-[calc(100vh-5rem)] h-[820px]">
              {/* Android Status Bar */}
              <div className="w-full bg-[#FFFFFF] text-[#636E72] px-7 pt-3.5 pb-2 flex items-center justify-between text-[11px] font-semibold select-none z-30 border-b border-[#E9ECEF]/60">
                <span>9:45</span>
                {/* Punch Hole Camera */}
                <div className="w-3.5 h-3.5 rounded-full bg-[#2D3436] border border-[#E9ECEF] mx-auto" />
                <div className="flex items-center gap-1.5 text-[#636E72]">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <BatteryMedium className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 overflow-y-auto pb-20 relative bg-[#F8F9FA]">
                {renderScreen()}
              </div>

              {/* Bottom Navigation inside phone frame */}
              {currentUser && <BottomNav />}

              {/* Android Gestural Navigation Bar */}
              <div className="absolute bottom-1 inset-x-0 h-4 flex items-center justify-center pointer-events-none z-50">
                <div className="w-32 h-1 bg-[#636E72]/40 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Full Responsive Web Container */
          <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col pb-20">
            {renderScreen()}
            {currentUser && <BottomNav />}
          </div>
        )}
      </main>

      {/* Overlays & Modals */}
      <CallOverlay />
      <MatchCelebrationModal />
      <ApkBuildGuideModal />
      <PremiumModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

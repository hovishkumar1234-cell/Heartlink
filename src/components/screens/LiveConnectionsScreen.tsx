import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveRoomRoulette } from '../live/LiveRoomRoulette';
import { GoingNowFeed } from '../live/GoingNowFeed';
import { RapidMatchView } from '../live/RapidMatchView';
import { SoundWaveDeck } from '../soundwave/SoundWaveDeck';
import { Radio, Navigation, Zap, Waves } from 'lucide-react';

export const LiveConnectionsScreen: React.FC = () => {
  const { liveRoulette, rapidMatch, goingNowBroadcasts } = useApp();
  const [activeTab, setActiveTab] = useState<'roulette' | 'soundwave' | 'going_now' | 'rapid'>(() => {
    if (liveRoulette.status === 'connected' || liveRoulette.status === 'searching') {
      return 'roulette';
    }
    if (rapidMatch && rapidMatch.status === 'active') {
      return 'rapid';
    }
    return 'roulette';
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 flex flex-col gap-4">
      {/* Top Hub Navigation Tabs */}
      <div className="bg-white rounded-3xl p-1.5 sm:p-2 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('roulette')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roulette'
              ? 'bg-[#6C5CE7] text-white shadow-md'
              : 'text-[#636E72] hover:text-[#2D3436] hover:bg-[#F8F9FA]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Roulette</span>
          {liveRoulette.status === 'connected' && (
            <span className="w-2 h-2 rounded-full bg-[#00B894] animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('soundwave')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'soundwave'
              ? 'bg-[#6C5CE7] text-white shadow-md'
              : 'text-[#636E72] hover:text-[#2D3436] hover:bg-[#F8F9FA]'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>Sound-Wave</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
              activeTab === 'soundwave' ? 'bg-white text-[#6C5CE7]' : 'bg-[#FD79A8] text-white'
            }`}
          >
            BLIND
          </span>
        </button>

        <button
          onClick={() => setActiveTab('going_now')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap relative ${
            activeTab === 'going_now'
              ? 'bg-[#6C5CE7] text-white shadow-md'
              : 'text-[#636E72] hover:text-[#2D3436] hover:bg-[#F8F9FA]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Going Now</span>
          {goingNowBroadcasts.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                activeTab === 'going_now' ? 'bg-white text-[#6C5CE7]' : 'bg-[#FD79A8] text-white'
              }`}
            >
              {goingNowBroadcasts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rapid')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap relative ${
            activeTab === 'rapid'
              ? 'bg-[#6C5CE7] text-white shadow-md'
              : 'text-[#636E72] hover:text-[#2D3436] hover:bg-[#F8F9FA]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Rapid Match</span>
          {rapidMatch && rapidMatch.status === 'active' && (
            <span className="w-2 h-2 rounded-full bg-[#FD79A8] animate-ping" />
          )}
        </button>
      </div>

      {/* Main Tab View */}
      <div className="w-full">
        {activeTab === 'roulette' && <LiveRoomRoulette />}
        {activeTab === 'soundwave' && <SoundWaveDeck />}
        {activeTab === 'going_now' && <GoingNowFeed />}
        {activeTab === 'rapid' && <RapidMatchView />}
      </div>
    </div>
  );
};


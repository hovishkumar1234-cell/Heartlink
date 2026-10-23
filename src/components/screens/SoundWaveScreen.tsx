import React from 'react';
import { useApp } from '../../context/AppContext';
import { SoundWaveDeck } from '../soundwave/SoundWaveDeck';
import { Waves, Sparkles, ArrowLeft, Heart, ShieldCheck } from 'lucide-react';

export const SoundWaveScreen: React.FC = () => {
  const { setActiveScreen } = useApp();

  return (
    <div className="w-full max-w-xl mx-auto px-2 sm:px-4 py-3 flex flex-col gap-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setActiveScreen('discover')}
          className="flex items-center gap-1.5 text-xs font-bold text-[#636E72] hover:text-[#2D3436] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
          <span className="text-xs font-extrabold text-[#6C5CE7]">
            Sound-Wave Blind Date
          </span>
        </div>
      </div>

      {/* Main Sound-Wave Deck */}
      <SoundWaveDeck />
    </div>
  );
};

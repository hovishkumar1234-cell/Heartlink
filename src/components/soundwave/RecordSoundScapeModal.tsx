import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AMBIENT_TRACK_OPTIONS,
  SOUNDWAVE_PROMPTS,
} from '../../data/soundWaveData';
import { AmbientSyncTrack } from '../../types';
import { playAmbientTrack, stopAmbientTrack } from '../../utils/ambientSound';
import { triggerHaptic } from '../../utils/haptics';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  Waves,
} from 'lucide-react';

interface RecordSoundScapeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordSoundScapeModal: React.FC<RecordSoundScapeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { publishUserSoundWave } = useApp();

  const [selectedPrompt, setSelectedPrompt] = useState(SOUNDWAVE_PROMPTS[0]);
  const [selectedAmbient, setSelectedAmbient] = useState<AmbientSyncTrack>('lofi_vinyl');
  const [cadenceLabel, setCadenceLabel] = useState('Warm, Raspy & Thoughtful');
  const [transcript, setTranscript] = useState(
    'My morning routine always starts with fresh pour-over coffee and ambient vinyl records before looking at any screens.'
  );

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopAmbientTrack();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    triggerHaptic('medium');
    setIsRecording(true);
    setRecordedSeconds(0);
    setHasRecorded(false);

    // Play selected ambient track while user speaks
    if (!isAmbientMuted) {
      playAmbientTrack(selectedAmbient, 0.22);
    }

    timerRef.current = setInterval(() => {
      setRecordedSeconds((prev) => {
        if (prev >= 20) {
          handleStopRecording();
          return 20;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    triggerHaptic('success');
    setIsRecording(false);
    setHasRecorded(true);
    stopAmbientTrack();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleTogglePreview = () => {
    if (isPlayingPreview) {
      stopAmbientTrack();
      setIsPlayingPreview(false);
    } else {
      triggerHaptic('light');
      setIsPlayingPreview(true);
      if (!isAmbientMuted) {
        playAmbientTrack(selectedAmbient, 0.3);
      }
      setTimeout(() => {
        stopAmbientTrack();
        setIsPlayingPreview(false);
      }, (recordedSeconds || 15) * 1000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopAmbientTrack();
    publishUserSoundWave(
      selectedPrompt,
      transcript.trim() || 'A 20-second glimpse into my world and favorite sounds.',
      selectedAmbient,
      cadenceLabel
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-[#E9ECEF] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#2D3436]">
                Sound-Wave Studio
              </h3>
              <p className="text-xs text-[#636E72]">
                Record a 20s voice note with synchronized ambient sound
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAmbientTrack();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-[#E9ECEF] flex items-center justify-center text-[#636E72] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Step 1: Pick Quirky Prompt */}
          <div>
            <label className="text-xs font-bold text-[#636E72] uppercase tracking-wider block mb-1.5">
              1. Choose Conversation Prompt:
            </label>
            <select
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-[#E9ECEF] text-xs font-semibold text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none bg-[#F8F9FA]"
            >
              {SOUNDWAVE_PROMPTS.map((p, idx) => (
                <option key={idx} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Pick Ambient Sync Track */}
          <div>
            <label className="text-xs font-bold text-[#636E72] uppercase tracking-wider block mb-1.5">
              2. Ambient Soundscape Sync:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AMBIENT_TRACK_OPTIONS.map((track) => {
                const isSelected = selectedAmbient === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      setSelectedAmbient(track.id);
                      triggerHaptic('light');
                      // Play short audio sample of chosen ambient
                      playAmbientTrack(track.id, 0.25);
                      setTimeout(() => stopAmbientTrack(), 2000);
                    }}
                    className={`text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 ring-2 ring-[#6C5CE7]/20 shadow-xs'
                        : 'border-[#E9ECEF] bg-[#F8F9FA] hover:border-[#6C5CE7]/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">{track.emoji}</span>
                      <span className="text-xs font-extrabold text-[#2D3436] truncate">
                        {track.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#636E72] line-clamp-1">
                      {track.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: 20-Second Voice Recorder Card */}
          <div className="bg-[#18181B] text-white rounded-3xl p-5 text-center relative overflow-hidden flex flex-col items-center">
            {/* Ambient Background Wave effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            {/* Timer counter */}
            <div className="relative z-10 flex items-center justify-between w-full px-2 mb-3">
              <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                {isRecording
                  ? '🎙️ Recording...'
                  : hasRecorded
                  ? '✅ Note Captured'
                  : 'Ready to Record'}
              </span>
              <span
                className={`text-sm font-black px-2.5 py-0.5 rounded-full ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white'
                }`}
              >
                00:{recordedSeconds < 10 ? '0' : ''}
                {recordedSeconds} / 00:20
              </span>
            </div>

            {/* Waveform Visualization Bars */}
            <div className="relative z-10 flex items-center justify-center gap-1.5 h-14 w-full max-w-xs my-2">
              {[40, 70, 95, 60, 85, 50, 90, 65, 80, 55, 100, 75, 45, 90, 70, 50].map(
                (h, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 rounded-full transition-all ${
                      isRecording || isPlayingPreview
                        ? 'bg-gradient-to-t from-[#6C5CE7] to-[#FD79A8] animate-pulse'
                        : hasRecorded
                        ? 'bg-[#00B894]'
                        : 'bg-white/20'
                    }`}
                    style={{
                      height: `${isRecording || isPlayingPreview ? h : Math.max(25, h * 0.4)}%`,
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  />
                )
              )}
            </div>

            {/* Central Action Button */}
            <div className="relative z-10 flex items-center justify-center gap-4 mt-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                >
                  <Mic className="w-7 h-7 fill-white group-hover:scale-110 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
                >
                  <Square className="w-6 h-6 fill-white" />
                </button>
              )}

              {/* Preview Button */}
              {hasRecorded && !isRecording && (
                <button
                  type="button"
                  onClick={handleTogglePreview}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                  title={isPlayingPreview ? 'Pause preview' : 'Play preview'}
                >
                  {isPlayingPreview ? (
                    <Square className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>
              )}
            </div>

            <p className="relative z-10 text-[11px] text-white/60 mt-3">
              {isRecording
                ? 'Speaking with background ambient sound playing...'
                : hasRecorded
                ? 'Tap preview to listen, or record again'
                : 'Tap microphone to start (max 20 seconds)'}
            </p>
          </div>

          {/* Step 4: Transcript or Story Summary */}
          <div>
            <label className="text-xs font-semibold text-[#636E72] block mb-1">
              Live Transcript / Story Caption:
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Write a quick transcript or summary of your voice note..."
              rows={2}
              className="w-full px-3 py-2 rounded-2xl border border-[#E9ECEF] text-xs text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none bg-[#F8F9FA]"
            />
          </div>

          {/* Step 5: Voice Cadence Descriptor */}
          <div>
            <label className="text-xs font-semibold text-[#636E72] block mb-1">
              Your Voice Cadence Vibe:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                'Warm, Raspy & Thoughtful',
                'Bubbly, Melodic & Playful',
                'Calm, Resonant & Velvety',
                'Deep, Grounded & Smooth',
                'Quick-Witted & Energetic',
                'Soft, Intimate & Mellow',
              ].map((cad) => (
                <button
                  key={cad}
                  type="button"
                  onClick={() => setCadenceLabel(cad)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all truncate text-left cursor-pointer ${
                    cadenceLabel === cad
                      ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                      : 'bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]'
                  }`}
                >
                  {cad}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9ECEF]">
            <button
              type="button"
              onClick={() => {
                stopAmbientTrack();
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#636E72] hover:bg-[#F8F9FA] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Publish Soundscape</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

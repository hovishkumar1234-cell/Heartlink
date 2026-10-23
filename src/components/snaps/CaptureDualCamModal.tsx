import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { triggerHaptic } from '../../utils/haptics';
import {
  Camera,
  RotateCcw,
  Sparkles,
  X,
  MapPin,
  Check,
  SwitchCamera,
  Layers,
} from 'lucide-react';

interface CaptureDualCamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaptureDualCamModal: React.FC<CaptureDualCamModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, postDualCameraVibe } = useApp();

  const [caption, setCaption] = useState('');
  const [locationTag, setLocationTag] = useState('San Francisco, CA');
  const [promptLabel, setPromptLabel] = useState("Today's Vibe • Unfiltered Reality");
  const [isSwapped, setIsSwapped] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [isCapturingAnim, setIsCapturingAnim] = useState(false);

  if (!isOpen) return null;

  const selfiePhoto = currentUser?.photos[0] || '';
  const scenePhoto = currentUser?.photos[1] || currentUser?.photos[0] || '';

  const mainPhoto = isSwapped ? selfiePhoto : scenePhoto;
  const pipPhoto = isSwapped ? scenePhoto : selfiePhoto;

  const handleCaptureShutter = () => {
    triggerHaptic('medium');
    setIsCapturingAnim(true);
    setTimeout(() => {
      setIsCapturingAnim(false);
      setHasCaptured(true);
      triggerHaptic('success');
    }, 400);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    postDualCameraVibe(
      caption.trim() || 'Unfiltered moment from right now ✨',
      locationTag.trim() || 'San Francisco, CA',
      promptLabel,
      selfiePhoto,
      scenePhoto
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="bg-[#18181B] text-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-white/10 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] flex items-center justify-center text-white shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Dual-Camera Snap</h3>
              <p className="text-[11px] text-white/60">Front + Rear unfiltered reality</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Viewfinder View */}
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black border-2 border-white/20 shadow-2xl flex items-center justify-center">
          {/* Flash Shutter animation */}
          {isCapturingAnim && (
            <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90" />
          )}

          {/* Main Camera View */}
          <img
            src={mainPhoto}
            alt="Main camera view"
            className="w-full h-full object-cover"
          />

          {/* Picture in Picture (PiP) Inset View */}
          <div
            onClick={() => {
              triggerHaptic('light');
              setIsSwapped(!isSwapped);
            }}
            className="absolute top-4 left-4 w-24 h-32 rounded-xl overflow-hidden border-2 border-white/80 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform z-30 group"
          >
            <img
              src={pipPhoto}
              alt="PiP camera view"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <SwitchCamera className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-1 left-1.5 text-[8px] font-black bg-black/60 text-white px-1 py-0.2 rounded">
              {isSwapped ? 'REAR' : 'FRONT'}
            </span>
          </div>

          {/* Grid Sensor Overlay */}
          <div className="absolute inset-0 pointer-events-none border border-white/10" />

          {/* Time & Unfiltered Stamp */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Unedited
          </div>

          {/* Bottom Viewfinder Controls */}
          {!hasCaptured && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-around px-8 z-30">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsSwapped(!isSwapped);
                }}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
                title="Swap Main / Inset"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              {/* Shutter Ring */}
              <button
                type="button"
                onClick={handleCaptureShutter}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white" />
              </button>

              <div className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Capture Form Options */}
        {hasCaptured && (
          <form onSubmit={handlePublish} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">
                Prompt Vibe Theme:
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  "Today's Vibe • Unfiltered",
                  "What I'm Doing Right Now",
                  "Desk / Studio Chaos",
                  "Coffee & Afternoon Sun",
                ].map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPromptLabel(p)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                      promptLabel === p
                        ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                        : 'bg-white/10 text-white/70 border-white/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">
                Caption your moment:
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Isometric sketch testing and my 2nd cold brew ☕📐"
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#6C5CE7]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">
                Location tag:
              </label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white">
                <MapPin className="w-3.5 h-3.5 text-[#FD79A8]" />
                <input
                  type="text"
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setHasCaptured(false)}
                className="flex items-center gap-1 text-xs text-white/60 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] text-white text-xs font-black shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Post Today's Vibe ✨</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

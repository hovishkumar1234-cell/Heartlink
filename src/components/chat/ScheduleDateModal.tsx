import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_DATE_VENUES } from '../../data/karmaData';
import { triggerHaptic } from '../../utils/haptics';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  X,
  Check,
  Coffee,
  Wine,
  Palette,
  Utensils,
  Footprints,
} from 'lucide-react';

interface ScheduleDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  partnerName: string;
}

export const ScheduleDateModal: React.FC<ScheduleDateModalProps> = ({
  isOpen,
  onClose,
  matchId,
  partnerName,
}) => {
  const { proposeIrlDate } = useApp();

  const [selectedVenue, setSelectedVenue] = useState(SAMPLE_DATE_VENUES[0]);
  const [customVenue, setCustomVenue] = useState('');
  const [useCustomVenue, setUseCustomVenue] = useState(false);
  const [activityType, setActivityType] = useState<
    'coffee' | 'drinks' | 'gallery' | 'dinner' | 'park_walk'
  >('coffee');
  const [dateStr, setDateStr] = useState('2026-10-24');
  const [timeStr, setTimeStr] = useState('15:00');
  const [note, setNote] = useState("First round of pour-overs or flat whites is on me! ☕");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    const venueName = useCustomVenue && customVenue.trim()
      ? customVenue.trim()
      : selectedVenue.name;
    const neighborhood = useCustomVenue
      ? 'San Francisco, CA'
      : selectedVenue.neighborhood;

    const fullDateTime = `${dateStr}T${timeStr}:00Z`;

    proposeIrlDate(
      matchId,
      venueName,
      neighborhood,
      activityType,
      fullDateTime,
      note.trim() || undefined
    );

    onClose();
  };

  const activityIcons = {
    coffee: { icon: Coffee, label: 'Coffee' },
    drinks: { icon: Wine, label: 'Drinks' },
    gallery: { icon: Palette, label: 'Art / Gallery' },
    dinner: { icon: Utensils, label: 'Dinner' },
    park_walk: { icon: Footprints, label: 'Park Walk' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 border border-[#E9ECEF] shadow-2xl flex flex-col gap-4 text-[#2D3436] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#00B894] flex items-center justify-center text-white shadow-sm font-black">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#2D3436]">Plan an IRL Date</h3>
              <p className="text-[11px] text-[#636E72]">
                With <span className="font-bold text-[#6C5CE7]">{partnerName}</span> · Frees active chat slot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-[#E9ECEF] flex items-center justify-center text-[#636E72] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Karma Reward Incentive Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#6C5CE7]/10 via-[#00B894]/10 to-[#FD79A8]/10 border border-[#00B894]/30 flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#00B894] shrink-0" />
          <div className="text-[11px]">
            <p className="font-extrabold text-[#2D3436]">
              +8 Karma & Slot Graduation 🎉
            </p>
            <p className="text-[#636E72] leading-tight mt-0.5">
              Scheduling an in-person date graduates this chat off your 3-limit counter so you can message new matches!
            </p>
          </div>
        </div>

        {/* Activity Type Selector */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636E72] mb-1.5 block">
            Activity Vibe
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {(Object.keys(activityIcons) as Array<keyof typeof activityIcons>).map((key) => {
              const item = activityIcons[key];
              const Icon = item.icon;
              const isSelected = activityType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActivityType(key);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] text-[#6C5CE7] font-bold shadow-2xs'
                      : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#636E72] hover:text-[#2D3436]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] leading-tight text-center">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Venue Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636E72]">
              Suggested Venues (SF)
            </label>
            <button
              type="button"
              onClick={() => setUseCustomVenue(!useCustomVenue)}
              className="text-[10px] font-bold text-[#6C5CE7] hover:underline cursor-pointer"
            >
              {useCustomVenue ? 'Pick curated spot' : 'Custom venue'}
            </button>
          </div>

          {!useCustomVenue ? (
            <div className="space-y-1.5">
              {SAMPLE_DATE_VENUES.map((venue) => {
                const isSelected = selectedVenue.id === venue.id;
                return (
                  <div
                    key={venue.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedVenue(venue);
                      setActivityType(venue.activityType);
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex items-start justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] shadow-2xs'
                        : 'bg-[#F8F9FA] border-[#E9ECEF] hover:bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5">
                        <span>{venue.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#6C5CE7]" />}
                      </p>
                      <p className="text-[10px] text-[#636E72] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#FD79A8]" />
                        <span>{venue.neighborhood}</span>
                        <span>·</span>
                        <span>{venue.vibe}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={customVenue}
              onChange={(e) => setCustomVenue(e.target.value)}
              placeholder="e.g. Blue Bottle Coffee Mint Plaza..."
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
            />
          )}
        </div>

        {/* Date & Time Picker */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636E72] mb-1 block">
              Day
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636E72] mb-1 block">
              Time
            </label>
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636E72] mb-1 block">
            Friendly Opener Note
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a fun note..."
            className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#E9ECEF]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#636E72] font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#00B894] hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            Schedule Date (+8 Karma)
          </button>
        </div>
      </div>
    </div>
  );
};

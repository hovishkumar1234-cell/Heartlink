import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { POLITE_DEPARTURE_TEMPLATES } from '../../data/karmaData';
import { PoliteDepartureTemplate } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { HeartHandshake, Sparkles, X, Check, Send, ShieldCheck } from 'lucide-react';

interface PoliteDepartureModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  partnerName: string;
}

export const PoliteDepartureModal: React.FC<PoliteDepartureModalProps> = ({
  isOpen,
  onClose,
  matchId,
  partnerName,
}) => {
  const { sendPoliteDeparture } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<PoliteDepartureTemplate>(
    POLITE_DEPARTURE_TEMPLATES[0]
  );
  const [customText, setCustomText] = useState(selectedTemplate.messageText);
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (t: PoliteDepartureTemplate) => {
    triggerHaptic('light');
    setSelectedTemplate(t);
    setCustomText(t.messageText);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    sendPoliteDeparture(matchId, selectedTemplate.id, customText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 border border-[#E9ECEF] shadow-2xl flex flex-col gap-4 text-[#2D3436] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FD79A8] to-[#00B894] flex items-center justify-center text-white shadow-sm font-black">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#2D3436]">Polite 1-Tap Departure</h3>
              <p className="text-[11px] text-[#636E72]">
                Courteous closure with <span className="font-bold text-[#6C5CE7]">{partnerName}</span>
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
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#00B894]/15 via-[#6C5CE7]/10 to-[#FD79A8]/10 border border-[#00B894]/30 flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#00B894] shrink-0" />
          <div className="text-[11px]">
            <p className="font-extrabold text-[#2D3436]">
              +{selectedTemplate.karmaBonus} Karma & Zero-Ghost Badge ✨
            </p>
            <p className="text-[#636E72] leading-tight mt-0.5">
              Courteous departures eliminate ghosting, keep dating healthy, and free 1 of your 3 chat slots immediately!
            </p>
          </div>
        </div>

        {/* Departure Reasons List */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636E72] mb-1.5 block">
            Select 1-Tap Message
          </label>
          <div className="space-y-1.5">
            {POLITE_DEPARTURE_TEMPLATES.map((t) => {
              const isSelected = selectedTemplate.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#00B894]/10 border-[#00B894] shadow-2xs'
                      : 'bg-[#F8F9FA] border-[#E9ECEF] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5">
                        <span>{t.title}</span>
                      </p>
                      <p className="text-[10px] text-[#00B894] font-bold">
                        +{t.karmaBonus} Karma Bonus
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#00B894]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Preview / Custom Editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636E72]">
              Message Sent to {partnerName}
            </label>
            <button
              type="button"
              onClick={() => setIsEditingCustom(!isEditingCustom)}
              className="text-[10px] font-bold text-[#6C5CE7] hover:underline cursor-pointer"
            >
              {isEditingCustom ? 'Reset Template' : 'Edit note'}
            </button>
          </div>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-3 text-xs text-[#2D3436] leading-relaxed focus:outline-none focus:border-[#00B894] resize-none"
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
            onClick={handleSend}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00B894] to-[#6C5CE7] hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send & Free Slot (+{selectedTemplate.karmaBonus})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

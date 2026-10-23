import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { triggerHaptic } from '../../utils/haptics';
import { Share2, Smartphone, Sparkles, X, Check, Instagram, MessageSquare, Linkedin } from 'lucide-react';

interface MoveToSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  partnerName: string;
}

export const MoveToSocialsModal: React.FC<MoveToSocialsModalProps> = ({
  isOpen,
  onClose,
  matchId,
  partnerName,
}) => {
  const { exchangeSocials, currentUser } = useApp();

  const [instagramHandle, setInstagramHandle] = useState('@maya.patel.design');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '+1 (415) 555-0192');
  const [includeInstagram, setIncludeInstagram] = useState(true);
  const [includePhone, setIncludePhone] = useState(true);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(false);
  const [linkedinHandle, setLinkedinHandle] = useState('linkedin.com/in/mayapatel');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    const platforms: Array<{ platform: 'instagram' | 'whatsapp' | 'phone' | 'linkedin'; handle: string }> = [];

    if (includeInstagram && instagramHandle.trim()) {
      platforms.push({ platform: 'instagram', handle: instagramHandle.trim() });
    }
    if (includePhone && phoneNumber.trim()) {
      platforms.push({ platform: 'phone', handle: phoneNumber.trim() });
    }
    if (includeLinkedIn && linkedinHandle.trim()) {
      platforms.push({ platform: 'linkedin', handle: linkedinHandle.trim() });
    }

    if (platforms.length === 0) {
      platforms.push({ platform: 'instagram', handle: '@maya.patel' });
    }

    exchangeSocials(matchId, platforms);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 border border-[#E9ECEF] shadow-2xl flex flex-col gap-4 text-[#2D3436] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] flex items-center justify-center text-white shadow-sm font-black">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#2D3436]">Move to Socials</h3>
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
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FD79A8]/10 via-[#6C5CE7]/10 to-[#00B894]/10 border border-[#FD79A8]/30 flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#FD79A8] shrink-0" />
          <div className="text-[11px]">
            <p className="font-extrabold text-[#2D3436]">
              +5 Karma & Slot Graduation 📲
            </p>
            <p className="text-[#636E72] leading-tight mt-0.5">
              Taking your connection off-app frees up 1 of your 3 chat slots so you can connect with someone new.
            </p>
          </div>
        </div>

        {/* Platform Choices */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Instagram */}
          <div className="p-3 rounded-2xl border border-[#E9ECEF] bg-[#F8F9FA] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D3436]">
                <Instagram className="w-4 h-4 text-[#FD79A8]" />
                <span>Instagram</span>
              </div>
              <input
                type="checkbox"
                checked={includeInstagram}
                onChange={(e) => setIncludeInstagram(e.target.checked)}
                className="rounded accent-[#6C5CE7] w-4 h-4 cursor-pointer"
              />
            </div>
            {includeInstagram && (
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full bg-white border border-[#E9ECEF] rounded-xl px-3 py-1.5 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
              />
            )}
          </div>

          {/* WhatsApp / Phone */}
          <div className="p-3 rounded-2xl border border-[#E9ECEF] bg-[#F8F9FA] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D3436]">
                <Smartphone className="w-4 h-4 text-[#00B894]" />
                <span>Phone / WhatsApp</span>
              </div>
              <input
                type="checkbox"
                checked={includePhone}
                onChange={(e) => setIncludePhone(e.target.checked)}
                className="rounded accent-[#6C5CE7] w-4 h-4 cursor-pointer"
              />
            </div>
            {includePhone && (
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-white border border-[#E9ECEF] rounded-xl px-3 py-1.5 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
              />
            )}
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
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              Graduate & Free Slot (+5)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

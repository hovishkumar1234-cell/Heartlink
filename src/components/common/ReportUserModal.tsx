import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { triggerHaptic } from '../../utils/haptics';
import { ShieldAlert, X, Flag, UserX, Check, Lock } from 'lucide-react';
import { User, UserReport } from '../../types';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: Pick<User, 'id' | 'name' | 'photos' | 'occupation' | 'isVerified'> | null;
  onSuccess?: () => void;
}

const REPORT_REASONS: { id: UserReport['reason']; label: string; desc: string }[] = [
  {
    id: 'harassment',
    label: 'Harassment or Offensive Behavior',
    desc: 'Unwanted advances, hate speech, bullying, or abusive messaging.',
  },
  {
    id: 'fake_profile',
    label: 'Fake Profile or Impersonation',
    desc: 'Using stolen photographs, bot activity, or misrepresenting identity.',
  },
  {
    id: 'inappropriate_photos',
    label: 'Inappropriate or Explicit Photos',
    desc: 'Nudity, sexually explicit content, or dangerous behavior in photos.',
  },
  {
    id: 'underage',
    label: 'Suspected Underage Member (<18)',
    desc: 'HeartLink is strictly 18+. Report any profile suspected of being a minor.',
  },
  {
    id: 'scam',
    label: 'Scam, Commercial Spam, or Solicitation',
    desc: 'Directing to external payment apps, crypto, or commercial services.',
  },
  {
    id: 'other',
    label: 'Other Safety Concern',
    desc: 'Any behavior that makes you feel unsafe or violates community rules.',
  },
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}) => {
  const { reportUser, blockUser, showToast } = useApp();

  const [selectedReason, setSelectedReason] = useState<UserReport['reason']>('harassment');
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      reportUser(targetUser.id, selectedReason, details.trim());

      if (alsoBlock) {
        blockUser(targetUser.id);
      }

      showToast(`Report filed against ${targetUser.name}. Thank you for protecting the community.`, 'success');
      onSuccess?.();
      onClose();
    } catch {
      showToast('Could not submit report. Please try again.', 'alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white border border-[#E9ECEF] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl flex flex-col text-[#2D3436]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-sm font-bold text-[#2D3436]">
                Report {targetUser.name}
              </h2>
              <span className="text-[11px] text-[#636E72]">Trust & Safety Moderation</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#636E72] hover:text-[#2D3436] rounded-lg hover:bg-[#F8F9FA] transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Summary */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] mb-4">
          <img
            src={targetUser.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={targetUser.name}
            className="w-11 h-11 rounded-xl object-cover border border-[#E9ECEF] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#2D3436] truncate">{targetUser.name}</p>
            <p className="text-[11px] text-[#636E72] truncate">{targetUser.occupation || 'HeartLink Member'}</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#00B894] font-semibold bg-[#00B894]/10 border border-[#00B894]/25 px-2 py-1 rounded-md">
            <Lock className="w-3 h-3 text-[#00B894]" />
            <span>Confidential</span>
          </div>
        </div>

        {/* Reason selection form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2D3436] mb-2">
              Select Violation Reason
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {REPORT_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedReason(r.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 border-red-300 text-red-900 shadow-xs'
                        : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#2D3436] hover:bg-[#E9ECEF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold">{r.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#636E72] leading-snug">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional context */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3436] mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell our moderation team what happened..."
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Block option */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] cursor-pointer">
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-red-600 bg-white border-[#E9ECEF] cursor-pointer accent-red-600"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#2D3436] flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-[#636E72]" />
                Also block {targetUser.name}
              </span>
              <p className="text-[11px] text-[#636E72] mt-0.5">
                They will no longer appear in your Discovery feed, search, or messages.
              </p>
            </div>
          </label>

          {/* Privacy Note */}
          <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-[11px] text-[#636E72] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Your report is completely anonymous. The user will never know who submitted the report.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-xs font-semibold text-[#636E72] hover:text-[#2D3436] hover:bg-[#E9ECEF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

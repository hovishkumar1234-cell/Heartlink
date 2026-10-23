import React, { useState } from 'react';
import { Check, ShieldCheck, X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  interactive?: boolean;
  className?: string;
  userName?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  showLabel = false,
  interactive = true,
  className = '',
  userName = 'Member',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Size mappings
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 text-[9px]',
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
  };

  const iconSizes = {
    xs: 'w-2 h-2 stroke-[3]',
    sm: 'w-2.5 h-2.5 stroke-[3]',
    md: 'w-3 h-3 stroke-[3]',
    lg: 'w-3.5 h-3.5 stroke-[3]',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    triggerHaptic('light');
    setShowTooltip((prev) => !prev);
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* Badge Button/Icon */}
      <span
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
        title="Authenticated via HeartLink Trust & Safety Moderation"
        className={`relative ${sizeClasses[size]} rounded-full bg-[#00B894] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,184,148,0.4)] hover:scale-110 active:scale-95 transition-all ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        } focus:outline-none shrink-0`}
      >
        <Check className={`${iconSizes[size]} relative z-10 stroke-[3]`} />
      </span>

      {/* Optional Verified Text Label */}
      {showLabel && (
        <span className="text-[11px] font-bold text-[#00B894] tracking-tight flex items-center gap-1">
          <span>Verified</span>
        </span>
      )}

      {/* Interactive Verification Certificate Popover Modal */}
      {showTooltip && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_12px_35px_rgba(108,92,231,0.15)] text-left backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E9ECEF]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D3436]">
              <ShieldCheck className="w-4 h-4 text-[#00B894]" />
              <span>Identity Authenticated</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="p-0.5 text-[#636E72] hover:text-[#2D3436] rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Details */}
          <p className="text-[11px] text-[#636E72] leading-relaxed mb-2.5">
            <span className="text-[#2D3436] font-semibold">{userName}</span> has passed HeartLink's multi-point biometric selfie pose verification and photo moderation review.
          </p>

          <div className="flex items-center justify-between text-[10px] text-[#636E72] pt-1.5 border-t border-[#E9ECEF]/60">
            <span>Trust & Safety Audit</span>
            <span className="text-[#00B894] font-bold flex items-center gap-0.5">
              <Check className="w-3 h-3 stroke-[3]" /> Active
            </span>
          </div>

          {/* Arrow indicator */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 bg-white border-r border-b border-[#E9ECEF] rotate-45" />
        </div>
      )}
    </div>
  );
};

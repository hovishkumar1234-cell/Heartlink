import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DoodlePath, DoodlePoint } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import {
  X,
  Send,
  Trash2,
  Undo2,
  Clock,
  Sparkles,
  Camera,
  Smile,
  Palette,
  Check,
} from 'lucide-react';

interface DisappearingSnapCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMatchId?: string;
}

const DOODLE_COLORS = [
  { label: 'Indigo', value: '#6C5CE7' },
  { label: 'Blush', value: '#FD79A8' },
  { label: 'Mint', value: '#00B894' },
  { label: 'Amber', value: '#FDCB6E' },
  { label: 'White', value: '#FFFFFF' },
];

const STICKER_CHOICES = ['🔥', '☕', '🎨', '🎷', '👀', '✨', '🍕', '🚀', '💫', '🥑'];

export const DisappearingSnapCreatorModal: React.FC<DisappearingSnapCreatorModalProps> = ({
  isOpen,
  onClose,
  targetMatchId,
}) => {
  const { currentUser, matches, users, sendSelfDestructSnap, showToast } = useApp();

  const [selectedMatchId, setSelectedMatchId] = useState<string>(targetMatchId || '');
  const [caption, setCaption] = useState('');
  const [selectedColor, setSelectedColor] = useState(DOODLE_COLORS[1].value); // Blush Pink
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [activeSticker, setActiveSticker] = useState<string | null>('✨');
  const [viewDurationSeconds, setViewDurationSeconds] = useState<number>(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DoodlePoint[]>([]);
  const [completedPaths, setCompletedPaths] = useState<DoodlePath[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Set initial selected match if targetMatchId provided or fallback to first match
  useEffect(() => {
    if (targetMatchId) {
      setSelectedMatchId(targetMatchId);
    } else if (matches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(matches[0].id);
    }
  }, [targetMatchId, matches]);

  // Redraw canvas whenever completedPaths or currentPath changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed paths
    completedPaths.forEach((path) => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current active path
    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  }, [completedPaths, currentPath, selectedColor, strokeWidth]);

  if (!isOpen) return null;

  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const partnerId = currentMatch
    ? currentMatch.userId1 === currentUser?.id
      ? currentMatch.userId2
      : currentMatch.userId1
    : null;
  const partner = users.find((u) => u.id === partnerId);

  const defaultPhoto = currentUser?.photos[0] || '';

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): DoodlePoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pt = getCanvasCoords(e);
    setCurrentPath([pt]);
  };

  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getCanvasCoords(e);
    setCurrentPath((prev) => [...prev, pt]);
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      setCompletedPaths((prev) => [
        ...prev,
        {
          color: selectedColor,
          strokeWidth,
          points: currentPath,
        },
      ]);
      triggerHaptic('light');
    }
    setCurrentPath([]);
  };

  const handleUndo = () => {
    triggerHaptic('light');
    setCompletedPaths((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    triggerHaptic('medium');
    setCompletedPaths([]);
  };

  const handleSendSnap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch) {
      showToast('Please select a match first', 'alert');
      return;
    }

    sendSelfDestructSnap(
      currentMatch.id,
      'photo',
      defaultPhoto,
      caption.trim() || undefined,
      completedPaths.length > 0 ? completedPaths : undefined,
      activeSticker || undefined,
      viewDurationSeconds
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#18181B] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="p-3 bg-black/60 flex items-center justify-between text-white border-b border-white/10 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FD79A8] animate-pulse" />
            <div>
              <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Self-Destructing Snap</span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#FD79A8]/20 text-[#FD79A8] text-[9px] font-bold">
                  Vanishes
                </span>
              </h3>
              <p className="text-[10px] text-white/60">Doodle & send ephemeral media</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recipient Picker if multiple matches */}
        {matches.length > 1 && (
          <div className="px-3 py-1.5 bg-black/40 border-b border-white/10 flex items-center gap-2 overflow-x-auto text-[11px] text-white/80 scrollbar-none z-20">
            <span className="text-[10px] text-white/50 shrink-0 font-semibold">To:</span>
            {matches.map((m) => {
              const pId = m.userId1 === currentUser?.id ? m.userId2 : m.userId1;
              const p = users.find((u) => u.id === pId);
              if (!p) return null;
              const isSelected = m.id === selectedMatchId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedMatchId(m.id);
                  }}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#6C5CE7] text-white font-bold shadow-xs'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <img
                    src={p.photos[0]}
                    alt={p.name}
                    className="w-3.5 h-3.5 rounded-full object-cover"
                  />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Viewfinder Canvas Area */}
        <div className="relative flex-1 w-full aspect-[9/13] bg-black overflow-hidden flex items-center justify-center">
          {/* Background Photo */}
          <img
            src={defaultPhoto}
            alt="Snap Backdrop"
            className="w-full h-full object-cover select-none pointer-events-none filter brightness-90"
          />

          {/* Interactive Drawing Canvas */}
          <canvas
            ref={canvasRef}
            width={340}
            height={490}
            onMouseDown={handleStartDraw}
            onMouseMove={handleMoveDraw}
            onMouseUp={handleEndDraw}
            onTouchStart={handleStartDraw}
            onTouchMove={handleMoveDraw}
            onTouchEnd={handleEndDraw}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
          />

          {/* Active Sticker Overlay */}
          {activeSticker && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl pointer-events-none select-none z-15 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {activeSticker}
            </div>
          )}

          {/* Canvas Tools Floating Controls Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            {completedPaths.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-md active:scale-90 cursor-pointer"
                  title="Undo stroke"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-red-400 flex items-center justify-center shadow-md active:scale-90 cursor-pointer"
                  title="Clear doodle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Duration Timer Badge */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-white text-[11px] font-bold">
            <Clock className="w-3 h-3 text-[#00B894]" />
            <span>Expires in {viewDurationSeconds}s</span>
          </div>
        </div>

        {/* Doodle Ink Color Palette Strip */}
        <div className="px-3 py-2 bg-[#202024] border-t border-white/10 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Ink:</span>
            {DOODLE_COLORS.map((col) => (
              <button
                key={col.value}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedColor(col.value);
                }}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                  selectedColor === col.value
                    ? 'scale-125 ring-2 ring-white border-transparent'
                    : 'border-white/30 hover:scale-110'
                }`}
                style={{ backgroundColor: col.value }}
                title={col.label}
              />
            ))}
          </div>

          {/* Expiry Selector (3s, 5s, 10s) */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-white text-[10px] font-bold">
            {[3, 5, 10].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setViewDurationSeconds(sec);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  viewDurationSeconds === sec
                    ? 'bg-[#FD79A8] text-white shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Sticker Emoji Quick Picker */}
        <div className="px-3 py-1.5 bg-[#18181B] border-t border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-20">
          <span className="text-[10px] text-white/50 shrink-0 font-bold">Sticker:</span>
          <button
            type="button"
            onClick={() => setActiveSticker(null)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold cursor-pointer ${
              activeSticker === null ? 'bg-white/20 text-white' : 'text-white/40'
            }`}
          >
            None
          </button>
          {STICKER_CHOICES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveSticker(emoji);
              }}
              className={`p-1 rounded-lg text-sm transition-transform cursor-pointer ${
                activeSticker === emoji ? 'scale-125 bg-white/20' : 'hover:scale-110 opacity-70'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Bottom Form Actions */}
        <form onSubmit={handleSendSnap} className="p-3 bg-[#18181B] border-t border-white/10 flex items-center gap-2 z-20">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`Add a quick doodle caption...`}
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FD79A8] transition-colors"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FD79A8] to-[#6C5CE7] hover:from-[#e84393] hover:to-[#4834D4] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(253,121,168,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Snap</span>
          </button>
        </form>
      </div>
    </div>
  );
};

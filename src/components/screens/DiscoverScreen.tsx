import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Heart,
  Star,
  RotateCcw,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronUp,
  Check,
  Loader2,
  RefreshCw,
  Flag,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { User, RelationshipGoal, FilterOptions } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { fetchDiscoveryBatch } from '../../services/discoveryService';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ReportUserModal } from '../common/ReportUserModal';

export const DiscoverScreen: React.FC = () => {
  const {
    currentUser,
    likeUser,
    passUser,
    rewindLastAction,
    lastAction,
    filters,
    setFilters,
    setIsPremiumModalOpen,
    setActiveScreen,
    goingNowBroadcasts,
  } = useApp();

  // In-memory batch queue (max 10 active items for memory efficiency)
  const [profilesQueue, setProfilesQueue] = useState<User[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [reportingUser, setReportingUser] = useState<User | null>(null);

  // Draft filters for modal
  const [draftFilters, setDraftFilters] = useState<FilterOptions>(filters);

  // Pagination & Data-fetching states
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);

  const hasTriggeredDragHapticRef = useRef<'like' | 'pass' | null>(null);
  const isFetchingRef = useRef(false);

  // Compute a unique key for the current active filter set to trigger layout transitions
  const filterKey = `filter_${filters.ageRange.join('-')}_${filters.maxDistanceKm}_${filters.verifiedOnly}_${filters.goalFilter}`;

  // Motion values for interactive horizontal drag gestures
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-18, 0, 18]);
  const opacity = useTransform(x, [-300, -180, 0, 180, 300], [0.4, 0.9, 1, 0.9, 0.4]);
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const passOpacity = useTransform(x, [-20, -110], [0, 1]);
  const likeScale = useTransform(x, [20, 110], [0.85, 1.1]);
  const passScale = useTransform(x, [-20, -110], [0.85, 1.1]);

  // Next card in deck reacts dynamically to active card drag
  const nextCardScale = useTransform(x, [-180, 0, 180], [1, 0.95, 1]);
  const nextCardOpacity = useTransform(x, [-180, 0, 180], [0.95, 0.6, 0.95]);

  // Active cards in current view deck
  const activeCard: User | undefined = profilesQueue[0];
  const nextCard: User | undefined = profilesQueue[1];

  // Fetch a batch of 10 profiles
  const loadBatch = useCallback(
    async (pageToLoad: number, append = false) => {
      if (!currentUser || isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoadingBatch(true);

      const excludedUserIds = new Set<string>([
        currentUser.id,
        ...currentUser.likedUserIds,
        ...currentUser.passedUserIds,
        ...currentUser.blockedUserIds,
      ]);

      try {
        const result = await fetchDiscoveryBatch({
          page: pageToLoad,
          batchSize: 10,
          currentUserId: currentUser.id,
          filters,
          excludedUserIds,
        });

        setHasMore(result.hasMore);
        setTotalFilteredCount(result.totalFilteredCount);
        setCurrentPage(pageToLoad);

        setProfilesQueue((prev) => {
          if (!append) return result.profiles;
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = result.profiles.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newUnique];
        });
      } catch (err) {
        console.error('Error fetching discovery batch:', err);
      } finally {
        setIsLoadingBatch(false);
        setIsInitialLoading(false);
        isFetchingRef.current = false;
      }
    },
    [currentUser, filters]
  );

  // Initial load and filter change trigger: fetch fresh batch of 10
  useEffect(() => {
    setIsInitialLoading(true);
    setProfilesQueue([]);
    loadBatch(0, false);
  }, [filters, currentUser?.id, loadBatch]);

  // Sync draft filters when modal opens
  useEffect(() => {
    if (showFilterModal) {
      setDraftFilters(filters);
    }
  }, [showFilterModal, filters]);

  // Proactive background pre-fetching
  useEffect(() => {
    if (profilesQueue.length <= 3 && hasMore && !isLoadingBatch && !isInitialLoading) {
      loadBatch(currentPage + 1, true);
    }
  }, [profilesQueue.length, hasMore, isLoadingBatch, isInitialLoading, currentPage, loadBatch]);

  // Reset photo index and motion values when active card changes
  useEffect(() => {
    setActivePhotoIndex(0);
    x.set(0);
    hasTriggeredDragHapticRef.current = null;
  }, [activeCard?.id, x]);

  // Real-time drag threshold haptic tick
  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      if (hasTriggeredDragHapticRef.current !== 'like') {
        triggerHaptic('light');
        hasTriggeredDragHapticRef.current = 'like';
      }
    } else if (info.offset.x < -threshold) {
      if (hasTriggeredDragHapticRef.current !== 'pass') {
        triggerHaptic('light');
        hasTriggeredDragHapticRef.current = 'pass';
      }
    } else {
      hasTriggeredDragHapticRef.current = null;
    }
  };

  // Pop active card from memory queue after action
  const advanceQueue = (cardId: string) => {
    setProfilesQueue((prev) => prev.filter((p) => p.id !== cardId));
  };

  // Handle Drag End with velocity & distance thresholding
  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!activeCard) return;

    const threshold = 100;
    const velocityThreshold = 450;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      // Swiped Right -> LIKE
      triggerHaptic('medium');
      await animate(x, 400, { duration: 0.22, ease: 'easeOut' });
      likeUser(activeCard.id, false);
      advanceQueue(activeCard.id);
      x.set(0);
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      // Swiped Left -> PASS
      triggerHaptic('light');
      await animate(x, -400, { duration: 0.22, ease: 'easeOut' });
      passUser(activeCard.id);
      advanceQueue(activeCard.id);
      x.set(0);
    } else {
      // Snap back to neutral center
      animate(x, 0, { type: 'spring', stiffness: 350, damping: 26 });
    }
    hasTriggeredDragHapticRef.current = null;
  };

  const handleLike = async () => {
    if (!activeCard) return;
    triggerHaptic('medium');
    await animate(x, 400, { duration: 0.22, ease: 'easeOut' });
    likeUser(activeCard.id, false);
    advanceQueue(activeCard.id);
    x.set(0);
  };

  const handlePass = async () => {
    if (!activeCard) return;
    triggerHaptic('light');
    await animate(x, -400, { duration: 0.22, ease: 'easeOut' });
    passUser(activeCard.id);
    advanceQueue(activeCard.id);
    x.set(0);
  };

  const handleSuperLike = async () => {
    if (!activeCard) return;
    triggerHaptic('success');
    likeUser(activeCard.id, true);
    advanceQueue(activeCard.id);
    x.set(0);
  };

  const handleRewind = () => {
    triggerHaptic('light');
    rewindLastAction();
    loadBatch(0, false);
  };

  // Apply draft filters with haptic and layout animation trigger
  const handleApplyPreferences = () => {
    triggerHaptic('medium');
    setFilters(draftFilters);
    setShowFilterModal(false);
  };

  const removeGoalFilter = () => {
    triggerHaptic('light');
    setFilters((prev) => ({ ...prev, goalFilter: 'all' }));
  };

  const toggleVerifiedFilter = () => {
    triggerHaptic('light');
    setFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }));
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDetailModal || showFilterModal) return;
      if (e.key === 'ArrowRight') handleLike();
      if (e.key === 'ArrowLeft') handlePass();
      if (e.key === 'ArrowUp') handleSuperLike();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCard, showDetailModal, showFilterModal]);

  const calculateSharedInterests = (targetInterests: string[]): string[] => {
    if (!currentUser) return [];
    return targetInterests.filter((interest) => currentUser.interests.includes(interest));
  };

  const hasCustomFilters =
    filters.verifiedOnly ||
    filters.goalFilter !== 'all' ||
    filters.maxDistanceKm < 50 ||
    filters.ageRange[0] > 18 ||
    filters.ageRange[1] < 55;

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-between p-3 sm:p-4 max-w-md mx-auto">
      {/* Top Discover Bar: Batch status, reload, and filter */}
      <motion.div layout className="w-full flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          {isLoadingBatch && (
            <Loader2 className="w-3.5 h-3.5 text-[#6C5CE7] animate-spin" />
          )}
          <span className="text-xs font-semibold text-[#636E72]">
            {profilesQueue.length > 0 ? (
              <>
                <span className="text-[#6C5CE7] font-bold">{profilesQueue.length}</span> in batch ·{' '}
                <span className="tabular-nums font-medium text-[#2D3436]">{totalFilteredCount}</span> total matches
              </>
            ) : isInitialLoading ? (
              'Retrieving batch of 10...'
            ) : (
              'All caught up'
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('light');
              loadBatch(0, false);
            }}
            title="Reload fresh discovery batch"
            className="p-1.5 rounded-xl bg-white hover:bg-[#F8F9FA] border border-[#E9ECEF] text-[#636E72] hover:text-[#2D3436] shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBatch ? 'animate-spin text-[#6C5CE7]' : ''}`} />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setShowFilterModal(true);
            }}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F9FA] border border-[#E9ECEF] text-xs font-semibold text-[#2D3436] shadow-xs transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>Filters</span>
            {hasCustomFilters && (
              <span className="w-2 h-2 rounded-full bg-[#6C5CE7] shadow-[0_0_6px_rgba(108,92,231,0.6)]" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Discovery Mode Trio Launch Bar: Sound-Wave, Today's Vibe, & Live Radar */}
      <div className="w-full mb-2 grid grid-cols-3 gap-1.5 sm:gap-2">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveScreen('soundwave');
          }}
          className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-[#6C5CE7]/10 to-[#FD79A8]/10 border border-[#6C5CE7]/30 hover:border-[#6C5CE7] flex items-center justify-between text-left shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-sm shrink-0">🌊</span>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] font-black text-[#2D3436] truncate">Voice</span>
                <span className="px-1 py-0.2 rounded bg-[#6C5CE7] text-white text-[7px] font-extrabold uppercase">
                  Wave
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-[#636E72] block truncate">Blind audio</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveScreen('snaps');
          }}
          className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-[#FD79A8]/10 to-[#6C5CE7]/10 border border-[#FD79A8]/30 hover:border-[#FD79A8] flex items-center justify-between text-left shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-sm shrink-0">📸</span>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] font-black text-[#2D3436] truncate">Vibe</span>
                <span className="px-1 py-0.2 rounded bg-[#FD79A8] text-white text-[7px] font-extrabold uppercase">
                  Snaps
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-[#636E72] block truncate">Dual-cam & AR</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveScreen('live');
          }}
          className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-[#00B894]/10 to-[#6C5CE7]/10 border border-[#00B894]/30 hover:border-[#00B894] flex items-center justify-between text-left shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-sm shrink-0">⚡</span>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] font-black text-[#2D3436] truncate">Live</span>
                <span className="px-1 py-0.2 rounded bg-[#00B894] text-white text-[7px] font-extrabold uppercase">
                  Now
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-[#636E72] block truncate">Roulette</span>
            </div>
          </div>
        </button>
      </div>

      {/* Animated Active Filters Badges Strip */}
      <motion.div
        layout
        className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-1 text-[11px]"
      >
        <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E9ECEF] text-[#636E72] whitespace-nowrap shadow-xs">
          {filters.ageRange[0]}–{filters.ageRange[1]} yrs
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E9ECEF] text-[#636E72] whitespace-nowrap shadow-xs">
          ≤ {filters.maxDistanceKm} km
        </span>
        {filters.verifiedOnly && (
          <motion.button
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleVerifiedFilter}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 text-[#6C5CE7] font-bold whitespace-nowrap hover:bg-[#6C5CE7]/20 transition-colors cursor-pointer"
          >
            <span>Verified only</span>
            <X className="w-3 h-3" />
          </motion.button>
        )}
        {filters.goalFilter !== 'all' && (
          <motion.button
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={removeGoalFilter}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 text-[#6C5CE7] font-bold whitespace-nowrap hover:bg-[#6C5CE7]/20 transition-colors capitalize cursor-pointer"
          >
            <span>{filters.goalFilter.replace('-', ' ')}</span>
            <X className="w-3 h-3" />
          </motion.button>
        )}
      </motion.div>

      {/* Main Card Viewport / Deck Container with Layout Animations */}
      <div className="relative w-full aspect-[3/4.2] max-h-[68vh] overflow-hidden">
        {/* Layout Animated Deck Transition Container */}
        <AnimatePresence mode="wait">
          {isInitialLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full rounded-3xl border border-[#E9ECEF] bg-white p-5 flex flex-col justify-end overflow-hidden relative shadow-[0_8px_30px_rgba(108,92,231,0.08)]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F8F9FA] via-[#F1F2F6] to-[#F8F9FA] animate-pulse" />
              <div className="relative z-10 space-y-3">
                <div className="w-48 h-6 bg-[#E9ECEF] rounded-lg animate-pulse" />
                <div className="w-32 h-4 bg-[#E9ECEF]/80 rounded-md animate-pulse" />
                <div className="w-full h-12 bg-[#E9ECEF]/60 rounded-xl animate-pulse" />
              </div>
            </motion.div>
          ) : activeCard ? (
            <motion.div
              key={filterKey}
              layout
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full"
            >
              {/* Next Card In Deck (Physical Deck Effect) */}
              {nextCard && (
                <motion.div
                  style={{ scale: nextCardScale, opacity: nextCardOpacity }}
                  className="absolute inset-0 rounded-3xl overflow-hidden border border-[#E9ECEF] bg-white shadow-md pointer-events-none select-none z-0 translate-y-2"
                >
                  <img
                    src={nextCard.photos[0]}
                    alt={nextCard.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>
                        {nextCard.name}, <span className="tabular-nums font-semibold">{nextCard.age}</span>
                      </span>
                      {nextCard.isVerified && (
                        <VerifiedBadge size="sm" userName={nextCard.name} interactive={false} />
                      )}
                    </h3>
                    <p className="text-xs text-white/80">
                      {nextCard.occupation} · {nextCard.location.city}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Active Card with Horizontal Drag Gestures */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{ x, rotate, opacity }}
                className="relative w-full h-full rounded-3xl overflow-hidden border border-[#E9ECEF] bg-white shadow-[0_8px_30px_rgba(108,92,231,0.08)] select-none z-10 cursor-grab active:cursor-grabbing"
              >
                {/* Dynamic Visual Drag Stamps */}
                <motion.div
                  style={{ opacity: likeOpacity, scale: likeScale }}
                  className="absolute top-8 left-6 z-30 pointer-events-none border-3 border-[#FD79A8] text-[#FD79A8] font-black text-2xl tracking-widest px-4 py-1 rounded-2xl -rotate-12 shadow-[0_8px_25px_rgba(253,121,168,0.5)] bg-white/90 backdrop-blur-sm"
                >
                  LIKE
                </motion.div>

                <motion.div
                  style={{ opacity: passOpacity, scale: passScale }}
                  className="absolute top-8 right-6 z-30 pointer-events-none border-3 border-rose-500 text-rose-500 font-black text-2xl tracking-widest px-4 py-1 rounded-2xl rotate-12 shadow-[0_8px_25px_rgba(244,63,94,0.4)] bg-white/90 backdrop-blur-sm"
                >
                  PASS
                </motion.div>

                {/* Photo Pagination Indicator Bars */}
                {activeCard.photos.length > 1 && (
                  <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5 pointer-events-none">
                    {activeCard.photos.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i === activePhotoIndex ? 'bg-[#6C5CE7] shadow-[0_0_8px_rgba(108,92,231,0.6)]' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Photo with tap zones to cycle pictures */}
                <div className="relative w-full h-full">
                  <img
                    src={activeCard.photos[activePhotoIndex] || activeCard.photos[0]}
                    alt={activeCard.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* Left/Right Tap Areas (only trigger if not dragging) */}
                  <div
                    className="absolute left-0 top-0 bottom-24 w-1/2 cursor-pointer z-10"
                    onClick={() => {
                      if (Math.abs(x.get()) < 8 && activePhotoIndex > 0) {
                        setActivePhotoIndex(activePhotoIndex - 1);
                      }
                    }}
                  />
                  <div
                    className="absolute right-0 top-0 bottom-24 w-1/2 cursor-pointer z-10"
                    onClick={() => {
                      if (Math.abs(x.get()) < 8 && activePhotoIndex < activeCard.photos.length - 1) {
                        setActivePhotoIndex(activePhotoIndex + 1);
                      }
                    }}
                  />

                  {/* Gradient Scrim for readable text */}
                  <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#2D3436] via-[#2D3436]/75 to-transparent pointer-events-none" />

                  {/* Card Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 z-20 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Online presence dot (#00B894) */}
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00B894] ring-2 ring-white shadow-[0_0_8px_rgba(0,184,148,0.8)]" title="Online now" />
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          {activeCard.name}, <span className="tabular-nums font-semibold">{activeCard.age}</span>
                        </h2>
                        {activeCard.isVerified && (
                          <VerifiedBadge size="md" userName={activeCard.name} />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Discreet Report User button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic('light');
                            setReportingUser(activeCard);
                          }}
                          className="w-9 h-9 rounded-full bg-black/40 border border-white/20 hover:border-red-400 text-white/80 hover:text-red-300 flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                          title={`Report ${activeCard.name}`}
                          aria-label={`Report ${activeCard.name}`}
                        >
                          <Flag className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDetailModal(true);
                          }}
                          className="w-9 h-9 rounded-full bg-black/40 border border-white/20 hover:border-white text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                          title="View full bio & prompts"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Secondary metadata (distance, occupation) */}
                    <div className="flex items-center gap-2 text-xs text-white/90">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-white/70" />
                        <span>{activeCard.occupation}</span>
                      </span>
                      <span aria-hidden="true" className="text-white/50">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#00B894]" />
                        <span>{activeCard.location.city} ({activeCard.location.distanceKm} km away)</span>
                      </span>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-white/85 line-clamp-2 leading-relaxed">
                      {activeCard.bio}
                    </p>

                    {/* Profile tags / Shared interests with Secondary #FD79A8 */}
                    {calculateSharedInterests(activeCard.interests).length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FD79A8] bg-[#FD79A8]/15 px-2.5 py-1 rounded-xl w-fit backdrop-blur-xs border border-[#FD79A8]/30">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>
                          Shared: {calculateSharedInterests(activeCard.interests).slice(0, 2).join(' & ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              key="empty"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full rounded-3xl border border-[#E9ECEF] bg-white flex flex-col items-center justify-center p-6 text-center shadow-[0_8px_30px_rgba(108,92,231,0.08)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center justify-center text-[#6C5CE7] mb-4">
                <Heart className="w-8 h-8 fill-[#FD79A8] text-[#FD79A8]" />
              </div>
              <h3 className="text-lg font-bold text-[#2D3436] mb-2">No More Profiles In Range</h3>
              <p className="text-xs text-[#636E72] max-w-xs leading-relaxed mb-6">
                You’ve seen all candidates matching your current criteria. Expand your age or distance preferences or reload the batch.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setFilters({
                      ageRange: [18, 55],
                      maxDistanceKm: 100,
                      verifiedOnly: false,
                      goalFilter: 'all',
                      interests: [],
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#6C5CE7] text-white font-bold text-xs hover:bg-[#4834D4] shadow-sm transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    loadBatch(0, false);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E9ECEF] text-[#2D3436] font-semibold text-xs hover:border-[#6C5CE7] shadow-xs transition-all cursor-pointer"
                >
                  Reload First Batch
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drag Hint & Gesture indicator */}
      <div className="flex items-center justify-between w-full px-4 pt-2 text-[10px] text-[#636E72] font-medium">
        <span>← Drag left to pass</span>
        <span>Drag right to like →</span>
      </div>

      {/* Action Buttons Row (Ergonomic Natural Thumb Zone) */}
      <div className="w-full flex items-center justify-center gap-4 pt-2 pb-2">
        {/* Rewind */}
        <button
          onClick={handleRewind}
          disabled={!lastAction}
          title="Rewind profile"
          className="w-12 h-12 rounded-full bg-white border border-[#E9ECEF] hover:border-amber-400 text-amber-500 flex items-center justify-center shadow-xs transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Pass Button */}
        <button
          onClick={handlePass}
          disabled={!activeCard || isInitialLoading}
          title="Pass (Left drag / Arrow key)"
          className="w-16 h-16 rounded-full bg-white border border-[#E9ECEF] hover:border-rose-400 text-rose-500 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-md transition-all disabled:opacity-30 active:scale-95 cursor-pointer"
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Super Like Button */}
        <button
          onClick={handleSuperLike}
          disabled={!activeCard || isInitialLoading}
          title="Super Like (Up arrow)"
          className="w-13 h-13 rounded-full bg-white border border-[#E9ECEF] hover:border-[#6C5CE7] text-[#6C5CE7] flex items-center justify-center shadow-xs transition-all disabled:opacity-30 active:scale-95 cursor-pointer"
        >
          <Star className="w-6 h-6 fill-[#6C5CE7]/20" />
        </button>

        {/* Secondary (#FD79A8): Like button badge / floating action button (FAB) */}
        <button
          onClick={handleLike}
          disabled={!activeCard || isInitialLoading}
          title="Like (Right drag / Arrow key)"
          className="w-16 h-16 rounded-full bg-[#FD79A8] hover:bg-[#fc6398] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(253,121,168,0.45)] hover:scale-105 transition-all disabled:opacity-30 active:scale-95 cursor-pointer"
        >
          <Heart className="w-7 h-7 fill-white" />
        </button>
      </div>

      {/* Expanded Profile Details Modal */}
      {showDetailModal && activeCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-[#E9ECEF] w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto p-6 shadow-[0_16px_50px_rgba(108,92,231,0.18)] animate-in slide-in-from-bottom duration-200">
            {/* Grab handle */}
            <div className="w-10 h-1 bg-[#E9ECEF] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B894] ring-2 ring-[#00B894]/20" title="Online now" />
                <h3 className="text-2xl font-bold text-[#2D3436]">
                  {activeCard.name}, <span className="tabular-nums font-semibold">{activeCard.age}</span>
                </h3>
                {activeCard.isVerified && (
                  <VerifiedBadge size="md" userName={activeCard.name} />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setReportingUser(activeCard);
                  }}
                  className="p-1.5 text-[#636E72] hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title={`Report ${activeCard.name}`}
                  aria-label={`Report ${activeCard.name}`}
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 text-[#636E72] hover:text-[#2D3436] rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                  title="Close profile"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Unboxed details strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#636E72] pb-4 border-b border-[#E9ECEF] mb-5">
              <span>{activeCard.occupation}</span>
              <span aria-hidden="true">·</span>
              <span>{activeCard.location.city}</span>
              <span aria-hidden="true">·</span>
              <span>Goal: {activeCard.relationshipGoal.replace('-', ' ')}</span>
              {activeCard.height && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{activeCard.height}</span>
                </>
              )}
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider mb-2">About</h4>
              <p className="text-sm text-[#2D3436] leading-relaxed">{activeCard.bio}</p>
            </div>

            {/* Prompts list (Interactive triggers / icebreakers) */}
            {activeCard.prompts.length > 0 && (
              <div className="space-y-4 mb-6">
                {activeCard.prompts.map((p, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] relative overflow-hidden">
                    <div className="w-1 absolute left-0 inset-y-0 bg-[#FD79A8]" />
                    <p className="text-xs font-bold text-[#FD79A8] mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{p.question}</span>
                    </p>
                    <p className="text-sm font-medium text-[#2D3436] leading-relaxed">{p.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Passions list with Secondary #FD79A8 tags */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider mb-2.5">
                Passions & Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeCard.interests.map((interest, i) => {
                  const isShared = currentUser?.interests.includes(interest);
                  return (
                    <span
                      key={i}
                      className={`text-xs px-3 py-1.5 rounded-xl border ${
                        isShared
                          ? 'bg-[#FD79A8]/15 border-[#FD79A8]/40 text-[#FD79A8] font-bold shadow-xs'
                          : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#2D3436]'
                      }`}
                    >
                      {interest} {isShared && '★'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Secondary Photos */}
            {activeCard.photos.slice(1).map((photo, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-[#E9ECEF] mb-4 aspect-[3/4] shadow-xs">
                <img
                  src={photo}
                  alt={`${activeCard.name} gallery ${i + 2}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handlePass();
                }}
                className="flex-1 py-3 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F2F6] border border-[#E9ECEF] text-rose-500 font-bold text-sm transition-colors cursor-pointer"
              >
                Pass
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleLike();
                }}
                className="flex-1 py-3 rounded-xl bg-[#FD79A8] hover:bg-[#fc6398] text-white font-bold text-sm shadow-[0_8px_25px_rgba(253,121,168,0.4)] transition-all cursor-pointer"
              >
                Like Profile ❤️
              </button>
            </div>

            {/* Discreet Report User link */}
            <div className="pt-5 pb-2 text-center border-t border-[#E9ECEF] mt-4">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setReportingUser(activeCard);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#636E72] hover:text-red-500 py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report {activeCard.name}</span>
              </button>
              <p className="text-[10px] text-[#636E72]/80 mt-0.5">
                Reports are 100% confidential and reviewed by HeartLink moderation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal with Draft Preferences */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E9ECEF] w-full max-w-md rounded-3xl p-6 shadow-[0_16px_50px_rgba(108,92,231,0.18)]"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#2D3436]">Discovery Preferences</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 text-[#636E72] hover:text-[#2D3436] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Age Range Slider */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-semibold text-[#2D3436] mb-2">
                <span>Age Range</span>
                <span className="text-[#6C5CE7] tabular-nums font-bold">
                  {draftFilters.ageRange[0]} - {draftFilters.ageRange[1]} years
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={draftFilters.ageRange[1]}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      ageRange: [prev.ageRange[0], parseInt(e.target.value)],
                    }))
                  }
                  className="w-full accent-[#6C5CE7]"
                />
              </div>
            </div>

            {/* Max Distance Slider */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-semibold text-[#2D3436] mb-2">
                <span>Maximum Distance</span>
                <span className="text-[#6C5CE7] tabular-nums font-bold">
                  Up to {draftFilters.maxDistanceKm} km
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={draftFilters.maxDistanceKm}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    maxDistanceKm: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-[#6C5CE7]"
              />
            </div>

            {/* Relationship Goal Filter */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#2D3436] mb-2">
                Relationship Goal
              </label>
              <select
                value={draftFilters.goalFilter}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    goalFilter: e.target.value as any,
                  }))
                }
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] font-medium focus:outline-none focus:border-[#6C5CE7]"
              >
                <option value="all">Any Goal</option>
                <option value="long-term">Long-Term Relationship</option>
                <option value="marriage">Marriage</option>
                <option value="serious">Serious Dating</option>
                <option value="casual">Casual</option>
                <option value="friends">New Friends</option>
              </select>
            </div>

            {/* Verified Only Switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00B894]" />
                <span className="text-xs font-medium text-[#2D3436]">Selfie Verified Only</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraftFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  draftFilters.verifiedOnly ? 'bg-[#00B894]' : 'bg-[#CBD5E1]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    draftFilters.verifiedOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleApplyPreferences}
              className="w-full py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#4834D4] text-white font-bold text-sm shadow-[0_8px_25px_rgba(108,92,231,0.3)] transition-all active:scale-[0.98] cursor-pointer"
            >
              Apply Preferences
            </button>
          </motion.div>
        </div>
      )}

      {/* Discreet Report User Modal */}
      <ReportUserModal
        isOpen={Boolean(reportingUser)}
        onClose={() => setReportingUser(null)}
        targetUser={reportingUser}
        onSuccess={() => {
          if (reportingUser && activeCard && reportingUser.id === activeCard.id) {
            advanceQueue(activeCard.id);
            setShowDetailModal(false);
          }
          setReportingUser(null);
        }}
      />
    </div>
  );
};

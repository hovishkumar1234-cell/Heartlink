import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GoingNowBroadcast,
  GoingNowCategory,
  GoingNowRsvp,
} from '../../types';
import { VENUE_PRESETS, getVenuePresetSnapshot } from '../../data/liveData';
import { VerifiedBadge } from '../common/VerifiedBadge';
import {
  MapPin,
  Clock,
  Plus,
  Send,
  Coffee,
  BookOpen,
  Wine,
  Palette,
  Trees,
  Music,
  Users,
  Compass,
  CheckCircle2,
  X,
  Camera,
  Navigation,
  MessageCircle,
  Share2,
} from 'lucide-react';

export const GoingNowFeed: React.FC = () => {
  const {
    currentUser,
    goingNowBroadcasts,
    createGoingNowBroadcast,
    rsvpToGoingNowBroadcast,
    deleteGoingNowBroadcast,
    setActiveScreen,
    setActiveChatMatchId,
    matches,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'radar'>('cards');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeRsvpModalBroadcast, setActiveRsvpModalBroadcast] = useState<GoingNowBroadcast | null>(null);

  // Form states for creating a broadcast
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customVenue, setCustomVenue] = useState('');
  const [customNeighborhood, setCustomNeighborhood] = useState('San Francisco, CA');
  const [selectedCategory, setSelectedCategory] = useState<GoingNowCategory>('coffee');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [noteText, setNoteText] = useState('');
  const [tagInput, setTagInput] = useState('Coffee & Chat, Good Vibes');

  // RSVP modal input
  const [rsvpEta, setRsvpEta] = useState(15);
  const [rsvpStatus, setRsvpStatus] = useState<GoingNowRsvp['status']>('on_my_way');
  const [rsvpMessage, setRsvpMessage] = useState('Grabbing a table, see you shortly!');

  // Ticking countdown re-render helper
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const getCategoryIcon = (category: GoingNowCategory) => {
    switch (category) {
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5 text-[#6C5CE7]" />;
      case 'bookstore':
        return <BookOpen className="w-3.5 h-3.5 text-[#FD79A8]" />;
      case 'drinks':
        return <Wine className="w-3.5 h-3.5 text-[#4834D4]" />;
      case 'art':
        return <Palette className="w-3.5 h-3.5 text-[#00B894]" />;
      case 'outdoor':
        return <Trees className="w-3.5 h-3.5 text-[#00B894]" />;
      case 'music':
        return <Music className="w-3.5 h-3.5 text-[#FD79A8]" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-[#6C5CE7]" />;
    }
  };

  const getRemainingTimeString = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Ending soon';
    const mins = Math.floor(diffMs / (60 * 1000));
    if (mins < 60) return `Here for ${mins}m`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `Leaves in ${hours}h ${remMins}m`;
  };

  const filteredBroadcasts = goingNowBroadcasts.filter((b) => {
    if (activeCategory !== 'all' && b.category !== activeCategory) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = VENUE_PRESETS[selectedPresetIndex];
    const venueName = customVenue.trim() || preset.name;
    const neighborhood = customNeighborhood.trim() || preset.neighborhood;
    const photoUrl = getVenuePresetSnapshot(venueName, preset.gradient, selectedCategory);
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    createGoingNowBroadcast({
      category: selectedCategory,
      venueName,
      neighborhood,
      distanceKm: 0.5,
      photoUrl,
      note: noteText.trim() || 'Heading here right now! Feel free to RSVP and say hi.',
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      tags: tags.length > 0 ? tags : ['Spontaneous Meetup', 'Good Vibes'],
    });

    setIsCreateModalOpen(false);
    setNoteText('');
    setCustomVenue('');
  };

  const handleRsvpSubmit = (broadcastId: string) => {
    rsvpToGoingNowBroadcast(broadcastId, rsvpStatus, rsvpEta, rsvpMessage);
    setActiveRsvpModalBroadcast(null);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Banner & Action Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B894]/10 text-[#00B894] text-xs font-bold uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00B894] animate-ping" />
            <Navigation className="w-3.5 h-3.5" />
            Live "Going Now" Radar
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D3436]">
            Meet up <span className="text-[#6C5CE7]">right now</span> in your city
          </h2>
          <p className="text-xs text-[#636E72] mt-0.5">
            Spontaneous coffee, bookstore browsing, or park hangouts happening near you today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle (Cards vs Radar) */}
          <div className="bg-[#F8F9FA] p-1 rounded-2xl border border-[#E9ECEF] flex items-center">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-[#636E72] hover:text-[#2D3436]'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'radar'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-[#636E72] hover:text-[#2D3436]'
              }`}
            >
              Radar Map
            </button>
          </div>

          {/* Broadcast Where I'm Going CTA */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] text-white text-xs font-bold shadow-[0_6px_20px_rgba(108,92,231,0.3)] hover:shadow-[0_8px_25px_rgba(108,92,231,0.45)] active:scale-98 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Broadcast Spot</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Spots' },
          { id: 'coffee', label: '☕ Cafes' },
          { id: 'bookstore', label: '📚 Books' },
          { id: 'drinks', label: '🍸 Drinks' },
          { id: 'art', label: '🎨 Art' },
          { id: 'outdoor', label: '🏃 Parks' },
          { id: 'music', label: '🎵 Music' },
        ].map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm'
                  : 'bg-white text-[#636E72] border-[#E9ECEF] hover:border-[#6C5CE7]/40'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* RADAR MAP VIEW */}
      {/* ===================================================================== */}
      {viewMode === 'radar' && (
        <div className="w-full bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] flex flex-col items-center">
          <div className="text-center mb-4">
            <h3 className="text-base font-extrabold text-[#2D3436]">Live Proximity Radar</h3>
            <p className="text-xs text-[#636E72]">
              Tap any pulsing pin to view where members are hanging out right now
            </p>
          </div>

          {/* Interactive Radar Ring */}
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-full border-2 border-[#6C5CE7]/20 flex items-center justify-center bg-[#F8F9FA] overflow-hidden my-2 shadow-inner">
            {/* Concentric distance rings */}
            <div className="absolute inset-10 rounded-full border border-dashed border-[#6C5CE7]/30" />
            <div className="absolute inset-20 rounded-full border border-[#00B894]/30" />
            <div className="absolute inset-32 rounded-full border border-[#FD79A8]/30" />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#E9ECEF]" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-[#E9ECEF]" />

            {/* Radar Sweep Effect */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-[#6C5CE7]/10 to-transparent pointer-events-none animate-spin"
              style={{ animationDuration: '8s' }}
            />

            {/* Center: You */}
            <div className="absolute z-20 flex flex-col items-center pointer-events-none">
              <div className="w-6 h-6 rounded-full bg-[#6C5CE7] border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-black">
                YOU
              </div>
              <span className="text-[9px] font-bold text-[#6C5CE7] mt-0.5">Current Spot</span>
            </div>

            {/* Pins for each broadcast placed by angle/distance */}
            {filteredBroadcasts.map((b, index) => {
              const angles = [45, 120, 210, 315, 80, 160];
              const distances = [35, 60, 48, 70, 40, 65]; // percentage from center
              const angle = angles[index % angles.length];
              const dist = distances[index % distances.length];
              const rad = (angle * Math.PI) / 180;
              const left = 50 + (dist / 2) * Math.cos(rad);
              const top = 50 + (dist / 2) * Math.sin(rad);

              return (
                <button
                  key={b.id}
                  onClick={() => setActiveRsvpModalBroadcast(b)}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
                >
                  <div className="relative">
                    <span className="absolute -inset-1 rounded-full bg-[#FD79A8] animate-ping opacity-60" />
                    <img
                      src={b.userAvatar}
                      alt={b.userName}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform"
                    />
                  </div>
                  <div className="hidden group-hover:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2D3436] text-white text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg z-40 items-center gap-1">
                    <span>{b.userName}</span>
                    <span className="text-[#00B894]">@ {b.venueName}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-6 text-[11px] text-[#636E72] mt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" /> Inner 1 km
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00B894]" /> 1 - 2.5 km
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FD79A8]" /> Outer 5 km
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CARDS LIST VIEW */}
      {/* ===================================================================== */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBroadcasts.map((broadcast) => {
            const hasUserRsvpd = broadcast.rsvps.some((r) => r.userId === currentUser?.id);
            const isOwner = broadcast.userId === currentUser?.id;

            return (
              <div
                key={broadcast.id}
                className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(108,92,231,0.08)] border border-[#E9ECEF] flex flex-col hover:border-[#6C5CE7]/30 transition-all group"
              >
                {/* Photo Snapshot Banner */}
                <div className="relative h-44 w-full bg-[#2D3436] overflow-hidden">
                  <img
                    src={broadcast.photoUrl}
                    alt={broadcast.venueName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-extrabold text-[#2D3436] shadow-sm">
                    {getCategoryIcon(broadcast.category)}
                    <span className="capitalize">{broadcast.category}</span>
                  </div>

                  {/* Countdown Ticker Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[#00B894]" />
                    <span>{getRemainingTimeString(broadcast.expiresAt)}</span>
                  </div>

                  {/* Distance Banner */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] font-bold text-white drop-shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-[#FD79A8]" />
                    <span>{broadcast.neighborhood} • {broadcast.distanceKm} km away</span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Broadcaster Profile Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={broadcast.userAvatar}
                          alt={broadcast.userName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#E9ECEF]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-[#2D3436]">
                              {broadcast.userName}, {broadcast.userAge}
                            </span>
                            {broadcast.isVerified && <VerifiedBadge size="sm" userName={broadcast.userName} />}
                          </div>
                          <span className="text-[11px] text-[#636E72]">{broadcast.userOccupation}</span>
                        </div>
                      </div>

                      {isOwner && (
                        <button
                          onClick={() => deleteGoingNowBroadcast(broadcast.id)}
                          className="text-[11px] font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                        >
                          Close Spot
                        </button>
                      )}
                    </div>

                    {/* Venue Headline */}
                    <h3 className="text-base font-extrabold text-[#2D3436] flex items-center gap-1.5">
                      <span>{broadcast.venueName}</span>
                    </h3>

                    {/* Personal Note / Icebreaker */}
                    <p className="text-xs text-[#636E72] mt-1.5 leading-relaxed bg-[#F8F9FA] p-3 rounded-2xl border border-[#E9ECEF]/70">
                      "{broadcast.note}"
                    </p>

                    {/* Tags */}
                    {broadcast.tags && broadcast.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {broadcast.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#6C5CE7]/5 text-[#6C5CE7] text-[10px] font-bold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attendees & Actions Row */}
                  <div className="mt-4 pt-3 border-t border-[#E9ECEF] flex items-center justify-between gap-3">
                    {/* Attendees Avatar Cluster */}
                    <div className="flex items-center gap-2">
                      {broadcast.rsvps.length > 0 ? (
                        <div className="flex items-center">
                          <div className="flex -space-x-2 overflow-hidden">
                            {broadcast.rsvps.slice(0, 3).map((r, i) => (
                              <img
                                key={i}
                                src={r.userAvatar}
                                alt={r.userName}
                                title={`${r.userName} (${r.status})`}
                                className="inline-block w-6 h-6 rounded-full ring-2 ring-white object-cover"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-[#636E72] ml-2">
                            {broadcast.rsvps.length} {broadcast.rsvps.length === 1 ? 'person' : 'people'} going
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-[#636E72]">
                          Be the first to RSVP!
                        </span>
                      )}
                    </div>

                    {/* RSVP Action CTA */}
                    {hasUserRsvpd ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00B894]/15 text-[#00B894] text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          You're Going!
                        </span>
                        {!isOwner && (
                          <button
                            onClick={() => {
                              const match = matches.find(
                                (m) =>
                                  (m.userId1 === currentUser?.id && m.userId2 === broadcast.userId) ||
                                  (m.userId2 === currentUser?.id && m.userId1 === broadcast.userId)
                              );
                              if (match) {
                                setActiveChatMatchId(match.id);
                                setActiveScreen('chat');
                              }
                            }}
                            className="p-1.5 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white transition-colors cursor-pointer"
                            title="Chat with host"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveRsvpModalBroadcast(broadcast)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] hover:opacity-95 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>RSVP / Meet Me There</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: Create New Broadcast */}
      {/* ===================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#E9ECEF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#2D3436]">Broadcast Where You're Going</h3>
                  <p className="text-xs text-[#636E72]">Let nearby members meet up with you spontaneously</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-[#E9ECEF] flex items-center justify-center text-[#636E72] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              {/* Preset Venue Quick Picker */}
              <div>
                <label className="text-xs font-bold text-[#636E72] uppercase tracking-wider block mb-2">
                  Select a Popular Venue or Customize:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VENUE_PRESETS.map((vp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPresetIndex(idx);
                        setSelectedCategory(vp.category);
                        setCustomVenue(vp.name);
                        setCustomNeighborhood(vp.neighborhood);
                      }}
                      className={`text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedPresetIndex === idx
                          ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 ring-2 ring-[#6C5CE7]/20'
                          : 'border-[#E9ECEF] bg-[#F8F9FA] hover:border-[#6C5CE7]/30'
                      }`}
                    >
                      <span className="text-xs font-extrabold text-[#2D3436] block truncate">
                        {vp.name}
                      </span>
                      <span className="text-[10px] text-[#636E72] block truncate">
                        {vp.neighborhood}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Venue Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#636E72] block mb-1">
                    Venue Name:
                  </label>
                  <input
                    type="text"
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    placeholder="e.g. Ritual Coffee Roasters"
                    className="w-full px-3 py-2 rounded-xl border border-[#E9ECEF] text-xs text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none bg-[#F8F9FA]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#636E72] block mb-1">
                    Category:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as GoingNowCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9ECEF] text-xs text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none bg-[#F8F9FA]"
                  >
                    <option value="coffee">☕ Coffee & Tea</option>
                    <option value="bookstore">📚 Bookstore & Reading</option>
                    <option value="drinks">🍸 Cocktails & Lounge</option>
                    <option value="art">🎨 Museum & Art</option>
                    <option value="outdoor">🏃 Park & Outdoor</option>
                    <option value="music">🎵 Music & Vinyl</option>
                  </select>
                </div>
              </div>

              {/* Time Window (How long you'll be there) */}
              <div>
                <label className="text-xs font-semibold text-[#636E72] block mb-1">
                  How long will you be there?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        durationMinutes === mins
                          ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                          : 'bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF] hover:border-[#6C5CE7]/30'
                      }`}
                    >
                      {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Icebreaker Prompt */}
              <div>
                <label className="text-xs font-semibold text-[#636E72] block mb-1">
                  What are you up to? (Icebreaker Note):
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Reading a new sci-fi book in the window booth! Come grab a matcha latte and say hi."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECEF] text-xs text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none bg-[#F8F9FA]"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-[#636E72] block mb-1">
                  Vibe Tags (comma separated):
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. Specialty Coffee, Casual Chat, Vinyl Records"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECEF] text-xs text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none bg-[#F8F9FA]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-[#E9ECEF]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#636E72] hover:bg-[#F8F9FA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Post Live Broadcast 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: RSVP to Broadcast */}
      {/* ===================================================================== */}
      {activeRsvpModalBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#E9ECEF]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00B894]/10 text-[#00B894] flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2D3436]">
                    RSVP to {activeRsvpModalBroadcast.userName}
                  </h3>
                  <p className="text-xs text-[#636E72]">
                    Meet at {activeRsvpModalBroadcast.venueName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRsvpModalBroadcast(null)}
                className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-[#E9ECEF] flex items-center justify-center text-[#636E72] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#636E72] block mb-1">
                  Your Status:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus('on_my_way')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      rsvpStatus === 'on_my_way'
                        ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] text-[#6C5CE7]'
                        : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#636E72]'
                    }`}
                  >
                    🚗 On My Way
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpStatus('here_now')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      rsvpStatus === 'here_now'
                        ? 'bg-[#00B894]/10 border-[#00B894] text-[#00B894]'
                        : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#636E72]'
                    }`}
                  >
                    📍 Here Now
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#636E72] block mb-1">
                  Estimated Arrival Time (ETA):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 25].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setRsvpEta(mins)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        rsvpEta === mins
                          ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                          : 'bg-[#F8F9FA] text-[#636E72] border-[#E9ECEF]'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#636E72] block mb-1">
                  Quick Message to Host:
                </label>
                <input
                  type="text"
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  placeholder="e.g. Grabbing a cortado, wearing a denim jacket!"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECEF] text-xs text-[#2D3436] focus:border-[#6C5CE7] focus:outline-none bg-[#F8F9FA]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-[#E9ECEF]">
                <button
                  type="button"
                  onClick={() => setActiveRsvpModalBroadcast(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#636E72] hover:bg-[#F8F9FA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRsvpSubmit(activeRsvpModalBroadcast.id)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00B894] to-[#009688] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Confirm RSVP & Connect 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { KarmaBadgeType, KarmaBadgeInfo, PoliteDepartureTemplate } from '../types';

export const KARMA_BADGE_DEFINITIONS: Record<KarmaBadgeType, KarmaBadgeInfo> = {
  prompt_responder: {
    type: 'prompt_responder',
    label: 'Prompt Responder',
    emoji: '⚡',
    shortTag: '< 20m reply',
    description: 'Consistently replies promptly within conversations. No prolonged breadcrumbing.',
    color: '#00B894',
  },
  verified_show_up: {
    type: 'verified_show_up',
    label: 'Verified Show-Up',
    emoji: '🤝',
    shortTag: '100% Date Reliability',
    description: 'Arrives punctually to scheduled IRL dates. Never stands up or cancels last minute.',
    color: '#6C5CE7',
  },
  zero_ghost_karma: {
    type: 'zero_ghost_karma',
    label: 'Zero-Ghost Karma',
    emoji: '✨',
    shortTag: 'Clean Closures',
    description: 'Never leaves active chats dangling. Sends thoughtful 1-tap departures when not a match.',
    color: '#FD79A8',
  },
  intentional_dater: {
    type: 'intentional_dater',
    label: 'Intentional Dater',
    emoji: '🌱',
    shortTag: 'Max 3 Focus',
    description: 'Focuses energy on a maximum of 3 matches at a time instead of hoarding unreplied chats.',
    color: '#0984E3',
  },
};

export const POLITE_DEPARTURE_TEMPLATES: PoliteDepartureTemplate[] = [
  {
    id: 'dept_spark',
    title: 'No Romantic Spark',
    emoji: '✨',
    category: 'romantic_spark',
    messageText:
      "Hey! I've really enjoyed our chat and appreciate your time, but to be completely honest, I don't feel that romantic spark between us. Wishing you the absolute best on here! 💫",
    karmaBonus: 6,
  },
  {
    id: 'dept_goals',
    title: 'Different Dating Goals',
    emoji: '🎯',
    category: 'timing_priorities',
    messageText:
      "Hi! You seem genuinely wonderful, but reflecting on what we're looking for, I think our dating goals and lifestyles are pointing in different directions. Thank you for being so lovely to talk to! 🌸",
    karmaBonus: 6,
  },
  {
    id: 'dept_friends',
    title: 'Warm Platonic Connection',
    emoji: '☕',
    category: 'friendship_only',
    messageText:
      "Hey! Our conversations have been so thoughtful, but my gut tells me this feels more like a great friendship than a romantic fit. Super glad we crossed paths! 🤝",
    karmaBonus: 6,
  },
  {
    id: 'dept_focus',
    title: 'Focusing on One Match',
    emoji: '🌱',
    category: 'connection_found',
    messageText:
      "Hey there, I want to be upfront: I've decided to focus on exploring a single connection exclusively right now. Wanted to let you know respectfully rather than leave you hanging! Take care! ✨",
    karmaBonus: 8,
  },
];

export const SAMPLE_DATE_VENUES = [
  {
    id: 'venue_1',
    name: 'Sightglass Coffee Roastery',
    neighborhood: 'SoMa, San Francisco',
    activityType: 'coffee' as const,
    vibe: 'Lofty timber space with artisan espresso & warm light',
  },
  {
    id: 'venue_2',
    name: 'SFMOMA Sculpture Terrace & Café 5',
    neighborhood: 'Yerba Buena, SF',
    activityType: 'gallery' as const,
    vibe: 'Open-air living garden wall & modern sculptures',
  },
  {
    id: 'venue_3',
    name: 'Trick Dog Cocktail Lab',
    neighborhood: 'Mission District, SF',
    activityType: 'drinks' as const,
    vibe: 'Playful seasonal menus & intimate low lighting',
  },
  {
    id: 'venue_4',
    name: 'Dolores Park Palm Grove Walk',
    neighborhood: 'Mission / Castro, SF',
    activityType: 'park_walk' as const,
    vibe: 'Golden hour city views with bakery pastries',
  },
];

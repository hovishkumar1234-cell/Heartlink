import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
  Match,
  Message,
  MessageReaction,
  UserReport,
  VerificationRequest,
  FilterOptions,
  Screen,
  RelationshipGoal,
  MiniGameData,
  GoingNowBroadcast,
  GoingNowRsvp,
  LiveRouletteSession,
  LiveMediaMode,
  LiveReaction,
  RapidMatchState,
  SoundWaveProfile,
  SoundWaveReply,
  AmbientSyncTrack,
  DualCameraVibe,
  SelfDestructSnap,
  DoodlePath,
  ARLensChallengeSession,
  ARLensChallengeType,
  UserKarmaProfile,
  IrlDatePlan,
  SocialExchange,
  CallSession,
  CallType,
  CallReaction,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MATCHES,
  INITIAL_MESSAGES,
  INITIAL_REPORTS,
  INITIAL_VERIFICATIONS,
} from '../data/mockData';
import {
  INITIAL_GOING_NOW_BROADCASTS,
  LIVE_ROULETTE_ICEBREAKERS,
  RAPID_MATCH_PROMPTS,
} from '../data/liveData';
import { INITIAL_SOUNDWAVE_PROFILES } from '../data/soundWaveData';
import { INITIAL_DUAL_CAMERA_VIBES, AR_THIS_OR_THAT_QUESTIONS } from '../data/snapData';
import { POLITE_DEPARTURE_TEMPLATES } from '../data/karmaData';
import { triggerHaptic } from '../utils/haptics';
import { callSounds } from '../utils/callSounds';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'alert';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  matches: Match[];
  messages: Message[];
  reports: UserReport[];
  verifications: VerificationRequest[];
  activeScreen: Screen;
  activeChatMatchId: string | null;
  matchCelebration: { user1: User; user2: User; matchId: string } | null;
  viewMode: 'mobile' | 'responsive';
  filters: FilterOptions;
  toasts: Toast[];
  lastAction: { type: 'like' | 'pass'; targetUserId: string } | null;
  isApkModalOpen: boolean;
  isPremiumModalOpen: boolean;
  typingMatchIds: string[];

  // Going Now Broadcasts state & actions
  goingNowBroadcasts: GoingNowBroadcast[];
  createGoingNowBroadcast: (
    data: Omit<
      GoingNowBroadcast,
      'id' | 'userId' | 'userName' | 'userAvatar' | 'userAge' | 'userOccupation' | 'isVerified' | 'createdAt' | 'rsvps'
    >
  ) => void;
  rsvpToGoingNowBroadcast: (
    broadcastId: string,
    status: GoingNowRsvp['status'],
    etaMinutes?: number,
    customMessage?: string
  ) => void;
  deleteGoingNowBroadcast: (broadcastId: string) => void;

  // Live Roulette state & actions
  liveRoulette: LiveRouletteSession;
  startLiveRoulette: () => void;
  leaveLiveRoulette: () => void;
  skipLiveRoulettePartner: () => void;
  toggleLiveMediaMode: (mode: LiveMediaMode) => void;
  toggleLiveAudioMute: () => void;
  toggleLiveVideoMute: () => void;
  sendLiveReaction: (emoji: string) => void;
  extendLiveRound: () => void;
  likeLivePartner: () => void;
  nextLivePrompt: () => void;

  // Rapid Match state & actions
  rapidMatch: RapidMatchState | null;
  startRapidMatch: () => void;
  answerRapidPrompt: (promptId: string, optionIndex: number) => void;
  sendRapidChatMessage: (text: string) => void;
  saveRapidMatch: () => void;
  closeRapidMatch: () => void;

  // Sound-Wave Blind Date state & actions
  soundWaveProfiles: SoundWaveProfile[];
  sendSoundWaveVoiceReply: (
    profileId: string,
    durationSeconds?: number,
    ambientTrack?: AmbientSyncTrack,
    customText?: string
  ) => void;
  markSoundWaveListened: (profileId: string) => void;
  publishUserSoundWave: (
    promptQuestion: string,
    transcript: string,
    ambientTrack: AmbientSyncTrack,
    cadenceLabel: string
  ) => void;

  // Snap-Style Casual Interactions & AR Lens Challenges
  dualCameraVibes: DualCameraVibe[];
  postDualCameraVibe: (
    caption: string,
    locationTag: string,
    promptLabel?: string,
    frontPhotoUrl?: string,
    backPhotoUrl?: string
  ) => void;
  likeDualCameraVibe: (vibeId: string) => void;

  sendSelfDestructSnap: (
    matchId: string,
    mediaType: 'photo' | 'voice' | 'clip',
    mediaUrl: string,
    caption?: string,
    doodles?: DoodlePath[],
    stickerEmoji?: string,
    viewDurationSeconds?: number
  ) => void;
  markSnapViewed: (snapId: string) => void;

  arLensChallenge: ARLensChallengeSession | null;
  startARLensChallenge: (partnerId: string, challengeType: ARLensChallengeType) => void;
  makeARLensChoice: (choice: 'left' | 'right') => void;
  closeARLensChallenge: () => void;

  // The "Anti-Ghosting" Karma Engine & Active Chat Limit
  userKarma: UserKarmaProfile;
  activeChatLimit: number; // 3
  activeChatMatches: Match[];
  pendingBlockedMatchId: string | null;
  setPendingBlockedMatchId: (matchId: string | null) => void;
  canOpenChat: (matchId: string) => boolean;
  tryOpenChat: (matchId: string) => boolean;
  proposeIrlDate: (
    matchId: string,
    venueName: string,
    neighborhood: string,
    activityType: 'coffee' | 'drinks' | 'gallery' | 'dinner' | 'park_walk',
    dateTime: string,
    note?: string
  ) => void;
  exchangeSocials: (
    matchId: string,
    platforms: Array<{ platform: 'instagram' | 'whatsapp' | 'phone' | 'linkedin'; handle: string }>
  ) => void;
  sendPoliteDeparture: (matchId: string, templateId: string, customNote?: string) => void;

  // Audio & Video Calls
  activeCall: CallSession | null;
  startCall: (partnerId: string, type: 'audio' | 'video') => void;
  endCall: () => void;
  toggleCallMute: () => void;
  toggleCallVideo: () => void;
  toggleCallSpeaker: () => void;
  toggleCallCameraFront: () => void;
  setMinimizeCall: (minimized: boolean) => void;
  sendCallReaction: (emoji: string) => void;

  // Actions
  setActiveScreen: (screen: Screen) => void;
  setActiveChatMatchId: (matchId: string | null) => void;
  setMatchCelebration: (data: { user1: User; user2: User; matchId: string } | null) => void;
  setViewMode: (mode: 'mobile' | 'responsive') => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  setIsApkModalOpen: (open: boolean) => void;
  setIsPremiumModalOpen: (open: boolean) => void;

  login: (userId: string) => void;
  signup: (userData: Partial<User>) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  deleteAccount: () => void;
  upgradeToPremium: () => void;

  likeUser: (targetUserId: string, isSuperLike?: boolean) => void;
  passUser: (targetUserId: string) => void;
  rewindLastAction: () => void;

  sendMessage: (matchId: string, text: string, isIcebreaker?: boolean) => void;
  sendVoiceMessage: (matchId: string, audioUrl: string, durationSeconds: number, waveform?: number[]) => void;
  sendMiniGame: (matchId: string, gameData: MiniGameData, introText: string) => void;
  respondToMiniGame: (messageId: string, updates: Record<string, any>) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  markMessagesAsRead: (matchId: string) => void;
  unmatchUser: (targetUserId: string) => void;
  blockUser: (targetUserId: string) => void;
  reportUser: (targetUserId: string, reason: UserReport['reason'], description: string) => void;
  requestVerification: (selfiePose: string) => void;

  adminResolveReport: (reportId: string, action: 'dismiss' | 'suspend_user' | 'warn') => void;
  adminReviewVerification: (requestId: string, approve: boolean) => void;
  adminToggleUserStatus: (userId: string) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'alert') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'heartlink_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}currentUserId`) || 'user_maya';
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}matches`);
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}messages`);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [reports, setReports] = useState<UserReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reports`);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [verifications, setVerifications] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}verifications`);
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATIONS;
  });

  const [activeScreen, setActiveScreen] = useState<Screen>('discover');
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | null>(null);
  const [matchCelebration, setMatchCelebration] = useState<{ user1: User; user2: User; matchId: string } | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');
  const [lastAction, setLastAction] = useState<{ type: 'like' | 'pass'; targetUserId: string } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [typingMatchIds, setTypingMatchIds] = useState<string[]>([]);

  // Audio & Video Call State
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const callTimerRef = useRef<number | null>(null);
  const ringTimeoutRef = useRef<number | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [18, 45],
    maxDistanceKm: 50,
    verifiedOnly: false,
    goalFilter: 'all',
    interests: [],
  });

  // Going Now Broadcasts state
  const [goingNowBroadcasts, setGoingNowBroadcasts] = useState<GoingNowBroadcast[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}going_now`);
    return saved ? JSON.parse(saved) : INITIAL_GOING_NOW_BROADCASTS;
  });

  // Live Roulette Session state
  const [liveRoulette, setLiveRoulette] = useState<LiveRouletteSession>({
    status: 'idle',
    partner: null,
    secondsRemaining: 180,
    totalDuration: 180,
    mediaMode: 'video',
    isAudioMuted: false,
    isVideoMuted: false,
    isPartnerAudioMuted: false,
    isPartnerVideoMuted: false,
    userLiked: false,
    partnerLiked: false,
    isMutualMatch: false,
    currentPromptIndex: 0,
    reactions: [],
  });

  // Rapid Match state
  const [rapidMatch, setRapidMatch] = useState<RapidMatchState | null>(null);

  // Sound-Wave Blind Date state
  const [soundWaveProfiles, setSoundWaveProfiles] = useState<SoundWaveProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}soundwave_profiles`);
    return saved ? JSON.parse(saved) : INITIAL_SOUNDWAVE_PROFILES;
  });

  // Snap-Style Dual-Camera Vibes state
  const [dualCameraVibes, setDualCameraVibes] = useState<DualCameraVibe[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}dual_camera_vibes`);
    return saved ? JSON.parse(saved) : INITIAL_DUAL_CAMERA_VIBES;
  });

  // Interactive AR Lens Challenge session state
  const [arLensChallenge, setArLensChallenge] = useState<ARLensChallengeSession | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}currentUserId`, currentUserId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}currentUserId`);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}matches`, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}messages`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reports`, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}verifications`, JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}going_now`, JSON.stringify(goingNowBroadcasts));
  }, [goingNowBroadcasts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}soundwave_profiles`, JSON.stringify(soundWaveProfiles));
  }, [soundWaveProfiles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}dual_camera_vibes`, JSON.stringify(dualCameraVibes));
  }, [dualCameraVibes]);

  // Timer for Live Roulette
  useEffect(() => {
    if (liveRoulette.status !== 'connected' || liveRoulette.secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setLiveRoulette((prev) => {
        if (prev.status !== 'connected') return prev;
        if (prev.secondsRemaining <= 1) {
          return { ...prev, secondsRemaining: 0, status: 'ended' };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [liveRoulette.status, liveRoulette.secondsRemaining]);

  // Timer for Rapid Match
  useEffect(() => {
    if (!rapidMatch || rapidMatch.status !== 'active' || rapidMatch.secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setRapidMatch((prev) => {
        if (!prev || prev.status !== 'active') return prev;
        if (prev.secondsRemaining <= 1) {
          return {
            ...prev,
            secondsRemaining: 0,
            status: prev.userSaved && prev.partnerSaved ? 'saved' : 'expired',
          };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rapidMatch?.status, rapidMatch?.secondsRemaining]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  const showToast = (message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      showToast('User not found', 'alert');
      return;
    }
    if (target.accountStatus === 'suspended') {
      showToast('Account suspended for safety review', 'alert');
      return;
    }
    // Strict age check: below 18 / below 10 restriction
    if (target.age < 18) {
      showToast('Age restriction: HeartLink requires members to be at least 18 years old.', 'alert');
      return;
    }
    setCurrentUserId(userId);
    setActiveScreen('discover');
    showToast(`Welcome back, ${target.name}!`, 'success');
  };

  const signup = (userData: Partial<User>): { success: boolean; error?: string } => {
    const age = userData.age ?? 0;
    // Strict age restriction check
    if (age < 10) {
      return { success: false, error: 'Registration rejected: strictly restricted for ages under 10.' };
    }
    if (age < 18) {
      return { success: false, error: 'HeartLink is strictly 18+. You must be at least 18 years old to join.' };
    }
    if (!userData.name?.trim()) {
      return { success: false, error: 'Name is required' };
    }

    const newUserId = 'user_' + Date.now();
    const newUser: User = {
      id: newUserId,
      name: userData.name.trim(),
      age: userData.age || 22,
      birthDate: userData.birthDate || '2004-01-01',
      gender: userData.gender || 'woman',
      lookingFor: userData.lookingFor || 'men',
      relationshipGoal: userData.relationshipGoal || 'long-term',
      bio: userData.bio || 'Excited to make genuine connections on HeartLink.',
      occupation: userData.occupation || 'Creative',
      company: userData.company || '',
      education: userData.education || '',
      height: userData.height || "5'7\"",
      location: userData.location || { city: 'San Francisco, CA', distanceKm: 5 },
      interests: userData.interests && userData.interests.length > 0 ? userData.interests : ['Specialty Coffee', 'Music', 'Hiking'],
      photos: userData.photos && userData.photos.length > 0 ? userData.photos : [INITIAL_USERS[0].photos[0]],
      prompts: userData.prompts || [
        { question: 'A boundary of mine is', answer: 'Clear and honest communication.' },
        { question: 'Together we could', answer: 'Explore new coffee spots and share great stories.' },
      ],
      isVerified: false,
      verificationStatus: 'none',
      isPremium: false,
      role: 'user',
      accountStatus: 'active',
      settings: {
        incognito: false,
        hideDistance: false,
        readReceipts: true,
        notifications: true,
        ageRange: [18, 35],
        maxDistanceKm: 50,
      },
      likedUserIds: [],
      passedUserIds: [],
      superLikedUserIds: [],
      blockedUserIds: [],
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUserId);
    setActiveScreen('photo_upload');
    showToast('Account created successfully! Upload your photos.', 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    setActiveScreen('auth');
    showToast('Signed out of HeartLink', 'info');
  };

  const switchUser = (userId: string) => {
    login(userId);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUserId) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, ...updates } : u))
    );
    showToast('Profile updated', 'success');
  };

  const deleteAccount = () => {
    if (!currentUserId) return;
    setUsers((prev) => prev.filter((u) => u.id !== currentUserId));
    setMatches((prev) =>
      prev.filter((m) => m.userId1 !== currentUserId && m.userId2 !== currentUserId)
    );
    setCurrentUserId(null);
    setActiveScreen('auth');
    showToast('Your account and personal data have been completely deleted.', 'info');
  };

  const upgradeToPremium = () => {
    if (!currentUserId) return;
    updateProfile({ isPremium: true });
    setIsPremiumModalOpen(false);
    showToast('Welcome to HeartLink Platinum! Unlimited likes & passport unlocked.', 'success');
  };

  // Matching algorithm: Liking a user
  const likeUser = (targetUserId: string, isSuperLike = false) => {
    if (!currentUser) return;

    setLastAction({ type: 'like', targetUserId });

    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) return;

    const newLiked = Array.from(new Set([...currentUser.likedUserIds, targetUserId]));
    const newSuper = isSuperLike
      ? Array.from(new Set([...currentUser.superLikedUserIds, targetUserId]))
      : currentUser.superLikedUserIds;

    // Update current user's liked list
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, likedUserIds: newLiked, superLikedUserIds: newSuper }
          : u
      )
    );

    // Check mutual matching condition:
    // Does targetUser like current user?
    const isMutual = targetUser.likedUserIds.includes(currentUser.id);

    if (isMutual) {
      // Trigger celebration haptic pattern on mobile
      triggerHaptic('celebration');

      // Create new mutual match!
      const newMatchId = `match_${currentUser.id}_${targetUserId}_${Date.now()}`;
      const newMatch: Match = {
        id: newMatchId,
        userId1: currentUser.id,
        userId2: targetUserId,
        matchedAt: new Date().toISOString(),
        unreadCount1: 0,
        unreadCount2: 0,
        isSuperLike,
      };

      setMatches((prev) => [newMatch, ...prev]);

      // Trigger Celebration Screen
      setMatchCelebration({
        user1: currentUser,
        user2: targetUser,
        matchId: newMatchId,
      });

      showToast(`It’s a Match with ${targetUser.name}! ❤️`, 'success');
    } else {
      showToast(isSuperLike ? `Super Liked ${targetUser.name}! ⭐` : `Liked ${targetUser.name}`, 'info');
    }
  };

  const passUser = (targetUserId: string) => {
    if (!currentUser) return;
    setLastAction({ type: 'pass', targetUserId });

    const newPassed = Array.from(new Set([...currentUser.passedUserIds, targetUserId]));
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, passedUserIds: newPassed } : u))
    );
  };

  const rewindLastAction = () => {
    if (!currentUser || !lastAction) {
      showToast('No recent action to rewind', 'info');
      return;
    }
    const { type, targetUserId } = lastAction;
    if (type === 'like') {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                likedUserIds: u.likedUserIds.filter((id) => id !== targetUserId),
                superLikedUserIds: u.superLikedUserIds.filter((id) => id !== targetUserId),
              }
            : u
        )
      );
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, passedUserIds: u.passedUserIds.filter((id) => id !== targetUserId) }
            : u
        )
      );
    }
    setLastAction(null);
    showToast('Rewound profile', 'info');
  };

  const sendMessage = (matchId: string, text: string, isIcebreaker = false) => {
    if (!currentUser || !text.trim()) return;

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const receiverId = match.userId1 === currentUser.id ? match.userId2 : match.userId1;
    const receiverUser = users.find((u) => u.id === receiverId);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      receiverId,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
      isRead: false,
      isIcebreaker,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update match preview
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              lastMessage: text.trim(),
              lastMessageAt: new Date().toISOString(),
              unreadCount2: m.userId1 === currentUser.id ? m.unreadCount2 + 1 : m.unreadCount2,
              unreadCount1: m.userId2 === currentUser.id ? m.unreadCount1 + 1 : m.unreadCount1,
            }
          : m
      )
    );

    // Recipient reads the message shortly after delivery (read receipt simulation)
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id ? { ...m, status: 'read', isRead: true } : m
        )
      );
    }, 600);

    // Partner starts typing after 800ms
    setTimeout(() => {
      setTypingMatchIds((prev) => Array.from(new Set([...prev, matchId])));
    }, 800);

    // Realistic persona dynamic reply after 1.8 seconds!
    setTimeout(() => {
      let replyText = 'That’s wonderful! Tell me more about that.';
      if (receiverUser) {
        if (receiverUser.interests.includes('Architecture')) {
          replyText = 'I love that perspective! Clean lines and good lighting change everything.';
        } else if (receiverUser.interests.includes('Ocean Conservation')) {
          replyText = 'Haha totally! The Pacific has some incredible spots, we should check it out sometime!';
        } else if (receiverUser.interests.includes('Cooking')) {
          replyText = 'Oh wow! I actually just experimented with that recipe last Sunday. Do you cook often?';
        } else {
          replyText = `That sounds awesome! What else are you passionate about, ${currentUser.name}?`;
        }
      }

      const botReplyMsg: Message = {
        id: `msg_reply_${Date.now()}`,
        matchId,
        senderId: receiverId,
        receiverId: currentUser.id,
        text: replyText,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };

      setMessages((prev) => [...prev, botReplyMsg]);
      // Clear typing indicator
      setTypingMatchIds((prev) => prev.filter((id) => id !== matchId));

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                lastMessage: replyText,
                lastMessageAt: new Date().toISOString(),
              }
            : m
        )
      );
    }, 1800);
  };

  const sendVoiceMessage = (
    matchId: string,
    audioUrl: string,
    durationSeconds: number,
    waveform?: number[]
  ) => {
    if (!currentUser) return;
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const receiverId = match.userId1 === currentUser.id ? match.userId2 : match.userId1;
    const receiverUser = users.find((u) => u.id === receiverId);

    const safeSecs = Math.max(1, Math.round(durationSeconds));
    const formattedDuration = `${Math.floor(safeSecs / 60)}:${(safeSecs % 60)
      .toString()
      .padStart(2, '0')}`;

    const newMsg: Message = {
      id: `msg_voice_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      receiverId,
      text: `🎤 Voice note (${formattedDuration})`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isRead: false,
      attachmentType: 'voice',
      attachmentUrl: audioUrl,
      voiceDuration: durationSeconds,
      voiceWaveform: waveform,
    };

    setMessages((prev) => [...prev, newMsg]);

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              lastMessage: `🎤 Voice note (${formattedDuration})`,
              lastMessageAt: new Date().toISOString(),
              unreadCount2: m.userId1 === currentUser.id ? m.unreadCount2 + 1 : m.unreadCount2,
              unreadCount1: m.userId2 === currentUser.id ? m.unreadCount1 + 1 : m.unreadCount1,
            }
          : m
      )
    );

    // Partner reads after 600ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read', isRead: true } : m))
      );
    }, 600);

    // Partner starts typing after 900ms
    setTimeout(() => {
      setTypingMatchIds((prev) => Array.from(new Set([...prev, matchId])));
    }, 900);

    // Partner responds to the voice note after 2200ms
    setTimeout(() => {
      let voiceReply = 'Loved hearing your voice note! Your voice has such a warm, reassuring presence 😊';
      if (receiverUser) {
        if (receiverUser.interests.includes('Vinyl Records') || receiverUser.interests.includes('Music')) {
          voiceReply = 'Aww your voice has such great warmth and cadence! We definitely need to compare record playlists soon 🎶';
        } else if (receiverUser.interests.includes('Ocean Conservation')) {
          voiceReply = 'Haha hearing you explain that was great! Your voice is super calming 🌊';
        } else if (receiverUser.interests.includes('Architecture')) {
          voiceReply = 'That was so cool to hear! Your voice totally matches the creative vibe of your profile ✨';
        } else {
          voiceReply = `Hearing your actual voice made my day, ${currentUser.name}! It feels so much more authentic than just texting 💬`;
        }
      }

      const botReplyMsg: Message = {
        id: `msg_reply_${Date.now()}`,
        matchId,
        senderId: receiverId,
        receiverId: currentUser.id,
        text: voiceReply,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };

      setMessages((prev) => [...prev, botReplyMsg]);
      setTypingMatchIds((prev) => prev.filter((id) => id !== matchId));

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                lastMessage: voiceReply,
                lastMessageAt: new Date().toISOString(),
              }
            : m
        )
      );
    }, 2200);
  };

  const sendMiniGame = (matchId: string, gameData: MiniGameData, introText: string) => {
    if (!currentUser) return;
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const receiverId = match.userId1 === currentUser.id ? match.userId2 : match.userId1;

    const newMsg: Message = {
      id: `msg_game_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      receiverId,
      text: introText,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isRead: false,
      attachmentType: 'minigame',
      gameData,
    };

    setMessages((prev) => [...prev, newMsg]);

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              lastMessage: introText,
              lastMessageAt: new Date().toISOString(),
              unreadCount2: m.userId1 === currentUser.id ? m.unreadCount2 + 1 : m.unreadCount2,
              unreadCount1: m.userId2 === currentUser.id ? m.unreadCount1 + 1 : m.unreadCount1,
            }
          : m
      )
    );

    // Partner reads after 600ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read', isRead: true } : m))
      );
    }, 600);

    // Partner starts typing after 1200ms
    setTimeout(() => {
      setTypingMatchIds((prev) => Array.from(new Set([...prev, matchId])));
    }, 1200);

    // Partner completes interactive mini-game and replies after 3200ms!
    setTimeout(() => {
      let partnerReplyText = '';
      if (gameData.type === 'two_truths_and_a_lie') {
        const isLieGuessed = Math.random() > 0.45;
        const guessIdx = isLieGuessed ? gameData.lieIndex : (gameData.lieIndex === 0 ? 1 : 0);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMsg.id && m.gameData?.type === 'two_truths_and_a_lie'
              ? {
                  ...m,
                  gameData: {
                    ...m.gameData,
                    guesserId: receiverId,
                    guessIndex: guessIdx,
                    isGuessedCorrectly: isLieGuessed,
                    resolved: true,
                  },
                }
              : m
          )
        );

        partnerReplyText = isLieGuessed
          ? `Hahaha I KNEW option ${String.fromCharCode(65 + guessIdx)} was the lie! 😂 Your explanation made my day!`
          : `Wait, really?! I was convinced option ${String.fromCharCode(65 + guessIdx)} was made up! You definitely fooled me 👏`;
      } else if (gameData.type === 'music_taste_blind_test') {
        const pickedSong = gameData.songs[Math.floor(Math.random() * gameData.songs.length)];
        const isExactMatch = pickedSong.id === gameData.creatorPickId;
        const matchPct = isExactMatch ? 100 : Math.floor(75 + Math.random() * 20);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMsg.id && m.gameData?.type === 'music_taste_blind_test'
              ? {
                  ...m,
                  gameData: {
                    ...m.gameData,
                    partnerGuessId: pickedSong.id,
                    matchPercentage: matchPct,
                    resolved: true,
                  },
                }
              : m
          )
        );

        partnerReplyText = isExactMatch
          ? `OMG, I locked in ${pickedSong.title}! 🎧 100% music soulmates, that track is iconic.`
          : `I guessed ${pickedSong.title}! Our vibe score is ${matchPct}%—we definitely have to swap Spotify playlists! 🎶`;
      } else if (gameData.type === 'quick_trivia') {
        const partnerAnswers: Record<string, string> = {};
        gameData.questions.forEach((q) => {
          partnerAnswers[q.id] = q.options[Math.floor(Math.random() * q.options.length)];
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMsg.id && m.gameData?.type === 'quick_trivia'
              ? {
                  ...m,
                  gameData: {
                    ...m.gameData,
                    partnerAnswers,
                    compatibilityScore: 85,
                    resolved: true,
                  },
                }
              : m
          )
        );

        partnerReplyText = `Just submitted my quiz answers! 85% chemistry match—looks like our weekend energy is in sync ⚡`;
      }

      const botReplyMsg: Message = {
        id: `msg_game_reply_${Date.now()}`,
        matchId,
        senderId: receiverId,
        receiverId: currentUser.id,
        text: partnerReplyText,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };

      setMessages((prev) => [...prev, botReplyMsg]);
      setTypingMatchIds((prev) => prev.filter((id) => id !== matchId));

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                lastMessage: partnerReplyText,
                lastMessageAt: new Date().toISOString(),
              }
            : m
        )
      );
    }, 3200);
  };

  const respondToMiniGame = (messageId: string, updates: Record<string, any>) => {
    if (!currentUser) return;

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId || !m.gameData) return m;
        return {
          ...m,
          gameData: {
            ...m.gameData,
            ...updates,
          } as any,
        };
      })
    );

    // If responding to a game sent by partner, trigger partner follow-up reaction
    const targetMessage = messages.find((m) => m.id === messageId);
    if (targetMessage && targetMessage.senderId !== currentUser.id) {
      const matchId = targetMessage.matchId;
      setTimeout(() => {
        setTypingMatchIds((prev) => Array.from(new Set([...prev, matchId])));
      }, 1000);

      setTimeout(() => {
        let reactionText = 'Haha nice one! Love that you played along 🎉';
        if (targetMessage.gameData?.type === 'two_truths_and_a_lie') {
          reactionText = updates.isGuessedCorrectly
            ? 'Aha! You spotted my lie so fast! How did you know?! 😂'
            : 'Haha! You fell for it! You thought my pigeon fear was the lie? That one is 100% true! 🕊️';
        } else if (targetMessage.gameData?.type === 'music_taste_blind_test') {
          reactionText = 'Great taste! We should definitely turn this into a shared road trip playlist!';
        } else if (targetMessage.gameData?.type === 'quick_trivia') {
          reactionText = 'Haha our answers match up nicely! High-five ⚡';
        }

        const replyMsg: Message = {
          id: `msg_reaction_${Date.now()}`,
          matchId,
          senderId: targetMessage.senderId,
          receiverId: currentUser.id,
          text: reactionText,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };

        setMessages((prev) => [...prev, replyMsg]);
        setTypingMatchIds((prev) => prev.filter((id) => id !== matchId));

        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  lastMessage: reactionText,
                  lastMessageAt: new Date().toISOString(),
                }
              : m
          )
        );
      }, 2600);
    }
  };

  const markMessagesAsRead = (matchId: string) => {
    if (!currentUser) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.matchId === matchId && m.receiverId === currentUser.id && !m.isRead
          ? { ...m, isRead: true, status: 'read' }
          : m
      )
    );
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          unreadCount1: m.userId1 === currentUser.id ? 0 : m.unreadCount1,
          unreadCount2: m.userId2 === currentUser.id ? 0 : m.unreadCount2,
        };
      })
    );
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    triggerHaptic('light');

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentReactions = msg.reactions || [];
        const hasUserReactedWithEmoji = currentReactions.some(
          (r) => r.emoji === emoji && r.userId === currentUser.id
        );

        let updatedReactions: MessageReaction[];
        if (hasUserReactedWithEmoji) {
          // Toggle off if user already reacted with this emoji
          updatedReactions = currentReactions.filter(
            (r) => !(r.emoji === emoji && r.userId === currentUser.id)
          );
        } else {
          // Add emoji reaction
          updatedReactions = [...currentReactions, { emoji, userId: currentUser.id }];
        }

        return {
          ...msg,
          reactions: updatedReactions,
        };
      })
    );

    // If reacting to partner's message, occasionally simulate partner reciprocation on user's message
    const targetMsg = messages.find((m) => m.id === messageId);
    if (targetMsg && targetMsg.senderId !== currentUser.id) {
      setTimeout(() => {
        setMessages((prev) => {
          const userMsgs = prev.filter(
            (m) => m.matchId === targetMsg.matchId && m.senderId === currentUser.id
          );
          if (userMsgs.length === 0) return prev;
          const lastUserMsg = userMsgs[userMsgs.length - 1];
          if (!lastUserMsg) return prev;

          const partnerId = targetMsg.senderId;
          const currentRx = lastUserMsg.reactions || [];
          if (currentRx.some((r) => r.userId === partnerId)) return prev;

          const partnerEmojis = ['❤️', '🔥', '✨', '👏'];
          const chosenEmoji = partnerEmojis[Math.floor(Math.random() * partnerEmojis.length)];

          return prev.map((m) =>
            m.id === lastUserMsg.id
              ? {
                  ...m,
                  reactions: [...(m.reactions || []), { emoji: chosenEmoji, userId: partnerId }],
                }
              : m
          );
        });
      }, 1400);
    }
  };

  const unmatchUser = (targetUserId: string) => {
    if (!currentUser) return;
    setMatches((prev) =>
      prev.filter(
        (m) =>
          !(
            (m.userId1 === currentUser.id && m.userId2 === targetUserId) ||
            (m.userId2 === currentUser.id && m.userId1 === targetUserId)
          )
      )
    );
    setActiveChatMatchId(null);
    setActiveScreen('matches');
    showToast('Unmatched successfully', 'info');
  };

  const blockUser = (targetUserId: string) => {
    if (!currentUser) return;
    const newBlocked = Array.from(new Set([...currentUser.blockedUserIds, targetUserId]));
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, blockedUserIds: newBlocked } : u))
    );
    unmatchUser(targetUserId);
    showToast('User blocked. You will no longer see each other.', 'info');
  };

  const reportUser = (
    targetUserId: string,
    reason: UserReport['reason'],
    description: string
  ) => {
    if (!currentUser) return;
    const target = users.find((u) => u.id === targetUserId);
    const newReport: UserReport = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reportedUserId: targetUserId,
      reportedUserName: target?.name || 'Unknown User',
      reason,
      description,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setReports((prev) => [newReport, ...prev]);
    showToast('Report submitted to Trust & Safety. Thank you for keeping HeartLink safe.', 'success');
  };

  const requestVerification = (selfiePose: string) => {
    if (!currentUser) return;
    const newRequest: VerificationRequest = {
      id: `ver_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAge: currentUser.age,
      submittedAt: new Date().toISOString(),
      selfiePose,
      status: 'pending',
    };
    setVerifications((prev) => [newRequest, ...prev]);
    updateProfile({ verificationStatus: 'pending' });
    showToast('Selfie pose submitted! Our automated safety check is reviewing.', 'info');
  };

  // Admin moderation actions
  const adminResolveReport = (reportId: string, action: 'dismiss' | 'suspend_user' | 'warn') => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    if (action === 'suspend_user') {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === report.reportedUserId ? { ...u, accountStatus: 'suspended' } : u
        )
      );
      showToast(`User ${report.reportedUserName} has been suspended`, 'alert');
    } else if (action === 'warn') {
      showToast(`Warning sent to ${report.reportedUserName}`, 'info');
    }

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: action === 'dismiss' ? 'dismissed' : 'resolved',
              actionTaken: action === 'suspend_user' ? 'Account suspended' : action === 'warn' ? 'Official warning issued' : 'Dismissed (no violation)',
            }
          : r
      )
    );
  };

  const adminReviewVerification = (requestId: string, approve: boolean) => {
    const req = verifications.find((v) => v.id === requestId);
    if (!req) return;

    setVerifications((prev) =>
      prev.map((v) => (v.id === requestId ? { ...v, status: approve ? 'approved' : 'rejected' } : v))
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.id === req.userId
          ? {
              ...u,
              isVerified: approve,
              verificationStatus: approve ? 'verified' : 'rejected',
            }
          : u
      )
    );

    showToast(
      approve ? `Verification approved for ${req.userName}` : `Verification rejected for ${req.userName}`,
      approve ? 'success' : 'info'
    );
  };

  const adminToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.accountStatus === 'active' ? 'suspended' : 'active';
          return { ...u, accountStatus: nextStatus };
        }
        return u;
      })
    );
    showToast('Account status updated', 'info');
  };

  // ---------------------------------------------------------------------------
  // Going Now Actions
  // ---------------------------------------------------------------------------
  const createGoingNowBroadcast = (
    data: Omit<
      GoingNowBroadcast,
      'id' | 'userId' | 'userName' | 'userAvatar' | 'userAge' | 'userOccupation' | 'isVerified' | 'createdAt' | 'rsvps'
    >
  ) => {
    if (!currentUser) return;
    const newBroadcast: GoingNowBroadcast = {
      id: `gn_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.photos[0] || '',
      userAge: currentUser.age,
      userOccupation: currentUser.occupation,
      isVerified: currentUser.isVerified,
      createdAt: new Date().toISOString(),
      rsvps: [],
      ...data,
    };
    setGoingNowBroadcasts((prev) => [newBroadcast, ...prev]);
    showToast(`Broadcasted to ${data.venueName}! Nearby members will see your spot. 📍`, 'success');
    triggerHaptic('success');
  };

  const rsvpToGoingNowBroadcast = (
    broadcastId: string,
    status: GoingNowRsvp['status'],
    etaMinutes = 15,
    customMessage = 'Looking forward to meeting up!'
  ) => {
    if (!currentUser) return;
    const broadcast = goingNowBroadcasts.find((b) => b.id === broadcastId);
    if (!broadcast) return;

    const newRsvp: GoingNowRsvp = {
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.photos[0] || '',
      status,
      etaMinutes,
      customMessage,
      createdAt: new Date().toISOString(),
    };

    setGoingNowBroadcasts((prev) =>
      prev.map((b) => {
        if (b.id !== broadcastId) return b;
        const filtered = b.rsvps.filter((r) => r.userId !== currentUser.id);
        return { ...b, rsvps: [...filtered, newRsvp] };
      })
    );

    triggerHaptic('success');
    showToast(`RSVP sent to ${broadcast.venueName}! 🚀`, 'success');

    // If currentUser is not the broadcaster, connect via match or message
    if (broadcast.userId !== currentUser.id) {
      const existingMatch = matches.find(
        (m) =>
          (m.userId1 === currentUser.id && m.userId2 === broadcast.userId) ||
          (m.userId2 === currentUser.id && m.userId1 === broadcast.userId)
      );
      const hostUser = users.find((u) => u.id === broadcast.userId);

      if (existingMatch) {
        sendMessage(
          existingMatch.id,
          `Hey ${hostUser ? hostUser.name : 'there'}! I just RSVP'd to meet at ${broadcast.venueName}! ${etaMinutes ? `(ETA: ~${etaMinutes}m)` : ''} ${customMessage}`
        );
      } else if (hostUser) {
        // Create an instant match connection through Going Now!
        const matchId = `match_${currentUser.id}_${hostUser.id}_${Date.now()}`;
        const newMatch: Match = {
          id: matchId,
          userId1: currentUser.id,
          userId2: hostUser.id,
          matchedAt: new Date().toISOString(),
          unreadCount1: 0,
          unreadCount2: 1,
          lastMessage: `RSVP'd to meet at ${broadcast.venueName}!`,
          lastMessageAt: new Date().toISOString(),
        };
        setMatches((prev) => [newMatch, ...prev]);
        const initialMsg: Message = {
          id: `msg_rsvp_${Date.now()}`,
          matchId,
          senderId: currentUser.id,
          receiverId: hostUser.id,
          text: `Hey ${hostUser.name}! I just RSVP'd to meet at ${broadcast.venueName}! ${etaMinutes ? `(ETA: ~${etaMinutes}m)` : ''} ${customMessage}`,
          timestamp: new Date().toISOString(),
          status: 'sent',
          isRead: false,
        };
        setMessages((prev) => [...prev, initialMsg]);
      }
    }
  };

  const deleteGoingNowBroadcast = (broadcastId: string) => {
    setGoingNowBroadcasts((prev) => prev.filter((b) => b.id !== broadcastId));
    showToast('Broadcast closed', 'info');
  };

  // ---------------------------------------------------------------------------
  // Live Room Roulette Actions
  // ---------------------------------------------------------------------------
  const startLiveRoulette = () => {
    if (!currentUser) return;
    setLiveRoulette({
      status: 'searching',
      partner: null,
      secondsRemaining: 180,
      totalDuration: 180,
      mediaMode: 'video',
      isAudioMuted: false,
      isVideoMuted: false,
      isPartnerAudioMuted: false,
      isPartnerVideoMuted: false,
      userLiked: false,
      partnerLiked: false,
      isMutualMatch: false,
      currentPromptIndex: 0,
      reactions: [],
    });

    triggerHaptic('light');

    // Simulate finding an active partner in ~1.4 seconds
    setTimeout(() => {
      const candidates = users.filter(
        (u) =>
          u.id !== currentUser.id &&
          !currentUser.blockedUserIds.includes(u.id) &&
          u.accountStatus === 'active'
      );
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] || users[1];

      setLiveRoulette((prev) => ({
        ...prev,
        status: 'connected',
        partner: chosen,
        secondsRemaining: 180,
        totalDuration: 180,
      }));
      triggerHaptic('success');
      showToast(`Connected with ${chosen.name}! Say hi 👋`, 'success');
    }, 1400);
  };

  const leaveLiveRoulette = () => {
    setLiveRoulette({
      status: 'idle',
      partner: null,
      secondsRemaining: 180,
      totalDuration: 180,
      mediaMode: 'video',
      isAudioMuted: false,
      isVideoMuted: false,
      isPartnerAudioMuted: false,
      isPartnerVideoMuted: false,
      userLiked: false,
      partnerLiked: false,
      isMutualMatch: false,
      currentPromptIndex: 0,
      reactions: [],
    });
  };

  const skipLiveRoulettePartner = () => {
    if (!currentUser) return;
    triggerHaptic('light');
    setLiveRoulette((prev) => ({
      ...prev,
      status: 'searching',
      partner: null,
      userLiked: false,
      partnerLiked: false,
      isMutualMatch: false,
      reactions: [],
    }));

    setTimeout(() => {
      const candidates = users.filter(
        (u) =>
          u.id !== currentUser.id &&
          (!liveRoulette.partner || u.id !== liveRoulette.partner.id) &&
          !currentUser.blockedUserIds.includes(u.id)
      );
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] || users[0];

      setLiveRoulette((prev) => ({
        ...prev,
        status: 'connected',
        partner: chosen,
        secondsRemaining: 180,
        totalDuration: 180,
        currentPromptIndex: (prev.currentPromptIndex + 1) % LIVE_ROULETTE_ICEBREAKERS.length,
      }));
      triggerHaptic('success');
      showToast(`Switched to ${chosen.name}! ✨`, 'info');
    }, 1100);
  };

  const toggleLiveMediaMode = (mode: LiveMediaMode) => {
    setLiveRoulette((prev) => ({ ...prev, mediaMode: mode }));
    triggerHaptic('light');
  };

  const toggleLiveAudioMute = () => {
    setLiveRoulette((prev) => ({ ...prev, isAudioMuted: !prev.isAudioMuted }));
    triggerHaptic('light');
  };

  const toggleLiveVideoMute = () => {
    setLiveRoulette((prev) => ({ ...prev, isVideoMuted: !prev.isVideoMuted }));
    triggerHaptic('light');
  };

  const sendLiveReaction = (emoji: string) => {
    const newReaction: LiveReaction = {
      id: `react_${Date.now()}_${Math.random()}`,
      emoji,
      sender: 'me',
      xOffset: Math.floor(Math.random() * 70) + 15,
    };
    setLiveRoulette((prev) => ({
      ...prev,
      reactions: [...prev.reactions.slice(-15), newReaction],
    }));
    triggerHaptic('light');

    // Simulate partner reaction back after 1.2s occasionally
    if (Math.random() > 0.4) {
      setTimeout(() => {
        const partnerEmojis = ['💖', '🔥', '✨', '😂', '👏'];
        const randomEmoji = partnerEmojis[Math.floor(Math.random() * partnerEmojis.length)];
        const partnerReaction: LiveReaction = {
          id: `react_partner_${Date.now()}_${Math.random()}`,
          emoji: randomEmoji,
          sender: 'partner',
          xOffset: Math.floor(Math.random() * 70) + 15,
        };
        setLiveRoulette((prev) => ({
          ...prev,
          reactions: [...prev.reactions.slice(-15), partnerReaction],
        }));
      }, 1200);
    }
  };

  const extendLiveRound = () => {
    setLiveRoulette((prev) => ({
      ...prev,
      secondsRemaining: prev.secondsRemaining + 60,
      totalDuration: prev.totalDuration + 60,
    }));
    triggerHaptic('success');
    showToast('+60 seconds added! Partner agreed ⏳', 'success');
  };

  const likeLivePartner = () => {
    if (!currentUser || !liveRoulette.partner) return;
    const partner = liveRoulette.partner;

    setLiveRoulette((prev) => ({ ...prev, userLiked: true }));
    triggerHaptic('light');
    showToast(`You gave ${partner.name} a thumbs up! 👍`, 'info');

    // Partner mutual like simulation after 1.2s
    setTimeout(() => {
      setLiveRoulette((prev) => ({ ...prev, partnerLiked: true, isMutualMatch: true }));
      triggerHaptic('celebration');

      // Create new match in matches
      const existingMatch = matches.find(
        (m) =>
          (m.userId1 === currentUser.id && m.userId2 === partner.id) ||
          (m.userId2 === currentUser.id && m.userId1 === partner.id)
      );

      const matchId = existingMatch?.id || `match_live_${currentUser.id}_${partner.id}_${Date.now()}`;
      if (!existingMatch) {
        const newMatch: Match = {
          id: matchId,
          userId1: currentUser.id,
          userId2: partner.id,
          matchedAt: new Date().toISOString(),
          unreadCount1: 0,
          unreadCount2: 1,
          lastMessage: 'Mutual like in Live Room Roulette! 🎉',
          lastMessageAt: new Date().toISOString(),
        };
        setMatches((prev) => [newMatch, ...prev]);

        const introMsg: Message = {
          id: `msg_live_${Date.now()}`,
          matchId,
          senderId: currentUser.id,
          receiverId: partner.id,
          text: `It's a Match! 🎉 Loved chatting in Live Roulette!`,
          timestamp: new Date().toISOString(),
          status: 'sent',
          isRead: false,
        };
        setMessages((prev) => [...prev, introMsg]);
      }

      setMatchCelebration({
        user1: currentUser,
        user2: partner,
        matchId,
      });
      showToast(`Mutual Match with ${partner.name}! 🎉 Check your Matches!`, 'success');
    }, 1200);
  };

  const nextLivePrompt = () => {
    setLiveRoulette((prev) => ({
      ...prev,
      currentPromptIndex: (prev.currentPromptIndex + 1) % LIVE_ROULETTE_ICEBREAKERS.length,
    }));
    triggerHaptic('light');
  };

  // ---------------------------------------------------------------------------
  // Rapid-Match Countdown Actions
  // ---------------------------------------------------------------------------
  const startRapidMatch = () => {
    if (!currentUser) return;
    const candidates = users.filter(
      (u) =>
        u.id !== currentUser.id &&
        !currentUser.blockedUserIds.includes(u.id) &&
        u.accountStatus === 'active'
    );
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || users[1];

    setRapidMatch({
      id: `rm_${Date.now()}`,
      partner: chosen,
      totalSeconds: 180,
      secondsRemaining: 180,
      currentPromptIndex: 0,
      prompts: RAPID_MATCH_PROMPTS,
      userAnswers: {},
      partnerAnswers: {},
      userSaved: false,
      partnerSaved: false,
      status: 'active',
      chatMessages: [
        {
          id: `rc_${Date.now()}_1`,
          sender: 'partner',
          text: `Hey ${currentUser.name}! Let's see if we vibe before the timer runs out! ⏳`,
          timestamp: 'Just now',
        },
      ],
    });
    triggerHaptic('light');
    showToast(`Rapid Match started with ${chosen.name}! 3 minutes on the clock ⏱️`, 'info');
  };

  const answerRapidPrompt = (promptId: string, optionIndex: number) => {
    if (!rapidMatch) return;
    triggerHaptic('light');

    setRapidMatch((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        userAnswers: { ...prev.userAnswers, [promptId]: optionIndex },
      };
    });

    // Partner answers after 700ms
    setTimeout(() => {
      setRapidMatch((prev) => {
        if (!prev) return null;
        // 70% chance partner picks same answer for high chemistry
        const partnerPick =
          Math.random() > 0.3
            ? optionIndex
            : (optionIndex + 1) % (RAPID_MATCH_PROMPTS.find((p) => p.id === promptId)?.options.length || 4);

        const updatedPartnerAnswers = { ...prev.partnerAnswers, [promptId]: partnerPick };
        const nextIndex =
          prev.currentPromptIndex < RAPID_MATCH_PROMPTS.length - 1
            ? prev.currentPromptIndex + 1
            : prev.currentPromptIndex;

        return {
          ...prev,
          partnerAnswers: updatedPartnerAnswers,
          currentPromptIndex: nextIndex,
        };
      });
      triggerHaptic('success');
    }, 700);
  };

  const sendRapidChatMessage = (text: string) => {
    if (!rapidMatch || !text.trim() || !currentUser) return;
    const msgId = `rc_${Date.now()}`;
    const newMsg = {
      id: msgId,
      sender: 'me' as const,
      text: text.trim(),
      timestamp: 'Just now',
    };

    setRapidMatch((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chatMessages: [...prev.chatMessages, newMsg],
      };
    });

    // Partner replies after 1.3s
    setTimeout(() => {
      const partnerReplies = [
        'Haha totally agree on that!',
        'No way, that was my exact answer too!',
        'Ooh bold choice, respect!',
        'Timer is ticking down fast! Should we save this?',
        'I am definitely saving our match before time runs out!',
      ];
      const replyText = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
      setRapidMatch((prev) => {
        if (!prev || prev.status !== 'active') return prev;
        return {
          ...prev,
          chatMessages: [
            ...prev.chatMessages,
            {
              id: `rc_partner_${Date.now()}`,
              sender: 'partner',
              text: replyText,
              timestamp: 'Just now',
            },
          ],
        };
      });
    }, 1300);
  };

  const saveRapidMatch = () => {
    if (!rapidMatch || !currentUser) return;
    const partner = rapidMatch.partner;

    setRapidMatch((prev) => (prev ? { ...prev, userSaved: true } : null));
    triggerHaptic('light');
    showToast(`You decided to save ${partner.name}! Awaiting their choice... 🤞`, 'info');

    // Partner saves too after 1.1s!
    setTimeout(() => {
      setRapidMatch((prev) => (prev ? { ...prev, partnerSaved: true, status: 'saved' } : null));
      triggerHaptic('celebration');

      // Create match in matches
      const existingMatch = matches.find(
        (m) =>
          (m.userId1 === currentUser.id && m.userId2 === partner.id) ||
          (m.userId2 === currentUser.id && m.userId1 === partner.id)
      );

      const matchId = existingMatch?.id || `match_rapid_${currentUser.id}_${partner.id}_${Date.now()}`;
      if (!existingMatch) {
        const newMatch: Match = {
          id: matchId,
          userId1: currentUser.id,
          userId2: partner.id,
          matchedAt: new Date().toISOString(),
          unreadCount1: 0,
          unreadCount2: 1,
          lastMessage: 'Locked in during 3-Minute Rapid Match! ⚡',
          lastMessageAt: new Date().toISOString(),
        };
        setMatches((prev) => [newMatch, ...prev]);

        const introMsg: Message = {
          id: `msg_rapid_${Date.now()}`,
          matchId,
          senderId: currentUser.id,
          receiverId: partner.id,
          text: `We saved our Rapid Match with seconds to spare! ⚡ Excited to chat more!`,
          timestamp: new Date().toISOString(),
          status: 'sent',
          isRead: false,
        };
        setMessages((prev) => [...prev, introMsg]);
      }

      setMatchCelebration({
        user1: currentUser,
        user2: partner,
        matchId,
      });
      showToast(`Connection Locked In! 🎉 ${partner.name} is now in your Matches!`, 'success');
    }, 1100);
  };

  const closeRapidMatch = () => {
    setRapidMatch(null);
  };

  // ---------------------------------------------------------------------------
  // Sound-Wave Blind Date (Voice & Ambient Sync) Actions
  // ---------------------------------------------------------------------------
  const sendSoundWaveVoiceReply = (
    profileId: string,
    durationSeconds = 18,
    ambientTrack: AmbientSyncTrack = 'lofi_vinyl',
    customText?: string
  ) => {
    if (!currentUser) return;
    const target = soundWaveProfiles.find((p) => p.id === profileId);
    if (!target) return;

    const nextCount = Math.min(3, target.voiceRepliesCount + 1);
    const willUnlock = nextCount >= 3;

    setSoundWaveProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== profileId) return p;
        return {
          ...p,
          voiceRepliesCount: nextCount,
          isUnlocked: willUnlock ? true : p.isUnlocked,
          hasListened: true,
        };
      })
    );

    triggerHaptic(willUnlock ? 'celebration' : 'success');

    if (willUnlock) {
      showToast(
        `✨ 3 Voice Notes Exchanged! Full Unblurred Profile Unlocked for ${target.userName}!`,
        'success'
      );

      // Create mutual match connection if one does not already exist
      const existingMatch = matches.find(
        (m) =>
          (m.userId1 === currentUser.id && m.userId2 === target.userId) ||
          (m.userId2 === currentUser.id && m.userId1 === target.userId)
      );

      const targetUser = users.find((u) => u.id === target.userId);
      const matchId = existingMatch?.id || `match_sw_${currentUser.id}_${target.userId}_${Date.now()}`;

      if (!existingMatch && targetUser) {
        const newMatch: Match = {
          id: matchId,
          userId1: currentUser.id,
          userId2: target.userId,
          matchedAt: new Date().toISOString(),
          unreadCount1: 0,
          unreadCount2: 1,
          lastMessage: '3 Voice Notes Exchanged! Full profile unlocked! 🌊✨',
          lastMessageAt: new Date().toISOString(),
        };
        setMatches((prev) => [newMatch, ...prev]);

        const unlockMsg: Message = {
          id: `msg_sw_${Date.now()}`,
          matchId,
          senderId: currentUser.id,
          receiverId: target.userId,
          text: `🌊 Sound-Wave Blind Date Unlocked! We exchanged 3 voice notes with ambient sync and proved real voice chemistry!`,
          timestamp: new Date().toISOString(),
          status: 'sent',
          isRead: false,
        };
        setMessages((prev) => [...prev, unlockMsg]);

        setMatchCelebration({
          user1: currentUser,
          user2: targetUser,
          matchId,
        });
      }
    } else {
      const remaining = 3 - nextCount;
      const revealPercent = nextCount * 25 + 25;
      showToast(
        `Voice reply sent! Visuals de-pixelated (${revealPercent}% revealed). ${remaining} more to full unlock! 🎙️`,
        'success'
      );
    }
  };

  const markSoundWaveListened = (profileId: string) => {
    setSoundWaveProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== profileId) return p;
        return { ...p, hasListened: true };
      })
    );
  };

  const publishUserSoundWave = (
    promptQuestion: string,
    transcript: string,
    ambientTrack: AmbientSyncTrack,
    cadenceLabel: string
  ) => {
    if (!currentUser) return;
    const newProfile: SoundWaveProfile = {
      id: `sw_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAge: currentUser.age,
      userOccupation: currentUser.occupation,
      isVerified: currentUser.isVerified,
      distanceKm: 0.1,
      photoUrl: currentUser.photos[0] || '',
      promptQuestion,
      promptAnswerTranscript: transcript,
      audioDurationSeconds: 20,
      waveform: [
        0.3, 0.6, 0.8, 0.4, 0.9, 0.7, 0.85, 0.5, 0.95, 0.6, 0.4, 0.8, 0.75, 0.9, 0.65, 0.5,
        0.7, 0.85, 0.9, 0.6, 0.4, 0.75, 0.8, 0.55, 0.9, 0.7, 0.6, 0.85, 0.7, 0.5, 0.4, 0.3,
      ],
      ambientTrack,
      ambientTrackLabel:
        ambientTrack === 'lofi_vinyl'
          ? 'Lo-Fi Beats & Vinyl'
          : ambientTrack === 'rain_outside'
          ? 'Gentle Rain on Window'
          : ambientTrack === 'cafe_jazz'
          ? 'Café Jazz & Pour-Over'
          : ambientTrack === 'ocean_waves'
          ? 'Sunset Ocean Waves'
          : 'City Skyline Hum',
      ambientTrackEmoji:
        ambientTrack === 'lofi_vinyl'
          ? '☕'
          : ambientTrack === 'rain_outside'
          ? '🌧️'
          : ambientTrack === 'cafe_jazz'
          ? '🎷'
          : ambientTrack === 'ocean_waves'
          ? '🌊'
          : '🌆',
      voiceCadenceLabel: cadenceLabel || 'Warm & Expressive',
      createdAt: new Date().toISOString(),
      voiceRepliesCount: 0,
      isUnlocked: true,
      hasListened: true,
    };

    setSoundWaveProfiles((prev) => [newProfile, ...prev]);
    showToast('Your 20s Soundscape is now live on Sound-Wave Blind Date! 🎙️🌊', 'success');
    triggerHaptic('success');
  };

  // ---------------------------------------------------------------------------
  // Snap-Style Casual Interactions Actions
  // ---------------------------------------------------------------------------
  const postDualCameraVibe = (
    caption: string,
    locationTag: string,
    promptLabel = "Today's Vibe • Unfiltered Reality",
    frontPhotoUrl?: string,
    backPhotoUrl?: string
  ) => {
    if (!currentUser) return;
    const newVibe: DualCameraVibe = {
      id: `vibe_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAge: currentUser.age,
      userAvatar: currentUser.photos[0] || '',
      isVerified: currentUser.isVerified,
      frontPhotoUrl: frontPhotoUrl || currentUser.photos[0] || '',
      backPhotoUrl:
        backPhotoUrl ||
        currentUser.photos[1] ||
        currentUser.photos[0] ||
        '',
      caption: caption.trim() || 'A snapshot of right now.',
      locationTag: locationTag.trim() || 'San Francisco, CA',
      timeAgoLabel: 'Just now',
      promptLabel,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedByMe: false,
      commentsCount: 0,
    };

    setDualCameraVibes((prev) => [newVibe, ...prev]);
    showToast("Today's Vibe posted! ✨ Unfiltered & live for 24 hours.", 'success');
    triggerHaptic('success');
  };

  const likeDualCameraVibe = (vibeId: string) => {
    setDualCameraVibes((prev) =>
      prev.map((v) => {
        if (v.id !== vibeId) return v;
        const nextLiked = !v.likedByMe;
        return {
          ...v,
          likedByMe: nextLiked,
          likesCount: nextLiked ? v.likesCount + 1 : Math.max(0, v.likesCount - 1),
        };
      })
    );
    triggerHaptic('light');
  };

  const sendSelfDestructSnap = (
    matchId: string,
    mediaType: 'photo' | 'voice' | 'clip',
    mediaUrl: string,
    caption?: string,
    doodles?: DoodlePath[],
    stickerEmoji?: string,
    viewDurationSeconds = 5
  ) => {
    if (!currentUser) return;
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const receiverId = match.userId1 === currentUser.id ? match.userId2 : match.userId1;
    const receiverUser = users.find((u) => u.id === receiverId);

    const snapId = `snap_${Date.now()}`;
    const snapData: SelfDestructSnap = {
      id: snapId,
      matchId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId,
      mediaType,
      mediaUrl,
      caption,
      doodles,
      stickerEmoji,
      viewDurationSeconds,
      isOpened: false,
      hasExpired: false,
      canReplay: true,
      createdAt: new Date().toISOString(),
    };

    const newMsg: Message = {
      id: `msg_snap_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      receiverId,
      text: `🔥 Disappearing Snap (${viewDurationSeconds}s)`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isRead: false,
      attachmentType: 'snap',
      snapData,
    };

    setMessages((prev) => [...prev, newMsg]);

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              lastMessage: `🔥 Disappearing Snap (${viewDurationSeconds}s)`,
              lastMessageAt: new Date().toISOString(),
              unreadCount2: m.userId1 === currentUser.id ? m.unreadCount2 + 1 : m.unreadCount2,
              unreadCount1: m.userId2 === currentUser.id ? m.unreadCount1 + 1 : m.unreadCount1,
            }
          : m
      )
    );

    triggerHaptic('success');
    showToast(`Disappearing Snap sent to ${receiverUser?.name || 'match'}! 🔥`, 'success');

    // Simulate partner viewing and replying with their own snap after 3.8s!
    setTimeout(() => {
      if (receiverUser) {
        const partnerSnapId = `snap_partner_${Date.now()}`;
        const partnerSnap: SelfDestructSnap = {
          id: partnerSnapId,
          matchId,
          senderId: receiverUser.id,
          senderName: receiverUser.name,
          receiverId: currentUser.id,
          mediaType: 'photo',
          mediaUrl: receiverUser.photos[0],
          caption: 'Haha love your snap! Here is my view right now 👀✨',
          stickerEmoji: '✨',
          viewDurationSeconds: 5,
          isOpened: false,
          hasExpired: false,
          canReplay: true,
          createdAt: new Date().toISOString(),
        };

        const partnerMsg: Message = {
          id: `msg_partner_snap_${Date.now()}`,
          matchId,
          senderId: receiverUser.id,
          receiverId: currentUser.id,
          text: `🔥 Disappearing Snap (5s)`,
          timestamp: new Date().toISOString(),
          status: 'sent',
          isRead: false,
          attachmentType: 'snap',
          snapData: partnerSnap,
        };

        setMessages((prev) => [...prev, partnerMsg]);
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  lastMessage: `🔥 Disappearing Snap (5s)`,
                  lastMessageAt: new Date().toISOString(),
                  unreadCount1: m.userId1 === currentUser.id ? m.unreadCount1 + 1 : m.unreadCount1,
                  unreadCount2: m.userId2 === currentUser.id ? m.unreadCount2 + 1 : m.unreadCount2,
                }
              : m
          )
        );
        showToast(`${receiverUser.name} sent you a Disappearing Snap! 🔥`, 'info');
      }
    }, 3800);
  };

  const markSnapViewed = (snapId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (!m.snapData || m.snapData.id !== snapId) return m;
        return {
          ...m,
          snapData: {
            ...m.snapData,
            isOpened: true,
            hasExpired: true,
          },
        };
      })
    );
  };

  // ---------------------------------------------------------------------------
  // Interactive AR Lens Challenges Actions
  // ---------------------------------------------------------------------------
  const startARLensChallenge = (partnerId: string, challengeType: ARLensChallengeType = 'this_or_that') => {
    if (!currentUser) return;
    const partner = users.find((u) => u.id === partnerId) || users[1];

    setArLensChallenge({
      id: `ar_${Date.now()}`,
      type: challengeType,
      title:
        challengeType === 'this_or_that'
          ? 'This or That AR Lens Challenge'
          : challengeType === 'guess_the_song'
          ? 'Guess the Song AR Challenge'
          : '2-Truths & A Lie AR Challenge',
      partnerId: partner.id,
      partnerName: partner.name,
      partnerAvatar: partner.photos[0] || '',
      currentRound: 0,
      totalRounds: AR_THIS_OR_THAT_QUESTIONS.length,
      matchScore: 0,
      status: 'active',
    });

    triggerHaptic('light');
    showToast(`AR Lens Challenge started with ${partner.name}! 📸`, 'info');
  };

  const makeARLensChoice = (choice: 'left' | 'right') => {
    if (!arLensChallenge) return;
    triggerHaptic('light');

    const isMatchWithPartner = Math.random() > 0.35; // 65% match chance
    const partnerChoice: 'left' | 'right' = isMatchWithPartner ? choice : choice === 'left' ? 'right' : 'left';

    const currentScore = arLensChallenge.matchScore;
    const addedScore = isMatchWithPartner ? Math.floor(100 / arLensChallenge.totalRounds) : 5;
    const newScore = Math.min(100, currentScore + addedScore);

    const isLastRound = arLensChallenge.currentRound >= arLensChallenge.totalRounds - 1;

    setArLensChallenge((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        myChoice: choice,
        partnerChoice,
        matchScore: newScore,
        status: isLastRound ? 'completed' : 'active',
        currentRound: isLastRound ? prev.currentRound : prev.currentRound + 1,
      };
    });

    if (isLastRound) {
      triggerHaptic('celebration');
      showToast(
        `AR Challenge Completed! ${newScore}% Chemistry Match with ${arLensChallenge.partnerName}! 🎉`,
        'success'
      );
    }
  };

  const closeARLensChallenge = () => {
    setArLensChallenge(null);
  };

  // -------------------------------------------------------------------------
  // The "Anti-Ghosting" Karma Engine & Active Chat Limit Implementation
  // -------------------------------------------------------------------------
  const [userKarma, setUserKarma] = useState<UserKarmaProfile>(() => {
    const saved = localStorage.getItem('heartlink_karma');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved karma', e);
      }
    }
    return {
      score: 96,
      tierName: 'Spotlight Emerald',
      badges: ['prompt_responder', 'zero_ghost_karma', 'intentional_dater'],
      activeChatCount: 2,
      maxActiveChats: 3,
      responseRatePercent: 98,
      avgResponseMinutes: 12,
      ghostFreeStreakDays: 14,
      irlDatesCompleted: 3,
      socialsExchanged: 2,
      politeDeparturesSent: 4,
      feedBoostMultiplier: 1.25,
    };
  });

  const [pendingBlockedMatchId, setPendingBlockedMatchId] = useState<string | null>(null);

  // Sync Karma to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('heartlink_karma', JSON.stringify(userKarma));
    } catch (e) {
      console.error('Failed to save karma', e);
    }
  }, [userKarma]);

  // Compute active chat matches (limit 3)
  const activeChatMatches = matches.filter((m) => {
    if (m.userId1 !== currentUser?.id && m.userId2 !== currentUser?.id) return false;
    if (
      m.slotStatus === 'graduated_date' ||
      m.slotStatus === 'graduated_socials' ||
      m.slotStatus === 'departed_politely' ||
      m.slotStatus === 'archived'
    ) {
      return false;
    }
    return m.slotStatus === 'active' || !!m.lastMessage;
  });

  // Check if a match can be opened or if active chat limit applies
  const canOpenChat = (matchId: string): boolean => {
    const isAlreadyActive = activeChatMatches.some((m) => m.id === matchId);
    if (isAlreadyActive) return true;
    return activeChatMatches.length < 3;
  };

  const tryOpenChat = (matchId: string): boolean => {
    if (canOpenChat(matchId)) {
      setActiveChatMatchId(matchId);
      setActiveScreen('chat');
      return true;
    } else {
      setPendingBlockedMatchId(matchId);
      triggerHaptic('warning');
      showToast(
        'Active Chat Limit (3/3) reached! Progress or politely depart an active chat to open a new one.',
        'alert'
      );
      return false;
    }
  };

  const proposeIrlDate = (
    matchId: string,
    venueName: string,
    neighborhood: string,
    activityType: 'coffee' | 'drinks' | 'gallery' | 'dinner' | 'park_walk',
    dateTime: string,
    note?: string
  ) => {
    if (!currentUser) return;
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    const partnerId = match.userId1 === currentUser.id ? match.userId2 : match.userId1;

    const datePlan: IrlDatePlan = {
      id: `date_${Date.now()}`,
      matchId,
      proposedByUserId: currentUser.id,
      venueName,
      neighborhood,
      activityType,
      dateTime,
      note,
      status: 'accepted',
      createdAt: new Date().toISOString(),
    };

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              slotStatus: 'graduated_date',
              scheduledDate: datePlan,
              lastMessage: `☕ Planned IRL Date: ${venueName}`,
              lastMessageAt: new Date().toISOString(),
            }
          : m
      )
    );

    const dateMsg: Message = {
      id: `msg_date_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      receiverId: partnerId,
      text: `Let's meet up! Proposed date: ${venueName} (${neighborhood}) · ${new Date(dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. ${note ? `"${note}"` : ''}`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      attachmentType: 'irl_date',
      irlDatePlan: datePlan,
    };
    setMessages((prev) => [...prev, dateMsg]);

    setUserKarma((prev) => {
      const newScore = Math.min(100, prev.score + 8);
      const badges = prev.badges.includes('verified_show_up')
        ? prev.badges
        : [...prev.badges, 'verified_show_up' as const];
      return {
        ...prev,
        score: newScore,
        irlDatesCompleted: prev.irlDatesCompleted + 1,
        badges,
      };
    });

    triggerHaptic('celebration');
    showToast(`IRL Date Scheduled! Chat slot graduated & +8 Karma earned! ☕🎉`, 'success');

    if (pendingBlockedMatchId) {
      const nextId = pendingBlockedMatchId;
      setPendingBlockedMatchId(null);
      setTimeout(() => {
        setActiveChatMatchId(nextId);
        setActiveScreen('chat');
        showToast('Active chat slot opened! Enjoy your new conversation. ✨', 'info');
      }, 600);
    }
  };

  const exchangeSocials = (
    matchId: string,
    platforms: Array<{ platform: 'instagram' | 'whatsapp' | 'phone' | 'linkedin'; handle: string }>
  ) => {
    if (!currentUser) return;
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    const partnerId = match.userId1 === currentUser.id ? match.userId2 : match.userId1;

    const exchange: SocialExchange = {
      id: `soc_${Date.now()}`,
      matchId,
      initiatedByUserId: currentUser.id,
      platforms,
      graduatedAt: new Date().toISOString(),
    };

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              slotStatus: 'graduated_socials',
              socialExchange: exchange,
              lastMessage: `📲 Exchanged external socials: ${platforms.map((p) => p.platform).join(', ')}`,
              lastMessageAt: new Date().toISOString(),
            }
          : m
      )
    );

    const socMsg: Message = {
      id: `msg_soc_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      receiverId: partnerId,
      text: `Let's take this off the app! Here are my socials: ${platforms.map((p) => `${p.platform}: ${p.handle}`).join(' · ')}`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      attachmentType: 'social_exchange',
      socialExchange: exchange,
    };
    setMessages((prev) => [...prev, socMsg]);

    setUserKarma((prev) => ({
      ...prev,
      score: Math.min(100, prev.score + 5),
      socialsExchanged: prev.socialsExchanged + 1,
    }));

    triggerHaptic('success');
    showToast(`Graduated to Socials! Chat slot freed & +5 Karma earned! 📲✨`, 'success');

    if (pendingBlockedMatchId) {
      const nextId = pendingBlockedMatchId;
      setPendingBlockedMatchId(null);
      setTimeout(() => {
        setActiveChatMatchId(nextId);
        setActiveScreen('chat');
        showToast('Active chat slot opened! Enjoy your new conversation. ✨', 'info');
      }, 600);
    }
  };

  const sendPoliteDeparture = (matchId: string, templateId: string, customNote?: string) => {
    if (!currentUser) return;
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    const partnerId = match.userId1 === currentUser.id ? match.userId2 : match.userId1;
    const template =
      POLITE_DEPARTURE_TEMPLATES.find((t) => t.id === templateId) ||
      POLITE_DEPARTURE_TEMPLATES[0];

    const messageText = customNote?.trim() || template.messageText;

    const departureDetails = {
      templateId: template.id,
      reason: template.title,
      timestamp: new Date().toISOString(),
      senderId: currentUser.id,
    };

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              slotStatus: 'departed_politely',
              departureDetails,
              lastMessage: `💌 Polite departure: "${template.title}"`,
              lastMessageAt: new Date().toISOString(),
            }
          : m
      )
    );

    const departureMsg: Message = {
      id: `msg_dept_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      receiverId: partnerId,
      text: messageText,
      timestamp: new Date().toISOString(),
      status: 'sent',
      attachmentType: 'polite_departure',
      departureDetails: {
        templateId: template.id,
        title: template.title,
        reason: messageText,
        karmaAwarded: template.karmaBonus,
      },
    };
    setMessages((prev) => [...prev, departureMsg]);

    setUserKarma((prev) => {
      const newScore = Math.min(100, prev.score + template.karmaBonus);
      const badges = prev.badges.includes('zero_ghost_karma')
        ? prev.badges
        : [...prev.badges, 'zero_ghost_karma' as const];
      return {
        ...prev,
        score: newScore,
        politeDeparturesSent: prev.politeDeparturesSent + 1,
        badges,
      };
    });

    triggerHaptic('success');
    showToast(
      `Polite Departure Sent! Slot freed & +${template.karmaBonus} Zero-Ghost Karma! 💌✨`,
      'success'
    );

    if (pendingBlockedMatchId) {
      const nextId = pendingBlockedMatchId;
      setPendingBlockedMatchId(null);
      setTimeout(() => {
        setActiveChatMatchId(nextId);
        setActiveScreen('chat');
        showToast('Active chat slot opened! Enjoy your new conversation. ✨', 'info');
      }, 600);
    }
  };

  // Manage duration timer when call is connected
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      callTimerRef.current = window.setInterval(() => {
        setActiveCall((prev) => (prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null));
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [activeCall?.status]);

  const startCall = (partnerId: string, type: CallType) => {
    if (!currentUser) return;
    const partner = users.find((u) => u.id === partnerId);
    if (!partner) return;

    // Check if match exists
    const match = matches.find(
      (m) =>
        (m.userId1 === currentUser.id && m.userId2 === partnerId) ||
        (m.userId2 === currentUser.id && m.userId1 === partnerId)
    );
    if (!match) {
      showToast('You can only call confirmed matches', 'alert');
      return;
    }

    triggerHaptic('medium');
    callSounds.startRingback();

    const newCall: CallSession = {
      id: `call_${Date.now()}`,
      partnerId,
      partner,
      type,
      status: 'outgoing',
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: false,
      isSpeakerOn: type === 'video',
      isCameraFront: true,
      isMinimized: false,
      reactions: [],
    };

    setActiveCall(newCall);

    // Simulate match answering after 2.5 seconds
    ringTimeoutRef.current = window.setTimeout(() => {
      callSounds.stopRingback();
      callSounds.playConnectedChime();
      triggerHaptic('success');
      setActiveCall((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'connected',
          startedAt: Date.now(),
        };
      });
      showToast(`${partner.name} connected! Enjoy your ${type === 'video' ? 'video' : 'audio'} call ✨`, 'success');
    }, 2500);
  };

  const endCall = () => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    callSounds.stopRingback();
    callSounds.playHangupTone();

    setActiveCall((prev) => {
      if (!prev) return null;
      const duration = prev.durationSeconds;
      const wasConnected = prev.status === 'connected';

      // Log call into messages for this match
      const targetMatch = matches.find(
        (m) =>
          (m.userId1 === currentUser?.id && m.userId2 === prev.partnerId) ||
          (m.userId2 === currentUser?.id && m.userId1 === prev.partnerId)
      );

      if (targetMatch && currentUser) {
        const callTypeLabel = prev.type === 'video' ? 'Video Call' : 'Audio Call';
        const durationFormatted =
          duration > 0
            ? `${Math.floor(duration / 60)}m ${duration % 60}s`
            : wasConnected
            ? '< 1 min'
            : 'Not Answered';

        const callLogMsg: Message = {
          id: `msg_call_${Date.now()}`,
          matchId: targetMatch.id,
          senderId: currentUser.id,
          receiverId: prev.partnerId,
          text: `${prev.type === 'video' ? '📹' : '📞'} ${callTypeLabel} (${durationFormatted})`,
          timestamp: new Date().toISOString(),
          status: 'sent',
          attachmentType: 'call_log',
          callLog: {
            callId: prev.id,
            type: prev.type,
            status: wasConnected ? 'completed' : 'missed',
            durationSeconds: duration,
            startedAt: new Date(prev.startedAt || Date.now()).toISOString(),
            endedAt: new Date().toISOString(),
          },
        };

        setMessages((msgs) => [...msgs, callLogMsg]);

        // Update match lastMessage
        setMatches((mList) =>
          mList.map((m) =>
            m.id === targetMatch.id
              ? {
                  ...m,
                  lastMessage: `${prev.type === 'video' ? '📹' : '📞'} ${callTypeLabel} (${durationFormatted})`,
                  lastMessageAt: new Date().toISOString(),
                }
              : m
          )
        );
      }

      return {
        ...prev,
        status: 'ended',
      };
    });

    // Close call overlay after brief fadeout
    setTimeout(() => {
      setActiveCall(null);
    }, 600);
  };

  const toggleCallMute = () => {
    setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  };

  const toggleCallVideo = () => {
    setActiveCall((prev) => (prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null));
  };

  const toggleCallSpeaker = () => {
    setActiveCall((prev) => (prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null));
  };

  const toggleCallCameraFront = () => {
    setActiveCall((prev) => (prev ? { ...prev, isCameraFront: !prev.isCameraFront } : null));
  };

  const setMinimizeCall = (minimized: boolean) => {
    setActiveCall((prev) => (prev ? { ...prev, isMinimized: minimized } : null));
  };

  const sendCallReaction = (emoji: string) => {
    const newReaction: CallReaction = {
      id: `reaction_${Date.now()}_${Math.random()}`,
      emoji,
      x: Math.floor(Math.random() * 60) + 20,
    };
    setActiveCall((prev) =>
      prev ? { ...prev, reactions: [...prev.reactions.slice(-6), newReaction] } : null
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        matches,
        messages,
        reports,
        verifications,
        activeScreen,
        activeChatMatchId,
        matchCelebration,
        viewMode,
        filters,
        toasts,
        lastAction,
        isApkModalOpen,
        isPremiumModalOpen,
        typingMatchIds,

        // Live Connections
        goingNowBroadcasts,
        createGoingNowBroadcast,
        rsvpToGoingNowBroadcast,
        deleteGoingNowBroadcast,

        liveRoulette,
        startLiveRoulette,
        leaveLiveRoulette,
        skipLiveRoulettePartner,
        toggleLiveMediaMode,
        toggleLiveAudioMute,
        toggleLiveVideoMute,
        sendLiveReaction,
        extendLiveRound,
        likeLivePartner,
        nextLivePrompt,

        rapidMatch,
        startRapidMatch,
        answerRapidPrompt,
        sendRapidChatMessage,
        saveRapidMatch,
        closeRapidMatch,

        // Sound-Wave Blind Date
        soundWaveProfiles,
        sendSoundWaveVoiceReply,
        markSoundWaveListened,
        publishUserSoundWave,

        // Snap-Style Casual Interactions & AR Lens Challenges
        dualCameraVibes,
        postDualCameraVibe,
        likeDualCameraVibe,
        sendSelfDestructSnap,
        markSnapViewed,
        arLensChallenge,
        startARLensChallenge,
        makeARLensChoice,
        closeARLensChallenge,

        // The "Anti-Ghosting" Karma Engine & Active Chat Limit
        userKarma,
        activeChatLimit: 3,
        activeChatMatches,
        pendingBlockedMatchId,
        setPendingBlockedMatchId,
        canOpenChat,
        tryOpenChat,
        proposeIrlDate,
        exchangeSocials,
        sendPoliteDeparture,

        setActiveScreen,
        setActiveChatMatchId,
        setMatchCelebration,
        setViewMode,
        setFilters,
        setIsApkModalOpen,
        setIsPremiumModalOpen,

        // Audio & Video Calls
        activeCall,
        startCall,
        endCall,
        toggleCallMute,
        toggleCallVideo,
        toggleCallSpeaker,
        toggleCallCameraFront,
        setMinimizeCall,
        sendCallReaction,

        login,
        signup,
        logout,
        switchUser,
        updateProfile,
        deleteAccount,
        upgradeToPremium,

        likeUser,
        passUser,
        rewindLastAction,

        sendMessage,
        sendVoiceMessage,
        sendMiniGame,
        respondToMiniGame,
        reactToMessage,
        markMessagesAsRead,
        unmatchUser,
        blockUser,
        reportUser,
        requestVerification,

        adminResolveReport,
        adminReviewVerification,
        adminToggleUserStatus,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

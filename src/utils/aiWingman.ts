import { User, AiWingmanResponse, AiWingmanPrompt } from '../types';

/**
 * Computes mutual interests between two users
 */
export function getMutualInterests(user1?: User | null, user2?: User | null): string[] {
  if (!user1?.interests || !user2?.interests) return [];
  const set2 = new Set(user2.interests.map((i) => i.toLowerCase().trim()));
  return user1.interests.filter((i) => set2.has(i.toLowerCase().trim()));
}

/**
 * High-fidelity client fallback generator in case network or offline
 */
export function generateLocalWingmanPrompts(
  user: User,
  partner: User,
  tone: 'mutual_sparks' | 'playful' | 'deep' | 'creative' | 'bold' = 'mutual_sparks'
): AiWingmanResponse {
  const mutual = getMutualInterests(user, partner);
  const shared = mutual.length > 0 ? mutual : [user.interests[0] || 'Music', partner.interests[0] || 'Adventures'];

  const topics: AiWingmanPrompt[] = [];

  // 1. Music & Late-Night Vibes (exact user specification)
  const lovesMusicOrNight =
    mutual.some((i) => /music|vinyl|indie|track|drive|concert/i.test(i)) ||
    [...user.interests, ...partner.interests].some((i) => /music|vinyl|indie|acoustic|drive/i.test(i)) ||
    mutual.length === 0;

  if (lovesMusicOrNight) {
    topics.push({
      id: 'local-music-roadtrip',
      headline: '🎶 The 2 AM Road Trip Playlist',
      context: 'You both like indie acoustic tracks and late-night drives',
      suggestedOpener: `You both appreciate indie acoustic tracks and late-night drives—what's the one song that MUST be on your 2 AM road trip playlist?`,
      whyItWorks: 'Taps into emotional music memories and creates an instant sensory connection.',
      vibe: 'mutual_sparks',
    });
  }

  // 2. Mutual Interest Spotlight
  if (mutual.length > 0) {
    const primary = mutual[0];
    topics.push({
      id: `local-shared-${primary.toLowerCase().replace(/\s+/g, '-')}`,
      headline: `✨ The Shared ${primary} Connection`,
      context: `You both share a love for ${mutual.slice(0, 2).join(' & ')}`,
      suggestedOpener: `I noticed you're also passionate about ${primary}! What's the coolest spot or project you've explored with it recently?`,
      whyItWorks: 'Shows genuine alignment on shared hobbies without generic small talk.',
      vibe: 'playful',
    });
  }

  // 3. Profile Prompt Hook
  if (partner.prompts && partner.prompts.length > 0) {
    const p = partner.prompts[0];
    topics.push({
      id: 'local-prompt-story',
      headline: `🔍 Story Behind "${p.question}"`,
      context: `Referencing ${partner.name}'s profile prompt response`,
      suggestedOpener: `Your take on "${p.question}" made me smile—is there a great backstory behind that, or did you learn that through trial by fire?`,
      whyItWorks: 'Directly validates their profile creativity and invites personal storytelling.',
      vibe: 'creative',
    });
  } else if (partner.occupation) {
    topics.push({
      id: 'local-career-angle',
      headline: `💡 Behind the Scenes: ${partner.occupation}`,
      context: `Tailored to ${partner.name}'s craft as a ${partner.occupation}`,
      suggestedOpener: `Being a ${partner.occupation} is so intriguing—what's something about your field that outsiders always get completely wrong?`,
      whyItWorks: 'People love demystifying their true passion and craft in a fun way.',
      vibe: 'creative',
    });
  }

  // 4. Low-pressure spontaneous date idea
  topics.push({
    id: 'local-date-chemistry',
    headline: '☕ The Low-Stakes Sunday Debate',
    context: `Based on your mutual relationship goal: ${partner.relationshipGoal.replace('-', ' ')}`,
    suggestedOpener: `Hypothetical Saturday: we have 3 free hours, sunny weather, and no phones. Are we hitting a hidden café, browsing vinyl, or going on a spontaneous scenic detour?`,
    whyItWorks: 'Subtly invites natural future pacing and tests weekend chemistry.',
    vibe: 'deep',
  });

  return {
    mutualAnalysis: `You and ${partner.name} share great common ground in ${shared.join(', ')} with high lifestyle compatibility.`,
    sharedInterests: shared,
    topics,
    coachingTip: 'Pro-tip: Compliment their perspective or taste rather than just physical looks to stand out 10x more.',
  };
}

/**
 * Fetch AI Wingman dynamic conversation topics from server API with local fallback
 */
export async function fetchAiWingmanPrompts(
  user: User,
  partner: User,
  tone: 'mutual_sparks' | 'playful' | 'deep' | 'creative' | 'bold' = 'mutual_sparks',
  recentMessages: string[] = []
): Promise<AiWingmanResponse> {
  try {
    const res = await fetch('/api/ai-wingman/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          name: user.name,
          age: user.age,
          interests: user.interests,
          bio: user.bio,
          prompts: user.prompts,
          relationshipGoal: user.relationshipGoal,
          occupation: user.occupation,
        },
        partner: {
          name: partner.name,
          age: partner.age,
          interests: partner.interests,
          bio: partner.bio,
          prompts: partner.prompts,
          relationshipGoal: partner.relationshipGoal,
          occupation: partner.occupation,
        },
        tone,
        recentMessages,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.topics) && data.topics.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not reach /api/ai-wingman/prompts endpoint, using resilient local generator:', err);
  }

  return generateLocalWingmanPrompts(user, partner, tone);
}

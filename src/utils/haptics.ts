/**
 * Safe mobile haptic feedback helper using navigator.vibrate
 */

export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning' | 'celebration') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        // Subtle single tick (e.g. Pass or drag threshold cross)
        navigator.vibrate(10);
        break;
      case 'medium':
        // Crisp affirmative pulse (e.g. Like)
        navigator.vibrate(18);
        break;
      case 'success':
        // Double pulse (e.g. Super Like)
        navigator.vibrate([15, 50, 20]);
        break;
      case 'warning':
        // Short alerting pulse
        navigator.vibrate([30, 40, 30]);
        break;
      case 'celebration':
        // Rich celebratory pattern for mutual match
        navigator.vibrate([35, 60, 45, 60, 60]);
        break;
      default:
        navigator.vibrate(12);
    }
  } catch {
    // Graceful fallback on restricted webview contexts
  }
};

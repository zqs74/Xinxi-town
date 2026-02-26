import { useState, useEffect, useCallback, useMemo } from 'react';

const HAPTIC_PATTERNS = {
  light: 10,
  medium: 30,
  heavy: 50,
  success: [0, 30, 30, 30],
  error: [0, 20, 20, 20],
  complete: [0, 50, 100, 50],
};

const ANIMATION_PREFERENCES = {
  full: 'full',
  reduced: 'reduced',
  none: 'none',
};

const STORAGE_KEYS = {
  ANIMATION_PREF: 'ux_animation_preference',
  HAPTIC_ENABLED: 'ux_haptic_enabled',
  FOCUS_MODE: 'ux_focus_mode',
  THEME: 'ux_theme',
};

export const useUXSystem = () => {
  const [animationPreference, setAnimationPreference] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANIMATION_PREF);
      return saved || ANIMATION_PREFERENCES.full;
    } catch {
      return ANIMATION_PREFERENCES.full;
    }
  });

  const [hapticEnabled, setHapticEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HAPTIC_ENABLED);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [focusMode, setFocusMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOCUS_MODE);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANIMATION_PREF, animationPreference);
    } catch (e) {
      console.warn('Failed to save animation preference:', e);
    }
  }, [animationPreference]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HAPTIC_ENABLED, String(hapticEnabled));
    } catch (e) {
      console.warn('Failed to save haptic preference:', e);
    }
  }, [hapticEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOCUS_MODE, String(focusMode));
    } catch (e) {
      console.warn('Failed to save focus mode:', e);
    }
  }, [focusMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  }, [theme]);

  const triggerHaptic = useCallback((pattern = 'light', options = {}) => {
    if (!hapticEnabled) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    try {
      const patternValue = HAPTIC_PATTERNS[pattern] || HAPTIC_PATTERNS.light;
      const duration = Array.isArray(patternValue) ? patternValue : patternValue;
      const amplitude = options.amplitude || 50;
      const periods = Array.isArray(patternValue)
        ? patternValue.map((d, i) => (i % 2 === 0 ? d : 0))
        : duration;

      if (navigator.vibrate) {
        navigator.vibrate(periods);
      }
    } catch (e) {
      console.warn('Haptic feedback failed:', e);
    }
  }, [hapticEnabled]);

  const triggerSuccess = useCallback(() => {
    triggerHaptic('success');
  }, [triggerHaptic]);

  const triggerError = useCallback(() => {
    triggerHaptic('error');
  }, [triggerHaptic]);

  const triggerComplete = useCallback(() => {
    triggerHaptic('complete');
  }, [triggerHaptic]);

  const toggleAnimationPreference = useCallback(() => {
    setAnimationPreference((prev) => {
      switch (prev) {
        case ANIMATION_PREFERENCES.full:
          return ANIMATION_PREFERENCES.reduced;
        case ANIMATION_PREFERENCES.reduced:
          return ANIMATION_PREFERENCES.none;
        default:
          return ANIMATION_PREFERENCES.full;
      }
    });
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => {
      const newValue = !prev;
      triggerHaptic(newValue ? 'medium' : 'light');
      return newValue;
    });
  }, [triggerHaptic]);

  const toggleHaptic = useCallback(() => {
    setHapticEnabled((prev) => {
      triggerHaptic(prev ? 'error' : 'success');
      return !prev;
    });
  }, [triggerHaptic]);

  const shouldAnimate = useCallback((animationType = 'all') => {
    if (animationPreference === ANIMATION_PREFERENCES.none) return false;
    if (animationPreference === ANIMATION_PREFERENCES.reduced) {
      return animationType === 'essential';
    }
    return true;
  }, [animationPreference]);

  const getTransitionDuration = useCallback(() => {
    switch (animationPreference) {
      case ANIMATION_PREFERENCES.none:
        return 0;
      case ANIMATION_PREFERENCES.reduced:
        return 150;
      default:
        return 300;
    }
  }, [animationPreference]);

  const values = useMemo(() => ({
    animationPreference,
    hapticEnabled,
    focusMode,
    theme,
    HAPTIC_PATTERNS,
    ANIMATION_PREFERENCES,
  }), [animationPreference, hapticEnabled, focusMode, theme]);

  const actions = useMemo(() => ({
    triggerHaptic,
    triggerSuccess,
    triggerError,
    triggerComplete,
    toggleAnimationPreference,
    toggleFocusMode,
    toggleHaptic,
    setAnimationPreference,
    setHapticEnabled,
    setFocusMode,
    setTheme,
    shouldAnimate,
    getTransitionDuration,
  }), [
    triggerHaptic,
    triggerSuccess,
    triggerError,
    triggerComplete,
    toggleAnimationPreference,
    toggleFocusMode,
    toggleHaptic,
    shouldAnimate,
    getTransitionDuration,
  ]);

  return { ...values, ...actions };
};

export default useUXSystem;

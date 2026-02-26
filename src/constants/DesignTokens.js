export const DesignTokens = {
  colors: {
    morandi: {
      purple: '#A996D6',
      purpleLight: '#C4B7E0',
      purpleDark: '#8B7AB5',
      blue: '#A8D8EA',
      blueLight: '#C5E5F2',
      blueDark: '#8CC5D8',
      green: '#C7F0DB',
      greenLight: '#DFF4E8',
      greenDark: '#A3E0C3',
      pink: '#E8C4D8',
      pinkLight: '#F3DCE9',
      pinkDark: '#D8A8C2',
      yellow: '#F7E9B8',
      coral: '#F5B8A8',
      lavender: '#D4C8E8',
    },
    emotion: {
      blue: '#87CEEB',
      yellow: '#FFD93D',
      red: '#FF6B6B',
      green: '#6BCB77',
      purple: '#C9B1FF',
    },
    neutral: {
      white: '#FFFFFF',
      gray50: '#F9FAFB',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB',
      gray300: '#D1D5DB',
      gray400: '#9CA3AF',
      gray500: '#6B7280',
      gray600: '#4B5563',
      gray700: '#374151',
      gray800: '#1F2937',
      gray900: '#111827',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(169, 150, 214, 0.3)',
    glowStrong: '0 0 40px rgba(169, 150, 214, 0.5)',
  },
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      handwriting: "'Dongle', cursive, sans-serif",
      mono: "'Fira Code', 'Consolas', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  animation: {
    duration: {
      instant: 50,
      fast: 150,
      normal: 300,
      slow: 500,
      verySlow: 800,
    },
    easing: {
      easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
      },
      slideUp: {
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      slideDown: {
        from: { opacity: 0, transform: 'translateY(-20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      slideLeft: {
        from: { opacity: 0, transform: 'translateX(20px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
      slideRight: {
        from: { opacity: 0, transform: 'translateX(-20px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
      scaleIn: {
        from: { opacity: 0, transform: 'scale(0.9)' },
        to: { opacity: 1, transform: 'scale(1)' },
      },
      pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
      bounce: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      ripple: {
        '0%': { transform: 'scale(0)', opacity: 1 },
        '100%': { transform: 'scale(4)', opacity: 0 },
      },
      breathing: {
        '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
        '50%': { transform: 'scale(1.2)', opacity: 1 },
      },
      shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
    },
  },
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  touchTarget: {
    minSize: 44,
    recommended: 48,
    large: 56,
  },
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    toast: 600,
  },
};

export const getColor = (path, alpha = 1) => {
  const colors = DesignTokens.colors;
  const parts = path.split('.');
  let result = colors;
  for (const part of parts) {
    if (result[part] !== undefined) {
      result = result[part];
    } else {
      return null;
    }
  }
  return result;
};

export const getAnimationStyle = (animationName, duration = 'normal', easing = 'easeOut') => {
  const durationMs = DesignTokens.animation.duration[duration] || 300;
  const easingFunc = DesignTokens.animation.easing[easing] || 'easeOut';
  const keyframes = DesignTokens.animation.keyframes[animationName];

  if (!keyframes) return null;

  return {
    animation: `${animationName} ${durationMs}ms ${easingFunc} forwards`,
  };
};

export default DesignTokens;

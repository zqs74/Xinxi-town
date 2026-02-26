import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import DesignTokens from '../../constants/DesignTokens';
import { useUXSystem } from '../../hooks/useUXSystem';

const FeedbackIndicator = ({
  type = 'success',
  message = '',
  duration = 2000,
  onClose,
  show = true,
  position = 'center',
}) => {
  const { triggerSuccess, triggerError, triggerHaptic } = useUXSystem();
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  useEffect(() => {
    if (isVisible) {
      if (type === 'success') triggerSuccess();
      else if (type === 'error') triggerError();
      else triggerHaptic('light');
    }
  }, [isVisible, type, triggerSuccess, triggerError, triggerHaptic]);

  const config = {
    success: {
      icon: '✓',
      color: DesignTokens.colors.status.success,
      bgColor: `${DesignTokens.colors.status.success}15`,
    },
    error: {
      icon: '✕',
      color: DesignTokens.colors.status.error,
      bgColor: `${DesignTokens.colors.status.error}15`,
    },
    warning: {
      icon: '⚠',
      color: DesignTokens.colors.status.warning,
      bgColor: `${DesignTokens.colors.status.warning}15`,
    },
    info: {
      icon: 'ℹ',
      color: DesignTokens.colors.status.info,
      bgColor: `${DesignTokens.colors.status.info}15`,
    },
    loading: {
      icon: '⟳',
      color: DesignTokens.colors.morandi.purple,
      bgColor: `${DesignTokens.colors.morandi.purple}15`,
    },
  };

  const currentConfig = config[type] || config.success;

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, ...getPositionStyle() }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            zIndex: DesignTokens.zIndex.toast,
            display: 'flex',
            alignItems: 'center',
            gap: DesignTokens.spacing.sm,
            padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.lg}`,
            borderRadius: DesignTokens.borderRadius.full,
            background: currentConfig.bgColor,
            border: `1px solid ${currentConfig.color}40`,
            boxShadow: DesignTokens.shadows.lg,
            color: currentConfig.color,
            fontSize: DesignTokens.typography.fontSize.base,
            fontWeight: DesignTokens.typography.fontWeight.medium,
            ...getPositionStyle(),
          }}
        >
          {type === 'loading' ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              {currentConfig.icon}
            </motion.span>
          ) : (
            <span style={{ fontSize: '1.2em' }}>{currentConfig.icon}</span>
          )}
          {message && <span>{message}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const RippleButton = ({
  children,
  onClick,
  color = 'purple',
  size = 'md',
  disabled = false,
  className = '',
  style = {},
}) => {
  const { triggerHaptic, hapticEnabled } = useUXSystem();
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const colorMap = {
    purple: DesignTokens.colors.morandi.purple,
    blue: DesignTokens.colors.morandi.blue,
    green: DesignTokens.colors.morandi.green,
    pink: DesignTokens.colors.morandi.pink,
  };

  const accentColor = colorMap[color] || colorMap.purple;

  const sizeMap = {
    sm: { padding: `${DesignTokens.spacing.xs} ${DesignTokens.spacing.md}`, fontSize: DesignTokens.typography.fontSize.sm },
    md: { padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.lg}`, fontSize: DesignTokens.typography.fontSize.base },
    lg: { padding: `${DesignTokens.spacing.md} ${DesignTokens.spacing.xl}`, fontSize: DesignTokens.typography.fontSize.lg },
  };

  const handleClick = (e) => {
    if (disabled || !onClick) return;

    if (hapticEnabled) {
      triggerHaptic('light');
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled
          ? DesignTokens.colors.neutral.gray300
          : `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
        color: DesignTokens.colors.neutral.white,
        border: 'none',
        borderRadius: DesignTokens.borderRadius.xl,
        boxShadow: disabled ? 'none' : DesignTokens.shadows.md,
        opacity: disabled ? 0.6 : 1,
        ...sizeMap[size],
        ...style,
      }}
      onClick={handleClick}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          style={{
            position: 'absolute',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            transform: 'scale(0)',
            pointerEvents: 'none',
            width: 100,
            height: 100,
            left: ripple.x - 50,
            top: ripple.y - 50,
          }}
          initial={{ transform: 'scale(0)', opacity: 0.5 }}
          animate={{ transform: 'scale(4)', opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      {children}
    </motion.button>
  );
};

export const PulseBadge = ({
  children,
  color = 'purple',
  pulse = true,
  className = '',
}) => {
  const colorMap = {
    purple: DesignTokens.colors.morandi.purple,
    blue: DesignTokens.colors.morandi.blue,
    green: DesignTokens.colors.morandi.green,
    pink: DesignTokens.colors.morandi.pink,
  };

  const accentColor = colorMap[color] || colorMap.purple;

  return (
    <span className={className} style={{ position: 'relative', display: 'inline-flex' }}>
      <motion.span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${DesignTokens.spacing.xs} ${DesignTokens.spacing.sm}`,
          borderRadius: DesignTokens.borderRadius.full,
          background: `${accentColor}20`,
          color: accentColor,
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
        }}
        animate={pulse ? {
          boxShadow: [
            `0 0 0 0 ${accentColor}40`,
            `0 0 0 8px ${accentColor}00`,
          ],
        } : {}}
        transition={{
          duration: 2,
          repeat: pulse ? Infinity : 0,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};

export const AnimatedCheckmark = ({
  size = 48,
  color = DesignTokens.colors.status.success,
  duration = 0.6,
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration, ease: 'easeInOut' }}
      />
      <motion.path
        d="M7 12l3 3 7-7"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: duration * 0.6, delay: duration * 0.4, ease: 'easeInOut' }}
      />
    </svg>
  );
};

export const ShimmerLoader = ({ width = '100%', height = 20, borderRadius = 4 }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(
          90deg,
          ${DesignTokens.colors.neutral.gray200} 0%,
          ${DesignTokens.colors.neutral.gray300} 50%,
          ${DesignTokens.colors.neutral.gray200} 100%
        )`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: DesignTokens.borderRadius.xl,
        padding: DesignTokens.spacing.lg,
        border: `1px solid rgba(255, 255, 255, 0.3)`,
        boxShadow: DesignTokens.shadows.sm,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: DesignTokens.spacing.md, marginBottom: DesignTokens.spacing.md }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: DesignTokens.colors.neutral.gray200 }}>
          <ShimmerLoader width={48} height={48} borderRadius="50%" />
        </div>
        <div style={{ flex: 1 }}>
          <ShimmerLoader width="60%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
          <ShimmerLoader width="40%" height={12} borderRadius={4} />
        </div>
      </div>
      <ShimmerLoader width="100%" height={60} borderRadius={DesignTokens.borderRadius.lg} />
    </div>
  );
};

export default FeedbackIndicator;

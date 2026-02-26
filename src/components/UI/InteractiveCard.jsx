import { motion } from 'framer-motion';
import DesignTokens from '../../constants/DesignTokens';
import { forwardRef } from 'react';

const InteractiveCard = forwardRef(({
  children,
  className = '',
  style = {},
  variant = 'default',
  size = 'md',
  selected = false,
  disabled = false,
  loading = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ripple = true,
  hoverScale = 1.02,
  activeScale = 0.98,
  glowColor = 'rgba(169, 150, 214, 0.3)',
}, ref) => {
  const handleClick = (e) => {
    if (disabled || loading || !onClick) return;
    onClick(e);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: DesignTokens.spacing.sm, borderRadius: DesignTokens.borderRadius.lg };
      case 'lg':
        return { padding: DesignTokens.spacing.xl, borderRadius: DesignTokens.borderRadius['2xl'] };
      case 'xl':
        return { padding: DesignTokens.spacing['2xl'], borderRadius: DesignTokens.borderRadius['2xl'] };
      default:
        return { padding: DesignTokens.spacing.lg, borderRadius: DesignTokens.borderRadius.xl };
    }
  };

  const getVariantStyles = () => {
    const baseStyles = {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: `1px solid rgba(255, 255, 255, 0.3)`,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, rgba(169, 150, 214, 0.2), rgba(168, 216, 234, 0.2))`,
          border: `1px solid rgba(169, 150, 214, 0.3)`,
        };
      case 'success':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2))`,
          border: `1px solid rgba(16, 185, 129, 0.3)`,
        };
      case 'warning':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2))`,
          border: `1px solid rgba(245, 158, 11, 0.3)`,
        };
      case 'error':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2))`,
          border: `1px solid rgba(239, 68, 68, 0.3)`,
        };
      case 'ghost':
        return {
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        };
      default:
        return baseStyles;
    }
  };

  const baseStyle = {
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: selected
      ? `0 0 0 2px ${DesignTokens.colors.morandi.purple}, ${DesignTokens.shadows.glow}`
      : DesignTokens.shadows.md,
    transform: selected ? 'scale(1)' : undefined,
    transition: `all ${DesignTokens.animation.duration.normal}ms ${DesignTokens.animation.easing.easeOut}`,
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  if (loading) {
    return (
      <motion.div
        ref={ref}
        className={className}
        style={{ ...baseStyle, ...sizeStyles, ...variantStyles, ...style }}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0.7 }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <div className="animate-pulse" style={{ width: '100%' }}>
          <div style={{ height: '1em', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ height: '0.8em', width: '60%', background: 'rgba(0,0,0,0.08)', borderRadius: '4px' }} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...baseStyle, ...sizeStyles, ...variantStyles, ...style }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={!disabled && !selected ? { scale: hoverScale, boxShadow: `0 10px 40px ${glowColor}` } : undefined}
      whileTap={!disabled ? { scale: activeScale } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
});

InteractiveCard.displayName = 'InteractiveCard';

export const ClickCard = forwardRef(({
  children,
  className = '',
  style = {},
  onClick,
  color = 'purple',
  disabled = false,
  rippleColor = 'rgba(169, 150, 214, 0.3)',
}, ref) => {
  const handleClick = (e) => {
    if (disabled || !onClick) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      background: ${rippleColor};
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      width: 100px;
      height: 100px;
      left: ${x - 50}px;
      top: ${y - 50}px;
    `;

    e.currentTarget.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
    onClick(e);
  };

  const colorMap = {
    purple: DesignTokens.colors.morandi.purple,
    blue: DesignTokens.colors.morandi.blue,
    green: DesignTokens.colors.morandi.green,
    pink: DesignTokens.colors.morandi.pink,
  };

  const accentColor = colorMap[color] || colorMap.purple;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: DesignTokens.borderRadius.xl,
        border: `1px solid rgba(255, 255, 255, 0.4)`,
        boxShadow: DesignTokens.shadows.md,
        padding: DesignTokens.spacing.lg,
        transition: `all ${DesignTokens.animation.duration.normal}ms ${DesignTokens.animation.easing.easeOut}`,
      }}
      onClick={handleClick}
      whileHover={!disabled ? { scale: 1.02, boxShadow: `0 10px 40px ${accentColor}40` } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
      {children}
    </motion.div>
  );
});

ClickCard.displayName = 'ClickCard';

export const SelectionCard = forwardRef(({
  children,
  className = '',
  style = {},
  selected = false,
  onClick,
  color = 'purple',
}, ref) => {
  const colorMap = {
    purple: { light: 'rgba(169, 150, 214, 0.2)', dark: 'rgba(169, 150, 214, 0.4)' },
    blue: { light: 'rgba(168, 216, 234, 0.2)', dark: 'rgba(168, 216, 234, 0.4)' },
    green: { light: 'rgba(199, 240, 219, 0.2)', dark: 'rgba(199, 240, 219, 0.4)' },
    pink: { light: 'rgba(232, 196, 216, 0.2)', dark: 'rgba(232, 196, 216, 0.4)' },
  };

  const colors = colorMap[color] || colorMap.purple;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...style,
        cursor: 'pointer',
        background: selected
          ? `linear-gradient(135deg, ${colors.light}, ${colors.dark})`
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: DesignTokens.borderRadius.xl,
        border: selected
          ? `2px solid ${DesignTokens.colors.morandi.purple}`
          : `1px solid rgba(255, 255, 255, 0.3)`,
        boxShadow: selected
          ? `0 0 0 3px ${DesignTokens.colors.morandi.purple}30, ${DesignTokens.shadows.glow}`
          : DesignTokens.shadows.md,
        padding: DesignTokens.spacing.lg,
        transition: `all ${DesignTokens.animation.duration.normal}ms ${DesignTokens.animation.easing.easeOut}`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
});

SelectionCard.displayName = 'SelectionCard';

export default InteractiveCard;

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DesignTokens from '../../constants/DesignTokens';
import { useUXSystem } from '../../hooks/useUXSystem';

const FocusMode = ({
  children,
  enabled = false,
  onExit,
  showExitButton = true,
  blurBackground = true,
  customContent,
}) => {
  const { triggerHaptic } = useUXSystem();
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = useCallback(() => {
    setIsExiting(true);
    triggerHaptic('medium');
    setTimeout(() => {
      if (onExit) onExit();
    }, 300);
  }, [onExit, triggerHaptic]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && enabled) {
        handleExit();
      }
    };

    if (enabled) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [enabled, handleExit]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: DesignTokens.zIndex.modal,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: blurBackground
            ? 'rgba(249, 250, 251, 0.9)'
            : DesignTokens.colors.neutral.gray50,
          backdropFilter: blurBackground ? 'blur(20px)' : 'none',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3 }}
      >
        {customContent ? (
          customContent
        ) : (
          <>
            <motion.div
              style={{
                width: '100%',
                maxWidth: 600,
                padding: DesignTokens.spacing.xl,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>

            {showExitButton && (
              <motion.button
                onClick={handleExit}
                style={{
                  position: 'fixed',
                  top: DesignTokens.spacing.lg,
                  right: DesignTokens.spacing.lg,
                  padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.md}`,
                  borderRadius: DesignTokens.borderRadius.full,
                  border: `1px solid ${DesignTokens.colors.neutral.gray300}`,
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  color: DesignTokens.colors.neutral.gray600,
                  fontSize: DesignTokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: DesignTokens.spacing.xs,
                }}
                whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 1)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span>✕</span>
                <span>退出专注</span>
              </motion.button>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const ImmersiveSession = ({
  isActive,
  onExit,
  title = '',
  subtitle = '',
  timer = null,
  children,
}) => {
  const { triggerHaptic, shouldAnimate } = useUXSystem();
  const [showHints, setShowHints] = useState(true);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setShowHints(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleExit = () => {
    triggerHaptic('medium');
    if (onExit) onExit();
  };

  if (!isActive) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: DesignTokens.zIndex.modal,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(
          135deg,
          ${DesignTokens.colors.morandi.purple}10 0%,
          ${DesignTokens.colors.morandi.blue}10 50%,
          ${DesignTokens.colors.morandi.green}10 100%
        )`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: `radial-gradient(
                circle at ${20 + i * 20}% ${20 + i * 15}%,
                ${DesignTokens.colors.morandi.purple}05 0%,
                transparent 50%
              )`,
              opacity: 0.5,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          top: DesignTokens.spacing['2xl'],
          textAlign: 'center',
          zIndex: 1,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title && (
          <h1
            style={{
              fontFamily: DesignTokens.typography.fontFamily.handwriting,
              fontSize: DesignTokens.typography.fontSize['3xl'],
              color: DesignTokens.colors.morandi.purple,
              marginBottom: DesignTokens.spacing.xs,
            }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            style={{
              fontSize: DesignTokens.typography.fontSize.base,
              color: DesignTokens.colors.neutral.gray500,
            }}
          >
            {subtitle}
          </p>
        )}
      </motion.div>

      {timer && (
        <motion.div
          style={{
            fontSize: DesignTokens.typography.fontSize['5xl'],
            fontFamily: DesignTokens.typography.fontFamily.mono,
            fontWeight: DesignTokens.typography.fontWeight.bold,
            color: DesignTokens.colors.morandi.purple,
            marginBottom: DesignTokens.spacing['2xl'],
            textShadow: `0 0 30px ${DesignTokens.colors.morandi.purple}40`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          {timer}
        </motion.div>
      )}

      <motion.div
        style={{
          maxWidth: 600,
          width: '90%',
          padding: DesignTokens.spacing['2xl'],
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: DesignTokens.borderRadius['3xl'],
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: DesignTokens.shadows.xl,
          zIndex: 1,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {showHints && (
          <motion.div
            style={{
              position: 'fixed',
              bottom: DesignTokens.spacing['2xl'],
              display: 'flex',
              gap: DesignTokens.spacing.lg,
              padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.lg}`,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: DesignTokens.borderRadius.full,
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
          >
            <span style={{ color: DesignTokens.colors.neutral.gray500, fontSize: DesignTokens.typography.fontSize.sm }}>
              按 <kbd style={{
                padding: '2px 6px',
                background: DesignTokens.colors.neutral.gray200,
                borderRadius: 4,
                fontFamily: DesignTokens.typography.fontFamily.mono,
                fontSize: DesignTokens.typography.fontSize.xs,
              }}>Esc</kbd> 退出
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleExit}
        style={{
          position: 'fixed',
          bottom: DesignTokens.spacing.xl,
          right: DesignTokens.spacing.xl,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: DesignTokens.shadows.lg,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          color: DesignTokens.colors.neutral.gray600,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
};

export { FocusMode as default, ImmersiveSession };

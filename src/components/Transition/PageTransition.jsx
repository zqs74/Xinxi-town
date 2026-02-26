import { motion, AnimatePresence } from 'framer-motion';
import { useUXSystem } from '../../hooks/useUXSystem';
import DesignTokens from '../../constants/DesignTokens';
import { forwardRef } from 'react';

const transitionVariants = {
  fadeSlideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  fadeSlideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
  },
  fadeSlideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  fadeSlideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  },
  scaleFade: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  simpleFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

const PageTransition = forwardRef(({
  children,
  variant = 'fadeSlideUp',
  duration = 'normal',
  delay = 0,
  className = '',
  disabled = false,
  style = {},
}, ref) => {
  const { shouldAnimate, getTransitionDuration } = useUXSystem();

  if (disabled || !shouldAnimate('all')) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  const variantConfig = transitionVariants[variant] || transitionVariants.fadeSlideUp;
  const transitionDuration = getTransitionDuration();
  const durationMs = DesignTokens.animation.duration[duration] || 300;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variantConfig}
      transition={{
        duration: durationMs / 1000,
        delay: delay / 1000,
        ease: DesignTokens.animation.easing.easeOut,
      }}
    >
      {children}
    </motion.div>
  );
});

PageTransition.displayName = 'PageTransition';

export const TransitionGroup = ({ children, className = '' }) => {
  const { shouldAnimate } = useUXSystem();

  if (!shouldAnimate('all')) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
};

export const StaggerContainer = ({
  children,
  staggerDelay = 100,
  className = '',
  containerRef,
}) => {
  const { shouldAnimate } = useUXSystem();

  if (!shouldAnimate('all')) {
    return (
      <div ref={containerRef} className={className}>
        {children}
      </div>
    );
  }

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={containerRef}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className = '',
  delay = 0,
  duration = 'normal',
}) => {
  const { shouldAnimate } = useUXSystem();

  if (!shouldAnimate('all')) {
    return <div className={className}>{children}</div>;
  }

  const durationMs = DesignTokens.animation.duration[duration] || 300;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: durationMs / 1000,
            delay: delay / 1000,
            ease: DesignTokens.animation.easing.easeOut,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const HoverScale = ({
  children,
  scale = 1.05,
  duration = 'fast',
  className = '',
}) => {
  const { shouldAnimate } = useUXSystem();

  if (!shouldAnimate('all')) {
    return <div className={className}>{children}</div>;
  }

  const durationMs = DesignTokens.animation.duration[duration] || 150;

  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      transition={{ duration: durationMs / 1000 }}
    >
      {children}
    </motion.div>
  );
};

export const TapScale = ({
  children,
  scale = 0.95,
  duration = 'instant',
  className = '',
}) => {
  const { shouldAnimate } = useUXSystem();

  if (!shouldAnimate('all')) {
    return <div className={className}>{children}</div>;
  }

  const durationMs = DesignTokens.animation.duration[duration] || 50;

  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={{ duration: durationMs / 1000 }}
    >
      {children}
    </motion.div>
  );
};

export const PulseAnimation = ({
  children,
  scale = 1.05,
  duration = 'slow',
  repeat = Infinity,
  className = '',
}) => {
  const { shouldAnimate } = useUXSystem();

  if (!shouldAnimate('essential')) {
    return <div className={className}>{children}</div>;
  }

  const durationMs = DesignTokens.animation.duration[duration] || 500;

  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration: durationMs / 1000,
        repeat,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export const BreathingAnimation = ({
  children,
  scaleMin = 0.9,
  scaleMax = 1.1,
  duration = 4000,
  repeat = Infinity,
  className = '',
}) => {
  const { shouldAnimate } = useUXSystem();

  if (!shouldAnimate('essential')) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        scale: [scaleMin, scaleMax, scaleMin],
      }}
      transition={{
        duration: duration / 1000,
        repeat,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

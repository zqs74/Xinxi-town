import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import DesignTokens from '../../constants/DesignTokens';
import { useUXSystem } from '../../hooks/useUXSystem';

const BREATHING_PATTERNS = {
  '4-7-8': {
    name: '4-7-8 呼吸',
    description: '放松身心，帮助入睡',
    inhale: 4,
    hold: 7,
    exhale: 8,
  },
  '4-4': {
    name: '方形呼吸',
    description: '平衡呼吸，专注当下',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
  },
  '5-5': {
    name: '平静呼吸',
    description: '简单放松，缓解焦虑',
    inhale: 5,
    hold: 0,
    exhale: 5,
  },
  '6-6': {
    name: '深呼吸',
    description: '充分换氧，提升能量',
    inhale: 6,
    hold: 0,
    exhale: 6,
  },
};

const BreathingCircle = ({
  phase,
  progress,
  size = 200,
  color = 'purple',
  pattern = '4-7-8',
  themeColor,
}) => {
  const colorMap = {
    purple: DesignTokens.colors.morandi.purple,
    blue: DesignTokens.colors.morandi.blue,
    green: DesignTokens.colors.morandi.green,
    pink: DesignTokens.colors.morandi.pink,
  };

  const accentColor = themeColor || colorMap[color] || colorMap.purple;

  // 为每种呼吸模式定义独特的视觉元素
  const patternVisuals = {
    '4-7-8': {
      gradient: `radial-gradient(circle, ${accentColor}40 0%, ${accentColor}20 70%, transparent 100%)`,
      backgroundEffect: `repeating-radial-gradient(circle at center, ${accentColor}10 0px, ${accentColor}10 10px, transparent 10px, transparent 20px)`,
      borderStyle: 'solid',
    },
    '4-4': {
      gradient: `radial-gradient(circle, ${accentColor}50 0%, ${accentColor}30 60%, transparent 100%)`,
      backgroundEffect: `linear-gradient(45deg, ${accentColor}20 0%, transparent 50%, ${accentColor}20 100%)`,
      borderStyle: 'dashed',
    },
    '5-5': {
      gradient: `radial-gradient(circle, ${accentColor}60 0%, ${accentColor}40 50%, transparent 100%)`,
      backgroundEffect: `linear-gradient(180deg, ${accentColor}10 0%, ${accentColor}20 50%, ${accentColor}10 100%)`,
      borderStyle: 'solid',
    },
    '6-6': {
      gradient: `radial-gradient(circle, ${accentColor}70 0%, ${accentColor}50 40%, transparent 100%)`,
      backgroundEffect: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
      borderStyle: 'double',
    },
  };

  const currentVisual = patternVisuals[pattern] || patternVisuals['4-7-8'];

  // 4-7-8呼吸：缓慢渐进，强调屏息阶段
  const getScale478 = () => {
    if (phase === 'inhale') {
      // 缓慢的easeOut放大（4秒）
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      return 1 + (easeOutProgress * 0.35);
    }
    if (phase === 'hold') {
      // 保持最大尺寸7秒，带有轻微的呼吸感
      return 1.35 + Math.sin(progress * Math.PI * 2) * 0.02;
    }
    if (phase === 'exhale') {
      // 更慢的easeIn缩小（8秒），强调缓慢释放
      const easeInProgress = Math.pow(progress, 3);
      return 1.35 - (easeInProgress * 0.35);
    }
    return 1;
  };

  // 4-7-8呼吸：明显的透明度变化，屏息时最亮
  const getOpacity478 = () => {
    if (phase === 'inhale') {
      return 0.3 + (progress * 0.7);
    }
    if (phase === 'hold') {
      return 1;
    }
    if (phase === 'exhale') {
      return 1 - (progress * 0.7);
    }
    return 0.3;
  };

  // 4-7-8呼吸：柔和的光晕效果
  const getGlow478 = () => {
    if (phase === 'hold') {
      return Math.sin(progress * Math.PI) * 0.1 + 0.3;
    }
    return 0.2;
  };

  // 方形呼吸：明确的阶梯式变化，机械感
  const getScaleSquare = () => {
    const scaleStep = 0.4;
    if (phase === 'inhale') {
      // 快速的easeOut放大
      const easeOutProgress = 1 - Math.pow(1 - progress, 5);
      return 1 + (easeOutProgress * scaleStep);
    }
    if (phase === 'hold') {
      // 保持不变
      return 1 + scaleStep;
    }
    if (phase === 'exhale') {
      // 快速的easeIn缩小
      const easeInProgress = Math.pow(progress, 5);
      return 1 + scaleStep - (easeInProgress * scaleStep);
    }
    if (phase === 'holdAfter') {
      // 回到初始尺寸并保持
      return 1;
    }
    return 1;
  };

  // 方形呼吸：阶梯式透明度变化
  const getOpacitySquare = () => {
    if (phase === 'inhale') {
      return 0.4 + (progress * 0.5);
    }
    if (phase === 'hold') {
      return 0.9;
    }
    if (phase === 'exhale') {
      return 0.9 - (progress * 0.5);
    }
    if (phase === 'holdAfter') {
      return 0.4;
    }
    return 0.4;
  };

  // 方形呼吸的旋转效果，每个阶段旋转90度
  const getRotationSquare = () => {
    const rotationPerPhase = 90;
    if (phase === 'inhale') {
      return progress * rotationPerPhase;
    }
    if (phase === 'hold') {
      return rotationPerPhase;
    }
    if (phase === 'exhale') {
      return rotationPerPhase + (progress * rotationPerPhase);
    }
    if (phase === 'holdAfter') {
      return rotationPerPhase * 2;
    }
    return 0;
  };

  // 平静呼吸：平滑正弦波，如海浪般自然
  const getScaleCalm = () => {
    const maxScale = 1.3;
    const minScale = 1;
    const scaleRange = maxScale - minScale;
    
    if (phase === 'inhale') {
      // 平滑的正弦波上升，无明显起点和终点
      const sineProgress = (Math.sin((progress - 0.5) * Math.PI) + 1) / 2;
      return minScale + (sineProgress * scaleRange);
    }
    if (phase === 'exhale') {
      // 平滑的正弦波下降，与吸气自然衔接
      const sineProgress = (Math.sin((progress - 0.5) * Math.PI) + 1) / 2;
      return maxScale - (sineProgress * scaleRange);
    }
    return 1;
  };

  // 平静呼吸：柔和的透明度正弦变化，与海浪同步
  const getOpacityCalm = () => {
    const maxOpacity = 0.95;
    const minOpacity = 0.5;
    const opacityRange = maxOpacity - minOpacity;
    
    if (phase === 'inhale') {
      const sineProgress = (Math.sin((progress - 0.5) * Math.PI) + 1) / 2;
      return minOpacity + (sineProgress * opacityRange);
    }
    if (phase === 'exhale') {
      const sineProgress = (Math.sin((progress - 0.5) * Math.PI) + 1) / 2;
      return maxOpacity - (sineProgress * opacityRange);
    }
    return 0.7;
  };

  // 深呼吸：大幅度，充满活力的变化
  const getScaleDeep = () => {
    if (phase === 'inhale') {
      // 大幅度easeInOut放大，带有强烈的脉冲
      const easeInOutProgress = progress < 0.5 
        ? 2 * Math.pow(progress, 2)
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const baseScale = 1 + (easeInOutProgress * 0.5);
      const pulse = Math.sin(progress * Math.PI * 4) * 0.12;
      return baseScale + pulse;
    }
    if (phase === 'exhale') {
      // 大幅度easeInOut缩小，带有强烈的脉冲
      const easeInOutProgress = progress < 0.5 
        ? 2 * Math.pow(progress, 2)
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const baseScale = 1.5 - (easeInOutProgress * 0.5);
      const pulse = Math.sin(progress * Math.PI * 4) * 0.12;
      return baseScale + pulse;
    }
    return 1;
  };

  // 深呼吸：明显的透明度变化，与缩放同步
  const getOpacityDeep = () => {
    if (phase === 'inhale') {
      return 0.2 + (progress * 0.8);
    }
    if (phase === 'exhale') {
      return 1 - (progress * 0.8);
    }
    return 0.2;
  };

  // 为所有模式添加独特的边框效果
  const getBorderWidth = () => {
    switch (pattern) {
      case '4-7-8':
        return 3 + Math.sin(progress * Math.PI * 2) * 1;
      case '4-4':
        return 4;
      case '5-5':
        return 2 + Math.sin(progress * Math.PI * 2) * 0.5;
      case '6-6':
        return 5 + Math.sin(progress * Math.PI * 4) * 2;
      default:
        return 3;
    }
  };

  // 根据模式选择合适的缩放函数
  const getScale = () => {
    switch (pattern) {
      case '4-7-8':
        return getScale478();
      case '4-4':
        return getScaleSquare();
      case '5-5':
        return getScaleCalm();
      case '6-6':
        return getScaleDeep();
      default:
        return getScale478();
    }
  };

  // 根据模式选择合适的透明度函数
  const getOpacity = () => {
    switch (pattern) {
      case '4-7-8':
        return getOpacity478();
      case '4-4':
        return getOpacitySquare();
      case '5-5':
        return getOpacityCalm();
      case '6-6':
        return getOpacityDeep();
      default:
        return getOpacity478();
    }
  };

  // 根据模式选择合适的旋转函数
  const getRotation = () => {
    switch (pattern) {
      case '4-4':
        // 方形呼吸：每个阶段旋转90度，明确的机械感
        return getRotationSquare();
      case '6-6':
        // 深呼吸：快速旋转，充满活力
        return progress * 360 * 0.8;
      case '5-5':
        // 平静呼吸：非常缓慢的旋转，如树叶飘落
        return progress * 360 * 0.1;
      case '4-7-8':
        // 4-7-8呼吸：轻微的左右摇摆，模拟自然呼吸
        return Math.sin(progress * Math.PI * 2) * 5;
      default:
        return 0;
    }
  };

  // 根据模式选择合适的脉冲函数
  const getPulse = () => {
    switch (pattern) {
      case '6-6':
        // 深呼吸：强烈的脉冲，贯穿整个呼吸周期
        return Math.sin(progress * Math.PI * 6) * 0.08;
      case '5-5':
        // 平静呼吸：柔和的正弦波脉冲，与呼吸节奏同步
        return Math.sin(progress * Math.PI * 2) * 0.04;
      case '4-4':
        // 方形呼吸：间歇性脉冲，每个阶段开始时的冲击感
        return Math.floor(progress * 5) % 2 === 0 ? 0.06 : 0;
      case '4-7-8':
        // 4-7-8呼吸：屏息时的轻微脉冲，强调稳定感
        return phase === 'hold' ? Math.sin(progress * Math.PI * 2) * 0.03 : 0;
      default:
        return 0;
    }
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* 背景效果层 */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: '50%',
          background: currentVisual.backgroundEffect,
          transform: 'translate(-25%, -25%)',
          opacity: 0.5,
        }}
        animate={{
          scale: 1 + Math.sin(progress * Math.PI * 2) * 0.1,
          opacity: 0.3 + Math.sin(progress * Math.PI * 2) * 0.2,
          rotate: getRotation() * 0.5,
        }}
        transition={{ duration: 2 }}
      />

      {/* 外层圆圈 */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size,
          height: size,
          borderRadius: '50%',
          background: currentVisual.gradient,
          transform: 'translate(-50%, -50%)',
          x: '-50%',
          y: '-50%',
          border: `${getBorderWidth()}px ${currentVisual.borderStyle} ${accentColor}70`,
        }}
        animate={{
          scale: getScale() + getPulse(),
          opacity: getOpacity(),
          rotate: getRotation(),
          borderWidth: getBorderWidth(),
        }}
        transition={{ duration: 0.1 }}
      />

      {/* 中层圆圈 */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}60 0%, ${accentColor}30 50%, transparent 100%)`,
          transform: 'translate(-50%, -50%)',
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: (getScale() + getPulse()) * 0.85,
          opacity: getOpacity() * 0.8,
          rotate: getRotation() * 0.8,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* 内层圆圈 */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}80 0%, ${accentColor}50 100%)`,
          transform: 'translate(-50%, -50%)',
          x: '-50%',
          y: '-50%',
          boxShadow: `0 0 ${size * 0.3}px ${accentColor}60`,
          zIndex: 10,
        }}
        animate={{
          scale: (getScale() + getPulse()) * 0.6,
          opacity: getOpacity(),
          rotate: getRotation() * 0.6,
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

const BreathingGuide = ({
  pattern = '4-7-8',
  color = 'purple',
  size = 200,
  onComplete,
  autoStart = false,
  onPhaseChange,
  onProgressChange,
  themeColor,
}) => {
  const { triggerHaptic } = useUXSystem();
  const [isActive, setIsActive] = useState(autoStart);
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  
  // 使用外部传入的pattern，不再维护内部状态
  const currentPattern = BREATHING_PATTERNS[pattern] || BREATHING_PATTERNS['4-7-8'];

  // 状态ref，用于在effect中访问最新状态
  const stateRef = useRef({
    isActive,
    phase,
    progress,
    cycleCount,
  });

  // 更新ref以反映最新状态
  useEffect(() => {
    stateRef.current = {
      isActive,
      phase,
      progress,
      cycleCount,
    };
  }, [isActive, phase, progress, cycleCount]);

  // 当外部pattern变化时，重置呼吸状态
  useEffect(() => {
    if (phase !== 'idle') {
      setPhase('idle');
      setProgress(0);
      setCycleCount(0);
    }
  }, [pattern]);

  const getPhaseDuration = useCallback((phaseName) => {
    switch (phaseName) {
      case 'inhale':
        return currentPattern.inhale * 1000;
      case 'hold':
        return currentPattern.hold * 1000;
      case 'exhale':
        return currentPattern.exhale * 1000;
      case 'holdAfter':
        return (currentPattern.holdAfter || 0) * 1000;
      default:
        return 0;
    }
  }, [currentPattern]);

  const getNextPhase = useCallback((currentPhase) => {
    switch (currentPhase) {
      case 'idle':
        return 'inhale';
      case 'inhale':
        return currentPattern.hold > 0 ? 'hold' : 'exhale';
      case 'hold':
        return 'exhale';
      case 'exhale':
        return currentPattern.holdAfter > 0 ? 'holdAfter' : 'inhale';
      case 'holdAfter':
        return 'inhale';
      default:
        return 'idle';
    }
  }, [currentPattern]);

  // 动画循环effect，监听isActive和phase变化
  useEffect(() => {
    if (!isActive || phase === 'idle') {
      return;
    }

    const duration = getPhaseDuration(phase);
    const startTime = Date.now();
    let intervalId;

    // 触发触觉反馈
    triggerHaptic('light');

    // 动画函数
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      // 当阶段结束时，进入下一阶段
      if (newProgress >= 1) {
        clearInterval(intervalId);
        
        const nextPhase = getNextPhase(phase);
        
        // 如果是新的呼吸轮次，增加计数
        if (nextPhase === 'inhale' && phase !== 'idle') {
          setCycleCount(prev => prev + 1);
        }
        
        // 进入下一阶段
        setPhase(nextPhase);
        setProgress(0);
      }
    };

    // 开始动画
    intervalId = setInterval(animate, 16);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, phase, getPhaseDuration, getNextPhase, triggerHaptic]);

  // 当阶段变化时调用回调
  useEffect(() => {
    if (onPhaseChange) {
      onPhaseChange(phase, isActive);
    }
  }, [phase, isActive, onPhaseChange]);

  // 当进度变化时调用回调
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress, phase);
    }
  }, [progress, phase, onProgressChange]);

  // 开始呼吸时的初始化
  useEffect(() => {
    if (isActive && phase === 'idle') {
      setPhase('inhale');
      setProgress(0);
      setCycleCount(0);
    }
  }, [isActive, phase]);

  useEffect(() => {
    if (!stateRef.current.isActive && stateRef.current.phase !== 'idle') {
      const timer = setTimeout(() => {
        setPhase('idle');
        setProgress(0);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive, phase, setPhase, setProgress]);

  const handleStart = () => {
    setIsActive(true);
    setCycleCount(0);
    triggerHaptic('medium');
  };

  const handlePause = () => {
    setIsActive(false);
    triggerHaptic('light');
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('idle');
    setProgress(0);
    setCycleCount(0);
    triggerHaptic('light');
  };



  const getPhaseText = () => {
    switch (phase) {
      case 'idle':
        return '准备';
      case 'inhale':
        return '吸气...';
      case 'hold':
        return '屏息...';
      case 'exhale':
        return '呼气...';
      case 'holdAfter':
        return '保持...';
      default:
        return '';
    }
  };

  const phaseColorMap = {
    idle: 'text-gray-500',
    inhale: 'text-morandi-purple',
    hold: 'text-morandi-blue',
    exhale: 'text-morandi-green',
    holdAfter: 'text-morandi-pink',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: DesignTokens.spacing.lg,
      padding: DesignTokens.spacing.xl,
    }}>
      <BreathingCircle
        phase={isActive ? phase : 'idle'}
        progress={progress}
        size={size}
        color={color}
        pattern={pattern}
        themeColor={themeColor}
      />

      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        style={{
          fontSize: DesignTokens.typography.fontSize['3xl'],
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: phase === 'idle'
            ? DesignTokens.colors.neutral.gray500
            : phase === 'inhale'
              ? DesignTokens.colors.morandi.purple
              : phase === 'hold'
                ? DesignTokens.colors.morandi.blue
                : phase === 'exhale'
                  ? DesignTokens.colors.morandi.green
                  : DesignTokens.colors.morandi.pink,
        }}
      >
        {getPhaseText()}
      </motion.div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontSize: DesignTokens.typography.fontSize.sm,
            color: DesignTokens.colors.neutral.gray500,
          }}
        >
          第 {cycleCount + 1} 轮
        </motion.div>
      )}

      <div style={{
        display: 'flex',
        gap: DesignTokens.spacing.md,
        marginTop: DesignTokens.spacing.md,
      }}>
        {!isActive ? (
          <motion.button
            onClick={handleStart}
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.xl}`,
              fontSize: DesignTokens.typography.fontSize.lg,
            }}
          >
            开始
          </motion.button>
        ) : (
          <motion.button
            onClick={handlePause}
            className="btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.xl}`,
              fontSize: DesignTokens.typography.fontSize.lg,
            }}
          >
            暂停
          </motion.button>
        )}
        <motion.button
          onClick={handleReset}
          className="btn-secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.lg}`,
          }}
        >
          重置
        </motion.button>
      </div>


    </div>
  );
};

export { BreathingGuide as default, BREATHING_PATTERNS };

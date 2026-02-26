import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mindfulnessAPI } from '../../services/api';
import { useUXSystem } from '../../hooks/useUXSystem';
import { useTheme } from '../../contexts/ThemeContext';
import DesignTokens from '../../constants/DesignTokens';
import PageTransition from '../../components/Transition/PageTransition';
import SelectionCard from '../../components/UI/InteractiveCard';
import BreathingGuide from '../../components/Mindfulness/BreathingGuide';
import MindfulnessStats from '../../components/Mindfulness/MindfulnessStats';
import StatsExport from '../../components/Mindfulness/StatsExport';
import { ImmersiveSession } from '../../components/Focus/FocusMode';
import FocusMode from '../../components/Focus/FocusMode';
import FeedbackIndicator, { RippleButton, AnimatedCheckmark, ShimmerLoader } from '../../components/Feedback/FeedbackIndicator';
import { SkeletonCard } from '../../components/Loading/SkeletonLoader';

const exercises = [
  { id: 1, title: "5分钟快速放松", duration: 300, desc: "适合课间休息", color: 'purple' },
  { id: 2, title: "15分钟深度冥想", duration: 900, desc: "晚间放松", color: 'blue' },
  { id: 3, title: "睡前助眠引导", duration: 1200, desc: "改善睡眠质量", color: 'green' },
  { id: 4, title: "专注力训练", duration: 600, desc: "提升学习效率", color: 'pink' },
];

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Mindfulness = () => {
  const {
    triggerHaptic,
    triggerSuccess,
    triggerComplete,
    shouldAnimate,
    focusMode,
    setFocusMode,
  } = useUXSystem();

  const { theme, getBreathingColor } = useTheme();

  const [activeTab, setActiveTab] = useState('practice'); // practice, stats, export
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [statsData, setStatsData] = useState(null);
  const intervalRef = useRef(null);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [selectedBreathingPattern, setSelectedBreathingPattern] = useState('4-7-8');

  const showFeedback = useCallback((type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback((prev) => ({ ...prev, show: false })), 2000);
  }, []);

  const startTimer = async () => {
    if (!selectedExercise) {
      setError('请先选择一个练习');
      triggerHaptic('error');
      return;
    }

    setError(null);
    setIsActive(true);
    setIsPaused(false);
    setSessionComplete(false);
    setTime(selectedExercise.duration);
    triggerHaptic('medium');

    try {
      const sessionData = {
        exerciseId: selectedExercise.id,
        duration: selectedExercise.duration
      };
      const response = await mindfulnessAPI.startSession(sessionData);
      if (response.success) {
        setSessionId(response.data._id);
        
        // 会话创建成功后，立即开始倒计时
        intervalRef.current = setInterval(() => {
          setTime((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(intervalRef.current);
              setIsActive(false);
              setSessionComplete(true);
              triggerComplete();
              // 倒计时结束时，自动完成会话
              completeSession();
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else {
        setError('创建练习会话失败，请重试');
        setIsActive(false);
      }
    } catch (err) {
      console.error('创建正念会话错误:', err);
      setError('创建练习会话失败，请检查网络连接');
      setIsActive(false);
    }
  };

  const pauseTimer = () => {
    if (isActive && !isPaused) {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      triggerHaptic('light');
    }
  };

  const resumeTimer = () => {
    if (isActive && isPaused) {
      setIsPaused(false);
      triggerHaptic('light');
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            setSessionComplete(true);
            triggerComplete();
            completeSession();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const actualDuration = selectedExercise?.duration - time || 0;
      console.log('结束会话:', { sessionId, actualDuration });
      await mindfulnessAPI.endSession(sessionId, actualDuration);
    } catch (err) {
      console.error('结束正念会话错误:', err);
    } finally {
      setSessionId(null);
    }
  };

  const completeSession = async () => {
    if (!sessionId) {
      console.log('没有 sessionId，跳过完成会话');
      return;
    }
    
    try {
      // 计算实际练习时长（总时长 - 剩余时间）
      const actualDuration = selectedExercise?.duration - time || 0;
      console.log('完成会话:', { sessionId, actualDuration, selectedDuration: selectedExercise?.duration, remainingTime: time });
      
      const response = await mindfulnessAPI.endSession(sessionId, actualDuration);
      if (response.success) {
        console.log('会话完成成功:', response);
      }
    } catch (err) {
      console.error('完成正念会话错误:', err);
    } finally {
      setSessionId(null);
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsPaused(false);
    setSessionComplete(false);
    setTime(selectedExercise ? selectedExercise.duration : 0);
    triggerHaptic('light');
    if (sessionId) {
      endSession();
    }
  };

  const handleSelectExercise = (exercise) => {
    if (isActive) {
      resetTimer();
    }
    setSelectedExercise(exercise);
    setTime(exercise.duration);
    triggerHaptic('light');
    showFeedback('info', `已选择: ${exercise.title}`);
  };

  const handleSessionComplete = useCallback(() => {
    triggerSuccess();
    showFeedback('success', '练习完成！做得很棒！');
  }, [triggerSuccess, showFeedback]);

  // 清理函数应该在组件卸载时执行，而不是sessionId变化时
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (sessionId) {
        endSession();
      }
    };
  }, []);

  // 呼吸状态，用于同步背景效果
  const [breathingPhase, setBreathingPhase] = useState('idle');
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  
  // 呼吸动画背景效果
  const [backgroundScale, setBackgroundScale] = useState(1);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.3);
  const [backgroundColor, setBackgroundColor] = useState(DesignTokens.colors.morandi.purple);
  
  // 处理呼吸阶段变化
  const handlePhaseChange = (phase, isActive) => {
    setBreathingPhase(phase);
    setIsBreathingActive(isActive);
  };
  
  // 处理呼吸进度变化
  const handleProgressChange = (progress, phase) => {
    setBreathingProgress(progress);
  };

  // 根据呼吸模式设置背景颜色
  useEffect(() => {
    setBackgroundColor(getBreathingColor(selectedBreathingPattern));
  }, [selectedBreathingPattern, getBreathingColor]);

  // 根据呼吸阶段和进度更新背景
  useEffect(() => {
    if (!isBreathingActive || breathingPhase === 'idle') {
      return;
    }
    
    let scaleRange, opacityRange;
    
    // 根据不同呼吸模式设置不同的背景参数
    switch (selectedBreathingPattern) {
      case '4-7-8':
        scaleRange = 0.25;
        opacityRange = 0.25;
        break;
      case '4-4':
        scaleRange = 0.35;
        opacityRange = 0.35;
        break;
      case '5-5':
        scaleRange = 0.2;
        opacityRange = 0.2;
        break;
      case '6-6':
        scaleRange = 0.5;
        opacityRange = 0.5;
        break;
      default:
        scaleRange = 0.2;
        opacityRange = 0.2;
    }
    
    // 根据呼吸阶段调整背景效果
    let scale, opacity;
    switch (breathingPhase) {
      case 'inhale':
        // 吸气：放大+变亮
        scale = 1 + (breathingProgress * scaleRange);
        opacity = 0.3 + (breathingProgress * opacityRange);
        break;
      case 'hold':
        // 屏息：保持最大/最小状态
        scale = 1 + scaleRange;
        opacity = 0.3 + opacityRange;
        break;
      case 'exhale':
        // 呼气：缩小+变暗
        scale = 1 + scaleRange - (breathingProgress * scaleRange);
        opacity = 0.3 + opacityRange - (breathingProgress * opacityRange);
        break;
      case 'holdAfter':
        // 呼气后屏息：保持最小状态
        scale = 1;
        opacity = 0.3;
        break;
      default:
        scale = 1;
        opacity = 0.3;
    }
    
    // 应用背景效果
    setBackgroundScale(scale);
    setBackgroundOpacity(opacity);
  }, [breathingPhase, breathingProgress, isBreathingActive, selectedBreathingPattern]);

  return (
    <PageTransition variant="fadeSlideUp" className="min-h-screen">
      {/* 呼吸动画背景 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: `radial-gradient(circle, ${backgroundColor}30 0%, ${backgroundColor}10 50%, transparent 100%)`,
        transform: `scale(${backgroundScale})`,
        opacity: backgroundOpacity,
        transition: 'all 0.3s ease',
      }} />
      
      {/* 动态背景光晕 */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '80vw',
        height: '80vh',
        zIndex: -1,
        transform: `translate(-50%, -50%) scale(${backgroundScale * 1.5})`,
        background: `radial-gradient(circle, ${backgroundColor}20 0%, transparent 70%)`,
        opacity: backgroundOpacity * 0.5,
        transition: 'all 0.5s ease',
        borderRadius: '50%',
        filter: 'blur(40px)',
      }} />

      <FeedbackIndicator
        type={feedback.type}
        message={feedback.message}
        show={feedback.show}
      />

      <FocusMode
        enabled={focusMode}
        onExit={() => setFocusMode(false)}
        blurBackground={true}
      >
        <div className="text-center">
          <h2 style={{
            fontFamily: DesignTokens.typography.fontFamily.handwriting,
            fontSize: DesignTokens.typography.fontSize['3xl'],
            color: DesignTokens.colors.morandi.purple,
            marginBottom: DesignTokens.spacing.md,
          }}>
            🐻 正念庭院 · 专注模式
          </h2>
          <p style={{
            fontSize: DesignTokens.typography.fontSize.lg,
            color: DesignTokens.colors.neutral.gray600,
            marginBottom: DesignTokens.spacing['2xl'],
          }}>
            深呼吸，专注当下
          </p>
        </div>
      </FocusMode>

      <AnimatePresence>
        {sessionComplete && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: DesignTokens.zIndex.modal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(5px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                background: 'white',
                padding: DesignTokens.spacing['2xl'],
                borderRadius: DesignTokens.borderRadius['2xl'],
                textAlign: 'center',
                maxWidth: 400,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <AnimatedCheckmark
                size={64}
                color={DesignTokens.colors.status.success}
              />
              <h2 style={{
                fontFamily: DesignTokens.typography.fontFamily.handwriting,
                fontSize: DesignTokens.typography.fontSize['2xl'],
                color: DesignTokens.colors.morandi.purple,
                marginTop: DesignTokens.spacing.lg,
                marginBottom: DesignTokens.spacing.md,
              }}>
                练习完成！
              </h2>
              <p style={{ color: DesignTokens.colors.neutral.gray600, marginBottom: DesignTokens.spacing.xl }}>
                你完成了一次正念练习，做得很好！
              </p>
              <RippleButton
                onClick={() => setSessionComplete(false)}
                color="purple"
                size="lg"
              >
                完成
              </RippleButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 页面标题和标签页导航 */}
      <div className="town-card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.div
              style={{ fontSize: '3rem', marginRight: DesignTokens.spacing.md }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🐻
            </motion.div>
            <div>
              <h1 className="text-3xl font-handwriting text-morandi-purple">
                正念庭院
              </h1>
              <p className="text-gray-600">黑熊的呼吸练习课</p>
            </div>
          </div>
          <motion.button
            onClick={() => {
              setFocusMode(true);
              triggerHaptic('medium');
            }}
            style={{
              padding: `${DesignTokens.spacing.xs} ${DesignTokens.spacing.md}`,
              borderRadius: DesignTokens.borderRadius.full,
              border: `1px solid ${theme.colors.primary}`,
              background: 'transparent',
              color: theme.colors.primary,
              cursor: 'pointer',
              fontSize: DesignTokens.typography.fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              gap: DesignTokens.spacing.xs,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🎯</span>
            <span>专注模式</span>
          </motion.button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 'practice', label: '练习', icon: '🧘' },
            { id: 'stats', label: '统计', icon: '📊' },
            { id: 'export', label: '导出', icon: '💾' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                triggerHaptic('light');
              }}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all ${activeTab === tab.id
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 标签页内容 */}
      <AnimatePresence mode="wait">
        {activeTab === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="town-card mb-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    background: `${DesignTokens.colors.status.error}15`,
                    color: DesignTokens.colors.status.error,
                    padding: `${DesignTokens.spacing.sm} ${DesignTokens.spacing.md}`,
                    borderRadius: DesignTokens.borderRadius.lg,
                    marginBottom: DesignTokens.spacing.md,
                    border: `1px solid ${DesignTokens.colors.status.error}30`,
                  }}
                >
                  {error}
                </motion.div>
              )}

              <div className="mb-6">
                <div
                  className="rounded-2xl p-8 text-center mb-6"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: theme.colors.gradient,
                  }}
                >
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '6rem',
                      opacity: 0.2,
                    }}
                    animate={isActive ? {
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2],
                    } : {}}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    🌿
                  </motion.div>

                  <motion.h3
                    className="text-2xl font-semibold mb-2 relative z-10"
                    style={{ color: DesignTokens.colors.neutral.gray800 }}
                    key={selectedExercise?.title || 'default'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {selectedExercise ? selectedExercise.title : '选择一个练习开始'}
                  </motion.h3>
                  <p className="text-gray-600 mb-4 relative z-10">
                    {isActive
                      ? (isPaused ? '已暂停... 吸气... 呼气...' : '吸气... 呼气... 感受此刻的平静')
                      : '准备好开始正念练习了吗？'}
                  </p>
                  <motion.div
                    className="text-5xl font-mono font-bold relative z-10"
                    style={{ color: theme.colors.primary }}
                    key={time}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatTime(time)}
                  </motion.div>

                  {isActive && (
                    <motion.div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        width: `${((selectedExercise?.duration - time) / selectedExercise?.duration) * 100}%`,
                      }}
                      animate={{ width: `${((selectedExercise?.duration - time) / selectedExercise?.duration) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  )}
                </div>

                <div className="flex justify-center space-x-4">
                  {isActive ? (
                    isPaused ? (
                      <>
                        <RippleButton onClick={resumeTimer} color="green" size="lg">
                          ▶ 继续
                        </RippleButton>
                        <RippleButton onClick={resetTimer} color="purple" size="lg">
                          ⏹ 结束
                        </RippleButton>
                      </>
                    ) : (
                      <>
                        <RippleButton onClick={pauseTimer} color="yellow" size="lg">
                          ⏸ 暂停
                        </RippleButton>
                        <RippleButton onClick={resetTimer} color="purple" size="lg">
                          ⏹ 结束
                        </RippleButton>
                      </>
                    )
                  ) : (
                    <RippleButton onClick={startTimer} color="purple" size="lg">
                      ▶ 开始练习
                    </RippleButton>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SelectionCard
                    selected={selectedExercise?.id === exercise.id}
                    onClick={() => handleSelectExercise(exercise)}
                    color={exercise.color}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg" style={{ color: DesignTokens.colors.neutral.gray800 }}>
                          {exercise.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{exercise.desc}</p>
                      </div>
                      <motion.div
                        className="text-2xl font-bold"
                        style={{ color: DesignTokens.colors.morandi[exercise.color] }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {formatTime(exercise.duration)}
                      </motion.div>
                    </div>
                  </SelectionCard>
                </motion.div>
              ))}
            </div>

            <motion.div
              style={{
                marginTop: DesignTokens.spacing['2xl'],
                padding: DesignTokens.spacing.lg,
                background: theme.colors.card,
                backdropFilter: 'blur(10px)',
                borderRadius: DesignTokens.borderRadius.xl,
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-semibold text-lg mb-4" style={{ color: theme.colors.primary }}>
                💡 呼吸引导
              </h3>
              
              {/* 呼吸模式选择器 */}
              <div style={{ marginBottom: DesignTokens.spacing.md, display: 'flex', justifyContent: 'center', gap: DesignTokens.spacing.sm }}>
                {['4-7-8', '4-4', '5-5', '6-6'].map((pattern) => {
                  const patternNames = {
                    '4-7-8': '4-7-8呼吸',
                    '4-4': '方形呼吸',
                    '5-5': '平静呼吸',
                    '6-6': '深呼吸'
                  };
                  return (
                    <motion.button
                      key={pattern}
                      onClick={() => setSelectedBreathingPattern(pattern)}
                      style={{
                        padding: `${DesignTokens.spacing.xs} ${DesignTokens.spacing.md}`,
                        borderRadius: DesignTokens.borderRadius.full,
                        border: selectedBreathingPattern === pattern
                          ? `2px solid ${theme.colors.primary}`
                          : `1px solid ${DesignTokens.colors.neutral.gray300}`,
                        background: selectedBreathingPattern === pattern
                          ? `${theme.colors.primary}20`
                          : 'transparent',
                        color: selectedBreathingPattern === pattern
                          ? theme.colors.primary
                          : DesignTokens.colors.neutral.gray600,
                        cursor: 'pointer',
                        fontSize: DesignTokens.typography.fontSize.sm,
                        transition: 'all 0.2s',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {patternNames[pattern]}
                    </motion.button>
                  );
                })}
              </div>
              
              <BreathingGuide
                pattern={selectedBreathingPattern}
                color={theme.id}
                size={150}
                autoStart={false}
                onPhaseChange={handlePhaseChange}
                onProgressChange={handleProgressChange}
                themeColor={getBreathingColor(selectedBreathingPattern)}
              />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MindfulnessStats />
          </motion.div>
        )}

        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StatsExport statsData={statsData} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </PageTransition>
  );
};

export default memo(Mindfulness);

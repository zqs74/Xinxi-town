import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import DesignTokens from '../../constants/DesignTokens';

const ThemeSelector = ({ compact = false }) => {
  const { currentTheme, theme, setTheme, themes } = useTheme();

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {Object.values(themes).map((t) => (
          <motion.button
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{
              background: t.colors.gradient,
              border: currentTheme === t.id ? '3px solid' : '2px solid transparent',
              borderColor: currentTheme === t.id ? t.colors.primary : 'transparent',
              boxShadow: currentTheme === t.id ? `0 0 20px ${t.colors.primary}40` : 'none',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={t.name}
          >
            {t.icon}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: DesignTokens.spacing.lg,
        background: theme.colors.card,
        backdropFilter: 'blur(10px)',
        borderRadius: DesignTokens.borderRadius['2xl'],
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <h3
        className="font-semibold text-lg mb-4"
        style={{ color: DesignTokens.colors.neutral.gray800 }}
      >
        🎨 选择主题
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(themes).map((t) => (
          <motion.button
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className="relative p-4 rounded-2xl text-left transition-all"
            style={{
              background: currentTheme === t.id ? t.colors.gradient : 'rgba(255, 255, 255, 0.5)',
              border: currentTheme === t.id ? '2px solid' : '1px solid',
              borderColor: currentTheme === t.id ? t.colors.primary : DesignTokens.colors.neutral.gray200,
              boxShadow: currentTheme === t.id ? `0 4px 20px ${t.colors.primary}30` : 'none',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{t.icon}</span>
              <span
                className="font-semibold"
                style={{ color: DesignTokens.colors.neutral.gray800 }}
              >
                {t.name}
              </span>
            </div>
            <p
              className="text-sm"
              style={{ color: DesignTokens.colors.neutral.gray600 }}
            >
              {t.description}
            </p>
            {currentTheme === t.id && (
              <motion.div
                className="absolute top-2 right-2 text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ color: t.colors.primary }}
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;

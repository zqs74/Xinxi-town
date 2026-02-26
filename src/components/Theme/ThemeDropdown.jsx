import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeDropdown = () => {
  const { currentTheme, theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  console.log('ThemeDropdown render:', { currentTheme, theme, themes });

  if (!theme) {
    console.error('ThemeDropdown: theme is undefined');
    return null;
  }

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl">{theme.icon}</span>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          主题
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 overflow-hidden"
              style={{ zIndex: 9999 }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  选择主题
                </p>
              </div>
              {Object.values(themes).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                  style={{
                    background: currentTheme === t.id ? `${t.colors.primary}15` : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{
                      background: t.colors.gradient,
                      border: currentTheme === t.id ? `2px solid ${t.colors.primary}` : 'none',
                    }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className="text-sm font-medium"
                      style={{ color: currentTheme === t.id ? t.colors.primary : '#374151' }}
                    >
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </div>
                  {currentTheme === t.id && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-sm"
                      style={{ color: t.colors.primary }}
                    >
                      ✓
                    </motion.span>
                  )}
                </button>
              ))}
            </motion.div>
            <div
              className="fixed inset-0"
              style={{ zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeDropdown;

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themes, defaultTheme, getTheme } from '../constants/Themes';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('selectedTheme');
    return saved || defaultTheme;
  });

  const theme = getTheme(currentTheme);

  console.log('ThemeProvider render:', { currentTheme, theme });

  useEffect(() => {
    localStorage.setItem('selectedTheme', currentTheme);
  }, [currentTheme]);

  const setTheme = useCallback((themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
    }
  }, []);

  const getBreathingColor = useCallback((pattern) => {
    return theme.breathing[pattern] || theme.colors.primary;
  }, [theme]);

  const value = {
    currentTheme,
    theme,
    setTheme,
    themes,
    getBreathingColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

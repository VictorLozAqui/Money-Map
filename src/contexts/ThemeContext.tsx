import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    const migrated = localStorage.getItem('darkModeV2');
    
    // Se ainda não foi migrado para a v2, forçar modo escuro como padrão
    if (!migrated) {
      localStorage.setItem('darkModeV2', 'true');
      localStorage.setItem('darkMode', 'true');
      return true;
    }
    
    // Se não houver preferência salva, modo escuro é o padrão
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


"use client";

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AnimatedButton } from './AnimatedButton';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'system': return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <AnimatedButton
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="w-10 h-10 p-0"
    >
      {getIcon()}
    </AnimatedButton>
  );
}

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useUIStore from '@/stores/uiStore';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useUIStore();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`touch-target p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${className}`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;

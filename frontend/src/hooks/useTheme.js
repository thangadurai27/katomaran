import { useEffect } from 'react';
import useUIStore from '@/stores/uiStore';

export const useThemeInit = () => {
    const theme = useUIStore((s) => s.theme);

    useEffect(() => {
        const root = document.documentElement;
        const stored = localStorage.getItem('snaplink-theme');
        const resolved = stored === 'dark' || stored === 'light' ? stored : theme;
        if (stored && stored !== theme) {
            useUIStore.getState().setTheme(stored);
        }
        root.classList.toggle('dark', resolved === 'dark');
    }, [theme]);
};

export default useThemeInit;

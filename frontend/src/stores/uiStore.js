import { create } from 'zustand';

const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('snaplink-theme') || 'light';
};

const useUIStore = create((set) => ({
    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    theme: getInitialTheme(),

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

    setTheme: (theme) => {
        localStorage.setItem('snaplink-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
    },
    toggleTheme: () =>
        set((state) => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('snaplink-theme', next);
            document.documentElement.classList.toggle('dark', next === 'dark');
            return { theme: next };
        }),
}));

export default useUIStore;

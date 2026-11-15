import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import {
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    setAuthTokens,
} from '@/lib/authTokens';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            // Auth lifecycle: starts false, becomes true after the session
            // has been verified (or proven absent). Routes must not redirect
            // until this is true.
            isInitialized: false,
            isInitializing: false,
            isLoading: false,
            error: null,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setTokens: (accessToken, refreshToken) => {
                setAuthTokens(accessToken, refreshToken);
                set({ accessToken, refreshToken });
            },

            /**
             * Verify the persisted session exactly once per app load.
             * - No token            -> unauthenticated
             * - Valid token         -> authenticated (user refreshed from API)
             * - Expired token       -> Axios refreshes it and retries
             * - Rejected refresh    -> tokens cleared, unauthenticated
             */
            initializeAuth: async () => {
                if (get().isInitialized || get().isInitializing) return;

                set({ isInitializing: true });

                const accessToken = getAccessToken();
                if (!accessToken) {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isInitialized: true,
                        isInitializing: false,
                    });
                    return;
                }

                try {
                    const { data } = await api.get('/auth/me');
                    set({
                        user: data.data.user,
                        accessToken: getAccessToken(),
                        refreshToken: getRefreshToken(),
                        isAuthenticated: true,
                        isInitialized: true,
                        isInitializing: false,
                        error: null,
                    });
                } catch {
                    clearAuthTokens();
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isInitialized: true,
                        isInitializing: false,
                    });
                }
            },

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', credentials);
                    const { user, accessToken, refreshToken } = data.data;
                    setAuthTokens(accessToken, refreshToken);
                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isInitialized: true,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (error) {
                    const msg = error.response?.data?.message || 'Login failed';
                    set({ error: msg, isLoading: false });
                    return { success: false, error: msg };
                }
            },

            signup: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/signup', userData);
                    const { user, accessToken, refreshToken } = data.data;
                    setAuthTokens(accessToken, refreshToken);
                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isInitialized: true,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (error) {
                    const msg = error.response?.data?.message || 'Signup failed';
                    set({ error: msg, isLoading: false });
                    return { success: false, error: msg };
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch {
                    /* ignore network errors — local session still ends */
                }
                clearAuthTokens();
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isInitialized: true,
                    isLoading: false,
                });
            },

            fetchMe: async () => {
                try {
                    const { data } = await api.get('/auth/me');
                    set({
                        user: data.data.user,
                        isAuthenticated: true,
                        isInitialized: true,
                    });
                } catch {
                    clearAuthTokens();
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isInitialized: true,
                    });
                }
            },

            updateUser: (updatedUser) => set({ user: { ...get().user, ...updatedUser } }),
            clearError: () => set({ error: null }),
        }),
        {
            name: 'snaplink-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// The Axios layer cannot import the store directly (circular dependency),
// so it emits events and the store reacts here.
if (typeof window !== 'undefined') {
    window.addEventListener('snaplink:auth-expired', () => {
        useAuthStore.setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
        });
    });

    window.addEventListener('snaplink:tokens', (event) => {
        useAuthStore.setState({
            accessToken: event.detail?.accessToken ?? null,
            refreshToken: event.detail?.refreshToken ?? null,
        });
    });
}

export default useAuthStore;
export { useAuthStore };

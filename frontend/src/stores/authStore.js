import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setTokens: (accessToken, refreshToken) => {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                set({ accessToken, refreshToken });
            },

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', credentials);
                    const { user, accessToken, refreshToken } = data.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
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
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
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
                } catch { }
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            fetchMe: async () => {
                try {
                    const { data } = await api.get('/auth/me');
                    set({ user: data.data.user, isAuthenticated: true });
                } catch {
                    set({ user: null, isAuthenticated: false });
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
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export default useAuthStore;

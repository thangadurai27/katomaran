import axios from 'axios';
import { API_URL } from '../config/env';
import {
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    setAuthTokens,
} from './authTokens';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Endpoints that must never trigger the refresh-token flow. A 401 from
// login/signup means "bad credentials" and redirecting would hide the error.
const AUTH_ENDPOINTS = /\/auth\/(login|signup|refresh-token|logout|forgot-password|reset-password|verify-email)/;

let refreshPromise = null;

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;
        const url = original?.url || '';

        if (
            status !== 401 ||
            !original ||
            original._retry ||
            AUTH_ENDPOINTS.test(url)
        ) {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');

            // Single-flight refresh: many parallel 401s share one request.
            if (!refreshPromise) {
                refreshPromise = axios
                    .post(
                        `${API_URL}/auth/refresh-token`,
                        { refreshToken },
                        { withCredentials: true, timeout: 15000 }
                    )
                    .then(({ data }) => {
                        const accessToken = data.data.accessToken;
                        const nextRefreshToken = data.data.refreshToken;
                        setAuthTokens(accessToken, nextRefreshToken);
                        window.dispatchEvent(
                            new CustomEvent('snaplink:tokens', {
                                detail: { accessToken, refreshToken: nextRefreshToken },
                            })
                        );
                        return accessToken;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const accessToken = await refreshPromise;
            original.headers = {
                ...(original.headers || {}),
                Authorization: `Bearer ${accessToken}`,
            };
            return api(original);
        } catch (refreshError) {
            const refreshStatus = refreshError.response?.status;
            // Only destroy the session when the refresh token is actually
            // rejected. Network/429/server errors should not log the user out.
            const sessionIsInvalid =
                !refreshStatus || refreshStatus === 401 || refreshStatus === 403;

            if (sessionIsInvalid) {
                clearAuthTokens();
                window.dispatchEvent(new CustomEvent('snaplink:auth-expired'));
            }

            return Promise.reject(error);
        }
    }
);

export default api;

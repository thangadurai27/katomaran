/**
 * Single source of truth for token storage.
 * Kept separate from the Zustand store so the Axios layer can use it
 * without creating a circular import.
 */
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const safeGet = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeSet = (key, value) => {
    try {
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
    } catch {
        /* storage unavailable */
    }
};

export const getAccessToken = () => safeGet(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => safeGet(REFRESH_TOKEN_KEY);

export const setAuthTokens = (accessToken, refreshToken) => {
    safeSet(ACCESS_TOKEN_KEY, accessToken);
    safeSet(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearAuthTokens = () => {
    safeSet(ACCESS_TOKEN_KEY, null);
    safeSet(REFRESH_TOKEN_KEY, null);
};

/** Production API (Render) — used when VITE_* are missing at build time */
const PROD_BACKEND = 'https://katomaran-y789.onrender.com';

const isProd = import.meta.env.PROD;

export const API_URL =
    import.meta.env.VITE_API_URL ||
    (isProd ? `${PROD_BACKEND}/api` : 'http://localhost:5000/api');

export const BASE_URL =
    import.meta.env.VITE_BASE_URL ||
    (isProd ? PROD_BACKEND : 'http://localhost:5000');

export const SHORT_URL_BASE =
    import.meta.env.VITE_SHORT_URL_BASE ||
    (isProd ? `${PROD_BACKEND}/r/` : 'http://localhost:5000/r/');

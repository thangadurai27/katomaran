/** FRONTEND_URL (docs) or CLIENT_URL (Render) + local dev */
const PRODUCTION_FRONTEND = 'https://katomaran-eight.vercel.app';
const PREVIEW_FRONTEND = 'https://katomaran-1lr2xmqiz-thangadurais-projects-3903bebb.vercel.app';

// Vercel preview deployments for this project follow:
// https://katomaran-<deployment>-thangadurais-projects-3903bebb.vercel.app
const VERCEL_PREVIEW_PATTERN =
    /^https:\/\/katomaran-[a-z0-9-]+-thangadurais-projects-3903bebb\.vercel\.app$/i;

const isAllowedOrigin = (origin) => {
    if (!origin) return true; // non-browser / same-origin requests

    const allowed = new Set([
        'http://localhost:5173',
        'http://localhost:3000',
        PRODUCTION_FRONTEND,
        PREVIEW_FRONTEND,
    ]);

    for (const key of ['FRONTEND_URL', 'CLIENT_URL']) {
        const value = process.env[key];
        if (value) allowed.add(value.replace(/\/$/, ''));
    }

    if (allowed.has(origin)) return true;
    try {
        const { protocol, hostname } = new URL(origin);
        if (protocol === 'https:' && VERCEL_PREVIEW_PATTERN.test(origin)) return true;
        if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) return true;
    } catch {
        return false;
    }
    return false;
};

const getCorsOrigins = () => [
    'http://localhost:5173',
    'http://localhost:3000',
    PRODUCTION_FRONTEND,
    PREVIEW_FRONTEND,
];

module.exports = { getCorsOrigins, isAllowedOrigin };
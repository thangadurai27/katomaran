import { lazy } from 'react';

const RELOAD_KEY = 'snaplink:chunk-reload-at';
const RELOAD_COOLDOWN = 15000;

const isChunkError = (error) => {
    const message = String(error?.message || error || '');
    return /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|loading chunk|dynamically imported module/i.test(
        message
    );
};

const clearCachesAndReload = async () => {
    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
        }
    } catch {
        /* ignore cache failures, reload anyway */
    }
    window.location.reload();
};

/**
 * React.lazy wrapper that recovers from stale deployment chunks.
 *
 * After a new Vercel deploy, a tab still running the previous build can ask
 * for a hashed chunk that no longer exists. Without this guard React would
 * throw and (with no error boundary) leave a blank screen. We reload once
 * after clearing stale service-worker caches; a cooldown prevents loops.
 */
export const lazyWithRetry = (importer) =>
    lazy(async () => {
        try {
            return await importer();
        } catch (error) {
            if (isChunkError(error) && typeof window !== 'undefined') {
                let lastReload = 0;
                try {
                    lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
                } catch {
                    /* storage unavailable */
                }

                if (Date.now() - lastReload > RELOAD_COOLDOWN) {                    try {
                        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
                    } catch {
                        /* ignore */
                    }
                    await clearCachesAndReload();
                    // Never resolve: the page is navigating away.
                    return new Promise(() => {});
                }
            }
            throw error;
        }
    });

export default lazyWithRetry;

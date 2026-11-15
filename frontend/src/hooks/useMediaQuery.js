import { useCallback, useSyncExternalStore } from 'react';

const subscribe = (query, callback) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
};

const getSnapshot = (query) => window.matchMedia(query).matches;
const getServerSnapshot = () => false;

export const useMediaQuery = (query) => {
    const subscribeCallback = useCallback((callback) => subscribe(query, callback), [query]);
    const getSnapshotCallback = useCallback(() => getSnapshot(query), [query]);
    return useSyncExternalStore(subscribeCallback, getSnapshotCallback, getServerSnapshot);
};

export const useIsMobile = () => useMediaQuery('(max-width: 1023px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

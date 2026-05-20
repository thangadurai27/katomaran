import { useEffect, useState } from 'react';

export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false
    );

    useEffect(() => {
        const mq = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        setMatches(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [query]);

    return matches;
};

export const useIsMobile = () => useMediaQuery('(max-width: 1023px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

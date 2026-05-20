import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/useMediaQuery';

/**
 * Mobile-optimized chart wrapper with horizontal scroll fallback on small screens.
 */
const ResponsiveChart = ({ height = 250, mobileHeight = 200, children, className = '' }) => {
    const isMobile = useIsMobile();
    const h = isMobile ? mobileHeight : height;

    return (
        <div className={`w-full min-w-0 ${className}`}>
            <div className="w-full overflow-x-auto overscroll-x-contain -mx-1 px-1">
                <div className="min-w-[280px] sm:min-w-0" style={{ height: h }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {children}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveChart;

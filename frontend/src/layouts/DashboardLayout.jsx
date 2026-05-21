import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import PageTransition from '@/components/ui/PageTransition';
import useUIStore from '@/stores/uiStore';
import useAuthStore from '@/stores/authStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { io } from 'socket.io-client';
import { BASE_URL } from '@/config/env';

const DashboardLayout = () => {
    const { sidebarOpen, sidebarCollapsed, setSidebarOpen } = useUIStore();
    const { accessToken } = useAuthStore();
    const isMobile = useIsMobile();
    const location = useLocation();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

    const showFab = !location.pathname.includes('create-link');

    useEffect(() => {
        if (!accessToken) return;
        const timer = setTimeout(() => {
            const socket = io(BASE_URL, {
                auth: { token: accessToken },
                transports: ['websocket', 'polling'],
                reconnectionDelayMax: 5000,
            });
            window.__socket = socket;
        }, 0);
        return () => {
            clearTimeout(timer);
            window.__socket?.disconnect();
        };
    }, [accessToken]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const sync = () => setSidebarOpen(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, [setSidebarOpen]);

    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [location.pathname, isMobile, setSidebarOpen]);

    const marginLeft = !isMobile && sidebarOpen ? (sidebarCollapsed ? '68px' : '256px') : '0px';

    return (
        <div className="flex min-h-screen-safe overflow-hidden bg-[var(--bg-base)]">
            <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden />

            <Sidebar />

            <div
                className="flex flex-col flex-1 min-w-0 w-full transition-[margin] duration-300 ease-in-out"
                style={{ marginLeft }}
            >
                <DashboardHeader />

                <main className="dashboard-main dashboard-surface px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="max-w-7xl mx-auto w-full min-w-0">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </div>
                </main>
            </div>

            {isMobile && sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <MobileBottomNav />
            {showFab && <FloatingActionButton />}
        </div>
    );
};

export default DashboardLayout;

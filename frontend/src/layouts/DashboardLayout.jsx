import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
    const { sidebarOpen, setSidebarOpen } = useUIStore();
    const { accessToken } = useAuthStore();
    const isMobile = useIsMobile();
    const location = useLocation();

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

    useEffect(() => {
        document.body.style.overflow = isMobile && sidebarOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, sidebarOpen]);

    return (
        <div className="min-h-screen-safe bg-[var(--bg-base)]">
            <Sidebar />

            {isMobile && sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-30 bg-[#1D1B33]/40 backdrop-blur-[2px] lg:hidden"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex min-h-screen-safe min-w-0 flex-col lg:pl-[272px]">
                <DashboardHeader />

                <main className="dashboard-main dashboard-surface dashboard-canvas px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full min-w-0 max-w-[1600px]">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </div>
                </main>
            </div>

            <MobileBottomNav />
            {showFab && <FloatingActionButton />}
        </div>
    );
};

export default DashboardLayout;

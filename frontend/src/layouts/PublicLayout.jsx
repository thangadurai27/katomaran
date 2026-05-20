import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col mesh-bg">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;

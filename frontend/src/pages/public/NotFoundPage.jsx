import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-50 pointer-events-none" />

        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 max-w-md card-elevated p-10 rounded-3xl"
        >
            <div className="text-7xl font-extrabold font-display gradient-text mb-4 select-none">404</div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-brand">
                <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 mb-2">Page not found</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/" className="btn-primary">
                    <Home className="w-4 h-4" /> Go Home
                </Link>
                <button type="button" onClick={() => window.history.back()} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        </motion.div>
    </div>
);

export default NotFoundPage;

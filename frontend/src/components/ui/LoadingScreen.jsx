import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const LoadingScreen = () => (
    <div className="fixed inset-0 mesh-bg flex items-center justify-center z-50">
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5"
        >
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-brand-lg">
                    <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <motion.div
                    className="absolute -inset-2 rounded-3xl border-2 border-brand-400/30"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold font-display gradient-text-brand">SnapLink AI</h2>
                <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>Loading your workspace…</p>
            </div>
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-brand-500"
                        animate={{ scale: [1, 1.35, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                ))}
            </div>
        </motion.div>
    </div>
);

export default LoadingScreen;

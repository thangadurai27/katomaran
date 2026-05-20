import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ to = '/dashboard/create-link', label = 'Create link', onClick }) => {
    const className =
        'touch-target-lg fixed z-30 flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white shadow-brand-lg hover:bg-brand-700 active:scale-95 transition-transform lg:hidden safe-fab';

    const content = (
        <>
            <Plus className="w-6 h-6" strokeWidth={2.5} aria-hidden />
            <span className="sr-only">{label}</span>
        </>
    );

    if (onClick) {
        return (
            <motion.button
                type="button"
                onClick={onClick}
                className={`${className} right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))]`}
                whileTap={{ scale: 0.92 }}
                aria-label={label}
            >
                {content}
            </motion.button>
        );
    }

    return (
        <motion.div
            className="right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] fixed z-30 lg:hidden"
            whileTap={{ scale: 0.92 }}
        >
            <Link to={to} className={className} aria-label={label}>
                {content}
            </Link>
        </motion.div>
    );
};

export default FloatingActionButton;

import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={className}
    >
        {children}
    </motion.div>
);

export default PageTransition;

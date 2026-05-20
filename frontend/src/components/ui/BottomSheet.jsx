import React, { useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';

const BottomSheet = ({ open, onClose, title, children, className = '' }) => {
    const dragControls = useDragControls();

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:bg-slate-900/40"
                        onClick={onClose}
                        aria-hidden
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        drag="y"
                        dragControls={dragControls}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.12}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 400) onClose();
                        }}
                        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-lg rounded-t-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 safe-bottom lg:max-w-md lg:left-1/2 lg:-translate-x-1/2 ${className}`}
                    >
                        <div
                            className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        </div>
                        {title && (
                            <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h2 id="bottom-sheet-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {title}
                                </h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="touch-target p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        <div className="overflow-y-auto overscroll-contain px-5 py-4 max-h-[calc(92dvh-5rem)]">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;

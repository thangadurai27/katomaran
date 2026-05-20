import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Reset link sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl pointer-events-none" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">SnapLink AI</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Forgot password?</h1>
                    <p className="text-dark-400 mt-2">Enter your email and we'll send you a reset link</p>
                </div>

                <div className="glass-card p-8">
                    {sent ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
                            <p className="text-dark-400 text-sm mb-6">
                                We sent a password reset link to <span className="text-white font-medium">{email}</span>
                            </p>
                            <Link to="/login" className="btn-secondary">Back to login</Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="input-label flex items-center gap-2"><Mail className="w-4 h-4" /> Email address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" className="input-field" required />
                            </div>
                            <button type="submit" disabled={isLoading || !email} className="btn-primary w-full py-3">
                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send reset link <ArrowRight className="w-4 h-4" /></>}
                            </button>
                            <p className="text-center text-dark-400 text-sm">
                                Remember your password? <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
                            </p>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;

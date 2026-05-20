import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) return toast.error('Passwords do not match');
        if (password.length < 8) return toast.error('Password must be at least 8 characters');
        setIsLoading(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed. Link may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">SnapLink AI</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Reset password</h1>
                    <p className="text-dark-400 mt-2">Choose a strong new password</p>
                </div>

                <div className="glass-card p-8">
                    {success ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Password reset!</h3>
                            <p className="text-dark-400 text-sm mb-4">Redirecting you to login...</p>
                            <Link to="/login" className="btn-primary">Go to Login</Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="input-label flex items-center gap-2"><Lock className="w-4 h-4" /> New Password</label>
                                <div className="relative">
                                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••••" className="input-field pr-10" required />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Confirm Password</label>
                                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                                    placeholder="••••••••••" className="input-field" required />
                                {confirm && password !== confirm && <p className="text-red-400 text-xs mt-1">Passwords do not match</p>}
                            </div>
                            <button type="submit" disabled={isLoading || !password || password !== confirm} className="btn-primary w-full py-3">
                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;

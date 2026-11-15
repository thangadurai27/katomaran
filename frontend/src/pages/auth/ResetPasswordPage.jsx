import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/auth/AuthLayout';

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
        <AuthLayout variant="reset">
            {success ? (
                <div className="flex flex-col items-center py-6 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50">
                        <CheckCircle className="h-9 w-9 text-emerald-500" />
                    </span>
                    <h3 className="mt-5 font-display text-[20px] font-bold text-[#17153A]">Password reset!</h3>
                    <p className="mt-2 text-[14px] text-[#6B6880]">Redirecting you to login…</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="reset-password" className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#3F3C56]">
                            <Lock className="h-3.5 w-3.5 text-[#8B5CF6]" /> New Password
                        </label>
                        <div className="relative">
                            <input
                                id="reset-password"
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password (8+ characters)"
                                className="input-field w-full rounded-xl border-[#E7E1F2] bg-white py-3 pr-11 shadow-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A97AC] transition-colors hover:text-[#6B6880]"
                                aria-label={showPw ? 'Hide password' : 'Show password'}
                            >
                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="reset-confirm" className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#3F3C56]">
                            <Lock className="h-3.5 w-3.5 text-[#8B5CF6]" /> Confirm Password
                        </label>
                        <input
                            id="reset-confirm"
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Re-enter your password"
                            className="input-field w-full rounded-xl border-[#E7E1F2] bg-white py-3 shadow-none"
                            required
                        />
                        {confirm && password !== confirm && (
                            <p className="mt-1 text-[12.5px] font-medium text-red-500">Passwords do not match</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !password || password !== confirm}
                        className="btn-primary h-[52px] w-full text-[15px]"
                    >
                        {isLoading ? (
                            <><Loader2 className="animate-spin" /> Resetting…</>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};

export default ResetPasswordPage;

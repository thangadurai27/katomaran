import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield, TrendingUp, Clock, Users, Plus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui';

const HomePage = () => {
    return (
        <div className="space-y-6 animate-in bg-background">
            <PageHeader title="Dashboard Overview" subtitle="Your link performance at a glance" badge="Live" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard icon={Plus} label="Total Links" value={0} iconBg="bg-primary/10" iconColor="text-primary" delay={0} />
                <StatCard icon={MousePointerClick} label="Total Clicks" value={0} change={0} iconBg="bg-primary/10" iconColor="text-primary" delay={0.08} />
                <StatCard icon={Shield} label="Active Links" value={0} iconBg="bg-secondary/10" iconColor="text-secondary" delay={0.16} />
                <StatCard icon={Clock} label="Expired Links" value={0} iconBg="bg-warning/10" iconColor="text-warning" delay={0.24} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="chart-container lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-base" style={{ color: 'var(--primary-text)' }}>Click Performance</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Last 30 days</p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={[]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="clicks" stroke="#6846F5" strokeWidth={2.5} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <div className="card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}>
                    <h3 className="font-semibold text-base" style={{ color: 'var(--primary-text)' }}>Recent Links</h3>
                    <a href="/dashboard/my-links" className="text-primary hover:text-secondary text-sm font-medium flex items-center gap-1 transition-colors">
                        View all
                    </a>
                </div>
                <div>
                    No links yet. Create your first short link to get started.
                    <a href="/dashboard/create-link" className="btn-primary text-sm mt-2">Create Link</a>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
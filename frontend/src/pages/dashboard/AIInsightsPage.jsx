import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Wand2, ShieldCheck, TrendingUp, MessageCircle, BookOpen, Megaphone, Loader2, Send, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import BottomSheet from '@/components/ui/BottomSheet';
import { useIsMobile } from '@/hooks/useMediaQuery';

const AIFeatureCard = ({ icon: Icon, title, desc, color, onClick, loading }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="card-hover p-6 text-left group w-full h-full"
    >
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
        {loading && (
            <div className="mt-3 flex items-center gap-2 text-indigo-600 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing…
            </div>
        )}
    </button>
);

const ResultBox = ({ title, data }) => {
    if (!data) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-6 border-indigo-100 bg-indigo-50/40"
        >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> {title}
            </h3>
            {typeof data === 'string' ? (
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{data}</p>
            ) : (
                <pre className="text-slate-700 text-sm overflow-auto max-h-96 bg-white border border-slate-200 rounded-xl p-4 font-mono">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </motion.div>
    );
};

const AIInsightsPage = () => {
    const [activeFeature, setActiveFeature] = useState(null);
    const [chatMessages, setChatMessages] = useState([
        {
            role: 'assistant',
            message:
                "Hi! I'm your SnapLink AI assistant. Ask me anything about your links, analytics, or marketing strategy!",
        },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [campaignInput, setCampaignInput] = useState({
        campaignName: '',
        industry: '',
        targetAudience: '',
        goals: '',
    });
    const [result, setResult] = useState(null);
    const [resultTitle, setResultTitle] = useState('');
    const [chatSheetOpen, setChatSheetOpen] = useState(false);
    const isMobile = useIsMobile();

    const insightsMutation = useMutation({
        mutationFn: () => api.post('/ai/analytics-insights'),
        onSuccess: (res) => {
            setResult(res.data.data.insights);
            setResultTitle('AI Analytics Insights');
            setActiveFeature(null);
        },
        onError: () => toast.error('Failed to generate insights'),
    });

    const checkUrlMutation = useMutation({
        mutationFn: (url) => api.post('/ai/check-url', { url }),
        onSuccess: (res) => {
            setResult(res.data.data.safety);
            setResultTitle('URL Safety Report');
            setActiveFeature(null);
        },
        onError: () => toast.error('Safety check failed'),
    });

    const summarizeMutation = useMutation({
        mutationFn: (url) => api.post('/ai/summarize-url', { url }),
        onSuccess: (res) => {
            setResult(res.data.data.summary);
            setResultTitle('Content Summary');
            setActiveFeature(null);
        },
        onError: () => toast.error('Summarization failed'),
    });

    const campaignMutation = useMutation({
        mutationFn: (data) => api.post('/ai/campaign-suggestions', data),
        onSuccess: (res) => {
            setResult(res.data.data.suggestions);
            setResultTitle('Campaign Strategy');
            setActiveFeature(null);
        },
        onError: () => toast.error('Campaign suggestions failed'),
    });

    const chatMutation = useMutation({
        mutationFn: (message) => api.post('/ai/chat', { message }),
        onSuccess: (res) => {
            setChatMessages((prev) => [...prev, { role: 'assistant', message: res.data.data.message }]);
        },
        onError: () => toast.error('Chat failed'),
    });

    const sendChat = () => {
        if (!chatInput.trim()) return;
        setChatMessages((prev) => [...prev, { role: 'user', message: chatInput }]);
        chatMutation.mutate(chatInput);
        setChatInput('');
    };

    return (
        <div className="space-y-6 animate-in">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-600" /> AI Insights
                    </span>
                }
                subtitle="Powered by Google Gemini AI — your intelligent link optimization assistant"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AIFeatureCard
                    icon={TrendingUp}
                    title="Analytics Insights"
                    desc="AI analyzes your traffic data and provides actionable optimization recommendations"
                    color="bg-indigo-600"
                    loading={insightsMutation.isPending}
                    onClick={() => insightsMutation.mutate()}
                />
                <AIFeatureCard
                    icon={ShieldCheck}
                    title="URL Safety Check"
                    desc="Detect phishing, malware, and spam in any URL before shortening"
                    color="bg-emerald-600"
                    loading={checkUrlMutation.isPending}
                    onClick={() => setActiveFeature('url-check')}
                />
                <AIFeatureCard
                    icon={BookOpen}
                    title="Content Summarizer"
                    desc="Fetch and summarize any webpage content, extract key insights and tags"
                    color="bg-purple-600"
                    loading={summarizeMutation.isPending}
                    onClick={() => setActiveFeature('summarize')}
                />
                <AIFeatureCard
                    icon={Megaphone}
                    title="Campaign Strategy"
                    desc="Get AI-generated campaign titles, UTM suggestions, and posting schedules"
                    color="bg-amber-600"
                    loading={campaignMutation.isPending}
                    onClick={() => setActiveFeature('campaign')}
                />
                <AIFeatureCard
                    icon={Wand2}
                    title="Slug Generator"
                    desc="Generate memorable, brand-friendly short URL aliases using AI"
                    color="bg-pink-600"
                    onClick={() => {
                        window.location.href = '/dashboard/create-link';
                    }}
                />
                <AIFeatureCard
                    icon={MessageCircle}
                    title="AI Chat Assistant"
                    desc="Ask questions about your analytics, get marketing tips, and strategy advice"
                    color="bg-cyan-600"
                    onClick={() => (isMobile ? setChatSheetOpen(true) : setActiveFeature('chat'))}
                />
            </div>

            {isMobile && (
                <button
                    type="button"
                    onClick={() => setChatSheetOpen(true)}
                    className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 lg:hidden touch-target-lg rounded-full bg-cyan-600 text-white shadow-brand-lg flex items-center justify-center"
                    aria-label="Open AI assistant"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            <AnimatePresence>
                {activeFeature === 'url-check' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">URL Safety Check</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com"
                                className="input-field flex-1"
                                onKeyDown={(e) => e.key === 'Enter' && checkUrlMutation.mutate(urlInput)}
                            />
                            <button
                                type="button"
                                onClick={() => checkUrlMutation.mutate(urlInput)}
                                disabled={!urlInput || checkUrlMutation.isPending}
                                className="btn-primary px-6"
                            >
                                {checkUrlMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeFeature === 'summarize' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Content Summarizer</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://article-url.com"
                                className="input-field flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => summarizeMutation.mutate(urlInput)}
                                disabled={!urlInput || summarizeMutation.isPending}
                                className="btn-primary px-6"
                            >
                                {summarizeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Summarize'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeFeature === 'campaign' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900">Campaign Strategy Generator</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Campaign Name</label>
                                <input
                                    value={campaignInput.campaignName}
                                    onChange={(e) => setCampaignInput((p) => ({ ...p, campaignName: e.target.value }))}
                                    placeholder="Summer Sale 2025"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Industry</label>
                                <input
                                    value={campaignInput.industry}
                                    onChange={(e) => setCampaignInput((p) => ({ ...p, industry: e.target.value }))}
                                    placeholder="E-commerce, SaaS, etc."
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Target Audience</label>
                                <input
                                    value={campaignInput.targetAudience}
                                    onChange={(e) => setCampaignInput((p) => ({ ...p, targetAudience: e.target.value }))}
                                    placeholder="Young professionals, 25-35"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Goals</label>
                                <input
                                    value={campaignInput.goals}
                                    onChange={(e) => setCampaignInput((p) => ({ ...p, goals: e.target.value }))}
                                    placeholder="Increase conversions"
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => campaignMutation.mutate(campaignInput)}
                            disabled={campaignMutation.isPending}
                            className="btn-primary"
                        >
                            {campaignMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                                </>
                            ) : (
                                'Generate Campaign Strategy'
                            )}
                        </button>
                    </motion.div>
                )}

                {activeFeature === 'chat' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                                <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-semibold text-sm">SnapLink AI Assistant</p>
                                <p className="text-slate-500 text-xs">Powered by Gemini</p>
                            </div>
                        </div>
                        <div className="h-72 overflow-y-auto p-6 space-y-4 bg-white">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                            {chatMutation.isPending && (
                                <div className="flex justify-start">
                                    <div className="chat-bubble-assistant px-4 py-2.5 rounded-2xl flex items-center gap-2">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 flex gap-3 bg-slate-50/50">
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                                placeholder="Ask anything about your links…"
                                className="input-field flex-1"
                            />
                            <button
                                type="button"
                                onClick={sendChat}
                                disabled={!chatInput.trim() || chatMutation.isPending}
                                className="btn-primary px-4"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomSheet open={chatSheetOpen} onClose={() => setChatSheetOpen(false)} title="AI Assistant">
                <div className="h-[50dvh] overflow-y-auto space-y-4 -mx-1 px-1">
                    {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-2">
                    <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                        placeholder="Ask about your links…"
                        className="input-field flex-1"
                    />
                    <button type="button" onClick={sendChat} disabled={!chatInput.trim() || chatMutation.isPending} className="btn-primary px-4 touch-target">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </BottomSheet>

            <ResultBox title={resultTitle} data={result} />
        </div>
    );
};

export default AIInsightsPage;

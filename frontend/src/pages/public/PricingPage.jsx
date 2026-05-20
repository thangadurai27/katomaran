import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
    {
        q: "Do I need a credit card for the free plan?",
        a: "No! The free plan is completely free forever. You don't need to enter any payment details to get started."
    },
    {
        q: "What counts as a 'link click'?",
        a: "Every time a user successfully clicks your short link and is redirected to the destination URL, it counts as one click. Bot traffic filtered by our systems does not count toward your quota."
    },
    {
        q: "Can I use my own custom domain?",
        a: "Yes! Custom domains (e.g., link.yourbrand.com) are available on the Pro and Enterprise plans."
    },
    {
        q: "How does the AI Insights feature work?",
        a: "We pass your anonymized analytics data securely to Google Gemini AI, which cross-references it with global engagement patterns to suggest optimal posting times and audience demographics."
    }
];

const PRICING_PLANS = [
    {
        name: 'Free', price: '$0', period: '/forever', desc: 'Perfect for personal projects',
        features: ['500 active links', '1,000 clicks/month', 'Basic analytics tracking', 'Standard QR codes', 'Community support'],
        cta: 'Start Free',
        highlight: false
    },
    {
        name: 'Pro', price: '$12', period: '/month', desc: 'For growing businesses',
        features: ['Unlimited active links', '100,000 clicks/month', 'Advanced AI Insights', 'Custom domains & aliases', 'Password-protected links', 'Team members (up to 5)', 'Priority email support'],
        cta: 'Start 14-Day Free Trial',
        highlight: true
    },
    {
        name: 'Enterprise', price: 'Custom', period: '', desc: 'For high-volume operations',
        features: ['Unlimited everything', 'Custom rate limits & SLAs', 'Dedicated Account Manager', 'SSO / SAML Security', 'White-labeling options', 'Premium API Access', '1-on-1 Onboarding'],
        cta: 'Contact Sales',
        highlight: false
    }
];

const PricingPage = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand-900/20 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Simple, transparent pricing
                        </h1>
                        <p className="text-dark-400 max-w-2xl mx-auto text-lg mb-8">
                            Choose the plan that best fits your needs. Upgrade, downgrade, or cancel at any time.
                        </p>

                        <div className="inline-flex items-center p-1 bg-dark-800/80 backdrop-blur-md rounded-xl border border-dark-700/50">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-brand-600 text-white shadow-glow' : 'text-dark-400 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-brand-600 text-white shadow-glow' : 'text-dark-400 hover:text-white'}`}
                            >
                                Annually <span className="badge badge-success !py-0 !px-1.5 !text-[10px]">Save 20%</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    {PRICING_PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass-card p-8 flex flex-col relative ${plan.highlight ? 'border-brand-500 shadow-glow bg-brand-900/10 scale-105 z-10' : ''}`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="badge bg-brand-500 text-white font-bold px-4 py-1.5 shadow-glow">Most Popular</span>
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-dark-400 text-sm mb-6 h-10">{plan.desc}</p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black text-white">
                                    {plan.price === 'Custom' ? 'Custom' : billingCycle === 'yearly' && plan.price !== '$0' ? `$${parseInt(plan.price.replace('$', '')) * 0.8}` : plan.price}
                                </span>
                                {plan.period && <span className="text-dark-400 text-sm">{billingCycle === 'yearly' && plan.price !== '$0' ? '/month, billed yearly' : plan.period}</span>}
                            </div>

                            <Link to="/signup" className={`py-3 rounded-xl font-bold text-center mb-8 transition-all ${plan.highlight ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow hover:shadow-glow-lg' : 'bg-dark-700 hover:bg-dark-600 text-white'}`}>
                                {plan.cta}
                            </Link>

                            <div className="space-y-4 flex-1">
                                <p className="text-sm font-semibold text-white mb-2">What's included:</p>
                                {plan.features.map(f => (
                                    <div key={f} className="flex items-start gap-3">
                                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-brand-400' : 'text-emerald-400'}`} />
                                        <span className="text-dark-300 text-sm">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQs */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {FAQS.map((faq, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 flex gap-4">
                                <HelpCircle className="w-6 h-6 text-brand-400 flex-shrink-0" />
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-2">{faq.q}</h4>
                                    <p className="text-dark-300 leading-relaxed text-sm">{faq.a}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;

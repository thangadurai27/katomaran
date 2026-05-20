import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { QrCode, Download, Palette, Loader2, Copy } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const QRCenterPage = () => {
    const [url, setUrl] = useState('');
    const [options, setOptions] = useState({ foreground: '#000000', background: '#ffffff', width: 300, margin: 2 });
    const [qrResult, setQrResult] = useState(null);

    const { data: userQRs, isLoading } = useQuery({
        queryKey: ['qr-codes'],
        queryFn: async () => {
            const { data } = await api.get('/qr');
            return data.data.qrCodes;
        }
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/qr/generate', { url, options });
            return data.data;
        },
        onSuccess: (data) => {
            setQrResult(data.qrCode);
            toast.success('QR code generated!');
        },
        onError: () => toast.error('Failed to generate QR')
    });

    const downloadQR = (dataUrl, filename = 'qrcode.png') => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
        toast.success('QR code downloaded!');
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h1 className="page-title flex items-center gap-2"><QrCode className="w-7 h-7 text-brand-400" /> QR Center</h1>
                <p className="page-subtitle">Generate custom QR codes for any URL</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generator */}
                <div className="glass-card p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900">Generate QR Code</h2>

                    <div>
                        <label className="input-label">URL</label>
                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-url.com" className="input-field" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label flex items-center gap-2"><Palette className="w-4 h-4" /> Foreground</label>
                            <div className="flex gap-2">
                                <input type="color" value={options.foreground} onChange={e => setOptions(p => ({ ...p, foreground: e.target.value }))}
                                    className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer bg-slate-50" />
                                <input value={options.foreground} onChange={e => setOptions(p => ({ ...p, foreground: e.target.value }))}
                                    className="input-field font-mono uppercase" />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Background</label>
                            <div className="flex gap-2">
                                <input type="color" value={options.background} onChange={e => setOptions(p => ({ ...p, background: e.target.value }))}
                                    className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer bg-slate-50" />
                                <input value={options.background} onChange={e => setOptions(p => ({ ...p, background: e.target.value }))}
                                    className="input-field font-mono uppercase" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Size: {options.width}px</label>
                        <input type="range" min="150" max="600" step="50" value={options.width}
                            onChange={e => setOptions(p => ({ ...p, width: parseInt(e.target.value) }))}
                            className="w-full" />
                    </div>

                    <button onClick={() => generateMutation.mutate()} disabled={!url || generateMutation.isPending}
                        className="btn-primary w-full">
                        {generateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><QrCode className="w-4 h-4" /> Generate QR Code</>}
                    </button>
                </div>

                {/* Preview */}
                <div className="glass-card p-6 flex flex-col items-center justify-center">
                    {qrResult ? (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
                            <div className="p-4 bg-white rounded-2xl shadow-glow">
                                <img src={qrResult} alt="QR Code" style={{ width: Math.min(options.width, 250), height: Math.min(options.width, 250) }} />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => downloadQR(qrResult)} className="btn-primary">
                                    <Download className="w-4 h-4" /> Download PNG
                                </button>
                                <button onClick={() => { navigator.clipboard.writeText(qrResult); toast.success('QR data URL copied!'); }}
                                    className="btn-secondary">
                                    <Copy className="w-4 h-4" /> Copy URL
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center text-slate-500">
                            <QrCode className="w-20 h-20 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium text-slate-600">QR Preview</p>
                            <p className="text-sm">Enter a URL and click generate</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Existing QR Codes */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Your QR Codes</h3>
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                        {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
                    </div>
                ) : userQRs?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                        {userQRs.map((link) => link.qrCode?.url && (
                            <motion.div key={link._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="glass-card-hover p-3 flex flex-col items-center gap-3 cursor-pointer group"
                                onClick={() => downloadQR(link.qrCode.url, `qr-${link.shortCode}.png`)}>
                                <div className="bg-white p-2 rounded-xl w-full">
                                    <img src={link.qrCode.url} alt="QR" className="w-full aspect-square object-contain" />
                                </div>
                                <p className="text-xs text-slate-600 font-mono truncate w-full text-center">/{link.shortCode}</p>
                                <div className="flex items-center gap-1 text-slate-500 text-xs group-hover:text-brand-400 transition-colors">
                                    <Download className="w-3 h-3" /> Download
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <QrCode className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-600">No QR codes yet. Create a link to auto-generate one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCenterPage;

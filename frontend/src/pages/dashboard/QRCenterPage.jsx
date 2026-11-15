import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { QrCode, Loader2, Download, Copy } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const QRCenterPage = () => {
    const [url, setUrl] = useState('');
    const [qrResult, setQrResult] = useState(null);
    const [myQRs, setMyQRs] = useState([]);
    const [qrLoadingState, setQrLoadingState] = useState(false);

    const generateMutation = useMutation({
        mutationFn: () => api.post('/qr/generate', { url }),
        onSuccess: (res) => {
            setQrResult(res.data);
            setQrLoadingState(false);
            setMyQRs(prev => [res.data.qrCode, ...prev].slice(0, 10));
        },
        onError: () => toast.error('Failed to generate QR code'),
    });

    const downloadQR = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    };

    const copyQrUrl = (url) => {
        navigator.clipboard.writeText(url);
        toast.success('QR data URL copied!');
    };

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/qr/${id}`),
        onSuccess: (_res, variables) => {
            setMyQRs(prev => prev.filter(qr => qr._id !== variables));
            toast.success('QR code deleted!');
        },
        onError: () => toast.error('Failed to delete QR code'),
    });

    return (
        <div className="space-y-6 bg-background">
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">QR Code Generator</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL to shorten"
                        className="flex-1 input-field"
                        onKeyDown={(e) => e.key === 'Enter' && generateMutation.mutate()}
                    />
                    <button
                        onClick={() => generateMutation.mutate()}
                        disabled={!url || qrLoadingState}
                        className="btn-primary"
                    >
                        {generateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Generate'
                        )}
                    </button>
                </div>
            </div>

            {/* QR Preview */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">QR Preview</h3>
                {qrResult ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-lg p-6 flex flex-col items-center justify-center"
                    >
                        <img src={qrResult.qrCode.url} alt="QR" className="w-64 h-64 mb-4" />
                        <p className="text-slate-600 font-mono text-center">/{qrResult.shortCode}</p>
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => copyQrUrl(qrResult.qrCode.url)}
                                className="btn-secondary px-4"
                            >
                                <Copy className="w-3.5 h-3.5" /> Copy URL
                            </button>
                            <button
                                onClick={() => downloadQR(qrResult.qrCode.url, `qr-${qrResult.shortCode}.png`)}
                                className="btn-secondary px-4"
                            >
                                <Download className="w-3.5 h-3.5" /> Download PNG
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-12 text-center">
                        <QrCode className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-600">Enter a URL and click generate to see preview</p>
                    </div>
                )}
            </div>

            {/* Existing QR Codes */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900">Your QR Codes</h3>
                {myQRs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {myQRs.map((qr) => (
                            <div
                                key={qr._id}
                                className="glass-card rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer"
                                onClick={() => window.open(qr.qrCode.url, '_blank')}
                            >
                                <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center mb-2">
                                    <QrCode className="w-10 h-10" />
                                </div>
                                <p className="text-xs text-slate-600 font-mono">/{qr.shortCode}</p>
                            </div>
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
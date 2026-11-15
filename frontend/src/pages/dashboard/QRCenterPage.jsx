import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { QrCode, Loader2, Download, Copy, Link2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { SHORT_URL_BASE } from '@/config/env';

const QRCenterPage = () => {
    const queryClient = useQueryClient();
    const [url, setUrl] = useState('');
    const [selectedLinkId, setSelectedLinkId] = useState('');
    const [foreground, setForeground] = useState('#000000');
    const [background, setBackground] = useState('#ffffff');
    const [size, setSize] = useState(300);
    const [qrResult, setQrResult] = useState(null);

    const { data: links = [] } = useQuery({
        queryKey: ['links-for-qr'],
        queryFn: async () => {
            const { data } = await api.get('/links', { params: { limit: 100 } });
            return data.data || [];
        },
    });

    const { data: myQRs = [], refetch: refetchQRs } = useQuery({
        queryKey: ['qr-codes'],
        queryFn: async () => {
            const { data } = await api.get('/qr');
            return data.data.qrCodes || [];
        },
    });

    const generateMutation = useMutation({
        mutationFn: () =>
            api.post('/qr/generate', {
                url: url || undefined,
                linkId: selectedLinkId || undefined,
                options: { foreground, background, width: size },
            }),
        onSuccess: (res) => {
            const result = res.data.data;
            setQrResult(result);
            refetchQRs();
            toast.success('QR code generated');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to generate QR code'),
    });

    const downloadQR = (dataUrl, filename) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-[24px] font-extrabold tracking-tight text-[var(--text-primary)] sm:text-[28px]">
                    QR Center
                </h1>
                <p className="mt-1.5 text-[14px] text-[var(--text-secondary)]">
                    Generate and manage QR codes for your links.
                </p>
            </div>

            <div className="card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Generate QR Code</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Manual URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="input-field w-full"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Or select a link</label>
                        <select
                            value={selectedLinkId}
                            onChange={(e) => setSelectedLinkId(e.target.value)}
                            className="input-field w-full"
                        >
                            <option value="">None</option>
                            {links.map((link) => (
                                <option key={link._id} value={link._id}>
                                    {link.title || link.shortCode} — {SHORT_URL_BASE}{link.shortCode}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Foreground</label>
                        <input type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-[var(--border)]" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Background</label>
                        <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-[var(--border)]" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Size</label>
                        <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="input-field w-full">
                            <option value={200}>200px</option>
                            <option value={300}>300px</option>
                            <option value={500}>500px</option>
                        </select>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => generateMutation.mutate()}
                    disabled={(!url && !selectedLinkId) || generateMutation.isPending}
                    className="btn-primary gap-2 px-5 py-2.5 text-sm"
                >
                    {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                    Generate
                </button>
            </div>

            {qrResult && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card flex flex-col items-center p-6">
                    <img src={qrResult.qrCode} alt="QR code" className="mb-4 h-64 w-64 rounded-lg border border-[var(--border)] bg-white p-2" />
                    <p className="mb-4 break-all text-xs font-mono text-[var(--text-secondary)]">{qrResult.url}</p>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => copyText(qrResult.url)} className="btn-secondary gap-1.5 px-4 py-2 text-xs">
                            <Copy className="h-3.5 w-3.5" /> Copy URL
                        </button>
                        <button type="button" onClick={() => downloadQR(qrResult.qrCode, 'qr-code.png')} className="btn-secondary gap-1.5 px-4 py-2 text-xs">
                            <Download className="h-3.5 w-3.5" /> Download PNG
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="card p-6">
                <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Your QR Codes</h3>
                {myQRs.length === 0 ? (
                    <div className="py-10 text-center text-sm text-[var(--text-secondary)]">
                        No QR codes yet. Generate one above.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {myQRs.map((link) => (
                            <div key={link._id} className="card p-3 text-center">
                                <img src={link.qrCode.url} alt="QR" className="mx-auto mb-2 h-24 w-24 rounded bg-white p-1" />
                                <p className="truncate text-xs font-mono text-[var(--text-secondary)]">/{link.shortCode}</p>
                                <button
                                    type="button"
                                    onClick={() => downloadQR(link.qrCode.url, `qr-${link.shortCode}.png`)}
                                    className="mt-2 btn-ghost text-xs"
                                >
                                    <Download className="h-3.5 w-3.5" /> Download
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCenterPage;
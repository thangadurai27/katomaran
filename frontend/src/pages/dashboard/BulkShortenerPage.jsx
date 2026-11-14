import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Layers, Loader2, CheckCircle, XCircle, FileText, File, AlertCircle, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const BulkShortenerPage = () => {
    const [files, setFiles] = useState([]);
    const [importing, setImporting] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['bulk-stats'],
        queryFn: async () => {
            const { data } = await api.get('/bulk/stats');
            return data.data;
        }
    });

    const importMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await api.post('/bulk/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data.data;
        },
        onSuccess: (data) => {
            toast.success(`${data.created.length} links created, ${data.errors.length} errors`);
            queryClient.invalidateQueries(['links']);
        },
        onError: () => toast.error('Bulk import failed')
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }
        setFiles(prev => [...prev, file]);
    };

    return (
        <div className="space-y-6 bg-background">
            <div className="flex items-center justify-between">
                <h1 className="page-title flex items-center gap-2">
                    <Layers className="w-7 h-7 text-primary" /> Bulk Shortener
                </h1>
                <p className="page-subtitle">Shorten multiple URLs at once</p>
            </div>

            {/* Import Section */}
            <div className="glass-card rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">CSV Import</h2>
                <p className="text-sm text-slate-500 mb-4">
                    CSV must have a <code className="text-primary">url</code> column.
                    Maximum 500 URLs per upload.
                </p>

                <div className="border-2 border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <div className="w-20 h-20 rounded-2xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Drag & Drop CSV File</h3>
                    <p className="text-sm text-slate-500">or <a href="#" className="text-primary underline">browse</a></p>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(e)}
                        className="hidden"
                    />
                    <div className="mt-3 text-sm text-slate-500">or browse</div>
                </div>
            </div>

            {/* Manual Entry */}
            {importing ? (
                <div className="glass-card rounded-lg p-6">
                    <p className="text-sm text-primary">Importing...</p>
                </div>
            ) : (
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Manual URL Entry</h2>
                    <p className="text-sm text-slate-500">
                        Enter URLs manually (maximum 50 at a time)
                    </p>
                </div>
            )}

            {/* Import Results Summary */}
            {data && data.total && (
                <div className="card rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Previous import</span>
                        <span className="font-medium">{data.total} links created</span>
                    </div>
                </div>
            )}

            {/* Add More Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CSV Upload Card */}
                <div className="glass-card rounded-lg p-6 h-full">
                    <h3 className="text-sm font-medium text-slate-500 mb-3">CSV Upload</h3>
                    <p className="text-xs text-slate-400 mb-4">
                        Upload a CSV file with URLs to shorten in bulk.
                    </p>
                    <div className="border-2 border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors">
                        <Layers className="w-10 h-10 text-slate-400" />
                        <h3 className="text-xl font-bold text-primary mb-2">500 URLs max</h3>
                        <p className="text-sm text-slate-500">per upload</p>
                    </div>
                </div>

                {/* Manual Entry Card */}
                <div className="glass-card rounded-lg p-6 h-full">
                    <h3 className="text-sm font-medium text-slate-500 mb-3">Manual Entry</h3>
                    <p className="text-xs text-slate-400 mb-4">
                        Enter up to 50 URLs manually.
                    </p>
                    <input
                        type="text"
                        placeholder="Enter one URL per line"
                        className="w-full input-field rounded-lg p-3 focus:outline-none focus:border-primary mb-3"
                        maxLength="50"
                    />
                    <button
                        className="btn-primary w-full py-3 text-sm"
                        disabled={importing}
                    >
                        {importing ? 'Importing...' : 'Add URLs'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkShortenerPage;
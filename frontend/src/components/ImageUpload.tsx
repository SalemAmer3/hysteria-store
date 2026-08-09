import React, { useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Image as ImageIcon, UploadCloud, AlertCircle, CheckCircle } from 'lucide-react';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    label,
    className = ''
}) => {
    const { t } = useLanguage();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError(t('errorOccurred') + ': File size exceeds 5MB limit');
            setSuccess(false);
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await api.uploads.image(file);
            if (res.success && res.data.url) {
                onChange(res.data.url);
                setSuccess(true);
            } else {
                setError('Upload failed');
            }
        } catch (err: any) {
            setError(err.message || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl ${className}`}>
            {label && <label className="block text-xs font-extrabold text-zinc-400 capitalize tracking-wider mb-2">{label}</label>}

            <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Preview image */}
                <div className="w-24 h-24 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                    {value ? (
                        <>
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ImageIcon className="text-white" size={18} />
                            </div>
                        </>
                    ) : (
                        <ImageIcon className="text-zinc-700" size={24} />
                    )}
                </div>

                {/* Upload Action */}
                <div className="flex-grow w-full relative">
                    <div className="flex flex-col gap-1.5 justify-center">

                        {/* Input Label Box */}
                        <label className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 hover:border-gold-400/40 text-xs font-bold justify-center cursor-pointer transition-all">
                            <UploadCloud size={16} />
                            <span>{uploading ? t('uploading') : t('uploadImage')}</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </label>

                        {/* Manual Url input */}
                        <input
                            type="text"
                            placeholder="Or paste direct image URL here..."
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full mt-2 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-700"
                        />

                    </div>

                    {/* Feedback logs */}
                    {error && (
                        <div className="mt-2 text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                            <CheckCircle size={14} />
                            <span>Uploaded successfully!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

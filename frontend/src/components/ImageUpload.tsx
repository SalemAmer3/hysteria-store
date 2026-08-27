import React, { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Image as ImageIcon, UploadCloud, AlertCircle, CheckCircle, X, ClipboardPaste } from 'lucide-react';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, className = '' }) => {
    const { t } = useLanguage();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // ── Core upload function (shared by browse / drag / paste) ──
    const uploadFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file (PNG, JPG, WEBP…)');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError('File size exceeds 20MB limit');
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
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError('Upload failed');
            }
        } catch (err: any) {
            setError(err.message || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    }, [onChange]);

    // ── Extract image from ClipboardEvent items ──
    const extractImageFromClipboard = useCallback((clipboardData: DataTransfer | null): File | null => {
        if (!clipboardData) return null;
        const items = clipboardData.items;
        if (!items) return null;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                return item.getAsFile();
            }
        }
        return null;
    }, []);

    // ── Global paste listener on document ──
    // Fires whenever the user presses Ctrl+V / Cmd+V anywhere on the page
    // while this component is focused OR when there's no other input focused.
    useEffect(() => {
        const handleGlobalPaste = (e: ClipboardEvent) => {
            // Only intercept if the drop-zone is focused OR no text input is active
            const active = document.activeElement;
            const isTextInput =
                active instanceof HTMLInputElement ||
                active instanceof HTMLTextAreaElement ||
                (active instanceof HTMLElement && active.isContentEditable);

            // Allow paste only if our zone is focused OR nothing text-editable is active
            const ourZoneFocused = dropZoneRef.current?.contains(active as Node) || focused;

            if (!ourZoneFocused && isTextInput) return;
            if (!ourZoneFocused && !isTextInput) return; // don't steal global paste

            // Only proceed if our zone is focused
            if (!ourZoneFocused) return;

            const file = extractImageFromClipboard(e.clipboardData);
            if (file) {
                e.preventDefault();
                uploadFile(file);
            }
        };

        document.addEventListener('paste', handleGlobalPaste);
        return () => document.removeEventListener('paste', handleGlobalPaste);
    }, [focused, extractImageFromClipboard, uploadFile]);

    // ── File input browse ──
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        e.target.value = '';
    };

    // ── Drag & Drop ──
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
    };

    // ── React onPaste (fires when the div itself is focused and user pastes) ──
    const handlePaste = (e: React.ClipboardEvent) => {
        const file = extractImageFromClipboard(e.clipboardData);
        if (file) {
            e.preventDefault();
            uploadFile(file);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    {label}
                </label>
            )}

            {/* Drop zone */}
            <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onPaste={handlePaste}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                tabIndex={0}
                className={`relative rounded-2xl border-2 border-dashed transition-all outline-none cursor-pointer
                    ${dragging
                        ? 'border-gold-400 bg-gold-400/5 scale-[1.01]'
                        : focused
                            ? 'border-gold-400/50 bg-zinc-900/80'
                            : 'border-zinc-700 bg-zinc-900/60 hover:border-zinc-500'
                    }`}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                <div className="flex flex-col md:flex-row gap-4 items-center p-4">
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                        {value ? (
                            <>
                                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); onChange(''); }}
                                    className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                >
                                    <X size={10} />
                                </button>
                            </>
                        ) : (
                            <ImageIcon className="text-zinc-700" size={22} />
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="flex-1 text-center md:text-left space-y-1 pointer-events-none">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-300 text-xs font-bold">
                            <UploadCloud size={15} className="text-gold-400" />
                            <span>{uploading ? t('uploading') : t('uploadImage')}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">
                            Drag & drop · Click to browse
                        </p>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1 justify-center md:justify-start">
                            <ClipboardPaste size={10} className="text-gold-400/70" />
                            <span>
                                {focused
                                    ? <span className="text-gold-400 font-bold">Ready for paste — press Ctrl+V / Cmd+V</span>
                                    : 'Click here then Ctrl+V / Cmd+V to paste'}
                            </span>
                        </p>
                        <p className="text-[10px] text-zinc-700">PNG, JPG, WEBP, GIF · Max 20MB</p>
                    </div>
                </div>

                {/* Loading overlay */}
                {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* URL input */}
            <input
                type="text"
                placeholder="Or paste direct image URL here…"
                value={value || ''}
                onChange={e => { onChange(e.target.value); setError(null); }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600"
                onClick={e => e.stopPropagation()}
            />

            {/* Feedback */}
            {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                    <AlertCircle size={13} /> <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle size={13} /> <span>Uploaded successfully!</span>
                </div>
            )}
        </div>
    );
};

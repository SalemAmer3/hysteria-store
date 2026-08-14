import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ImageUpload } from '../../components/ImageUpload';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2, X, Sparkles, Search } from 'lucide-react';

const emptyForm = { name: '', description: '', image_url: '' };

export const AdminBrands: React.FC = () => {
    const { t, direction } = useLanguage();
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try { const res = await api.brands.listAdmin(1, 100); setBrands(res.data); }
        catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openCreate = () => { setEditItem(null); setForm({ ...emptyForm }); setError(null); setShowForm(true); };
    const openEdit = (item: any) => {
        setEditItem(item); setError(null);
        setForm({ name: item.name || '', description: item.description || '', image_url: item.image_url || '' });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try { await api.brands.delete(id); loadData(); }
        catch (err: any) { alert(err.message); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        const payload = { name: form.name, description: form.description || null, image_url: form.image_url || null };
        try {
            if (editItem) await api.brands.update(editItem.id, payload);
            else await api.brands.create(payload);
            setShowForm(false); loadData();
        } catch (err: any) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <AdminLayout>
            <div className="space-y-6" dir={direction}>
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 flex items-center gap-2"><Sparkles size={22} className="text-gold-400" /> {t('brandsManage')}</h1>
                    <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer"><Plus size={16} /> {t('addNew')}</button>
                </div>
                {error && <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs rounded-xl">{error}</div>}

                {/* Search bar */}
                <div className="relative">
                    <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
                    <input
                        type="text"
                        placeholder={direction === 'rtl' ? 'ابحث عن ماركة...' : 'Search brands...'}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`w-full bg-zinc-900/60 border border-zinc-800 text-zinc-200 placeholder-zinc-600 rounded-xl py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors ${direction === 'rtl' ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer ${direction === 'rtl' ? 'left-3' : 'right-3'}`}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-zinc-950 border border-zinc-900 rounded-2xl shimmer" />)
                        : brands.filter(b => b.name?.toLowerCase().includes(search.toLowerCase())).map(brand => (
                            <div key={brand.id} className="group bg-[#0d0d11]/50 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-4 text-center transition-all">
                                <div className="w-24 h-16 flex items-center justify-center">
                                    {brand.image_url
                                        ? <img src={brand.image_url} alt={brand.name} className="max-h-full max-w-full object-contain" />
                                        : <span className="text-lg font-extrabold text-zinc-400 font-sans">{brand.name?.charAt(0)}</span>}
                                </div>
                                <div className="flex-1">
                                    <p className="text-zinc-200 font-bold text-sm">{brand.name}</p>
                                    {brand.description && <p className="text-zinc-600 text-xs mt-1 line-clamp-2">{brand.description}</p>}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(brand)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 cursor-pointer"><Pencil size={14} /></button>
                                    <button onClick={() => handleDelete(brand.id)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 cursor-pointer"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
                        <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 overflow-y-auto p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                                <h2 className="text-lg font-extrabold text-zinc-100">{editItem ? t('edit') : t('addNew')} {t('brandsManage')}</h2>
                                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X size={22} /></button>
                            </div>
                            {error && <div className="p-3 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs rounded-xl">{error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AdminField label={t('prodNameEn')} required><input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="admin-input" /></AdminField>
                                <AdminField label={t('descriptionItem')}><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-input resize-none" /></AdminField>
                                <ImageUpload label="Brand Logo / Image" value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} />
                                <div className="flex gap-3 pt-4 border-t border-zinc-900">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-bold cursor-pointer">{t('cancel')}</button>
                                    <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-gold-400 text-black text-xs font-extrabold cursor-pointer disabled:opacity-50">{saving ? '...' : t('save')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

const AdminField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] text-zinc-500 uppercase font-extrabold tracking-widest">{label}{required && <span className="text-rose-400 ml-0.5">*</span>}</label>
        {children}
    </div>
);

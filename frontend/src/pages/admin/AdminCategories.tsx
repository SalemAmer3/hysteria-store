import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ImageUpload } from '../../components/ImageUpload';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2, X, FolderOpen, Search } from 'lucide-react';

const emptyForm = {
    name: '', description: '', parent_id: '', image_url: '', order: 0,
    arabic: '', hebrew: '', is_active: true,
};

export const AdminCategories: React.FC = () => {
    const { t, direction } = useLanguage();
    const [categories, setCategories] = useState<any[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [res, allRes] = await Promise.all([
                api.categories.listAdmin(page, 20),
                api.categories.listPublic(),
            ]);
            setCategories(res.data);
            setTotalPages(res.pagination?.totalPages || 1);
            setAllCategories(allRes.data);
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }, [page]);

    useEffect(() => { loadData(); }, [loadData]);

    const openCreate = () => { setEditItem(null); setForm({ ...emptyForm }); setError(null); setShowForm(true); };
    const openEdit = (item: any) => {
        setEditItem(item);
        setForm({
            name: item.name || '', description: item.description || '',
            parent_id: item.parent_id || '', image_url: item.image_url || '',
            order: item.order || 0, arabic: item.arabic || '', hebrew: item.hebrew || '',
            is_active: item.is_active ?? true,
        });
        setError(null); setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try { await api.categories.delete(id); loadData(); }
        catch (err: any) { alert(err.message); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        const payload = {
            name: form.name, description: form.description || null,
            parent_id: form.parent_id || null, image_url: form.image_url || null,
            order: Number(form.order), arabic: form.arabic || null,
            hebrew: form.hebrew || null, is_active: form.is_active,
        };
        try {
            if (editItem) await api.categories.update(editItem.id, payload);
            else await api.categories.create(payload);
            setShowForm(false); loadData();
        } catch (err: any) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <AdminLayout>
            <div className="space-y-6" dir={direction}>
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
                        <FolderOpen size={22} className="text-gold-400" /> {t('categoriesManage')}
                    </h1>
                    <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer">
                        <Plus size={16} /> {t('addNew')}
                    </button>
                </div>

                {error && <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs rounded-xl">{error}</div>}

                {/* Search bar */}
                <div className="relative">
                    <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
                    <input
                        type="text"
                        placeholder={direction === 'rtl' ? 'ابحث عن قسم...' : 'Search categories...'}
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

                <div className="space-y-2">
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-zinc-950 border border-zinc-900 rounded-xl shimmer" />)
                        : categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.arabic?.includes(search)).map(cat => (
                            <div key={cat.id} className="bg-[#0d0d11]/50 border border-zinc-900 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-800 transition-colors">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800">
                                    {cat.image_url
                                        ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                        : <FolderOpen size={18} className="text-zinc-700 m-auto mt-3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-zinc-200 font-semibold text-sm truncate">{cat.name}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {cat.parent_id && <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850">Sub-category</span>}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${cat.is_active ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-zinc-600 bg-zinc-900 border-zinc-800'}`}>
                                            {cat.is_active ? t('active') : t('inactive')}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850">Order: {cat.order}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(cat)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 cursor-pointer"><Pencil size={15} /></button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 cursor-pointer"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center gap-4 pt-4 border-t border-zinc-900">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 text-xs font-bold text-zinc-300 disabled:opacity-30 cursor-pointer">{direction === 'rtl' ? 'السابق' : 'Previous'}</button>
                        <span className="text-xs text-zinc-500 font-semibold self-center">{page} / {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 text-xs font-bold text-zinc-300 disabled:opacity-30 cursor-pointer">{direction === 'rtl' ? 'التالي' : 'Next'}</button>
                    </div>
                )}

                {/* Form Slide-Over */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
                        <div className="w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-900 overflow-y-auto p-8 space-y-6 relative">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                                <h2 className="text-lg font-extrabold text-zinc-100">{editItem ? t('edit') : t('addNew')} {t('categoriesManage')}</h2>
                                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X size={22} /></button>
                            </div>
                            {error && <div className="p-3 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs rounded-xl">{error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AdminField label={t('prodNameEn')} required><input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="admin-input" /></AdminField>
                                <AdminField label={t('prodNameAr')}><input type="text" value={form.arabic} onChange={e => setForm(f => ({ ...f, arabic: e.target.value }))} className="admin-input" dir="rtl" /></AdminField>
                                <AdminField label={t('prodNameHe')}><input type="text" value={form.hebrew} onChange={e => setForm(f => ({ ...f, hebrew: e.target.value }))} className="admin-input" dir="rtl" /></AdminField>
                                <AdminField label={t('descriptionItem')}><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-input resize-none" /></AdminField>
                                <AdminField label={t('parentCategory')}>
                                    <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className="admin-input">
                                        <option value="">— None (Top Level) —</option>
                                        {allCategories.filter(c => c.id !== editItem?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </AdminField>
                                <div className="grid grid-cols-2 gap-3">
                                    <AdminField label={t('orderWeight')}><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className="admin-input" /></AdminField>
                                    <AdminField label={t('active')}>
                                        <select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} className="admin-input">
                                            <option value="true">{t('active')}</option>
                                            <option value="false">{t('inactive')}</option>
                                        </select>
                                    </AdminField>
                                </div>
                                <ImageUpload label="Category Image" value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} />
                                <div className="flex gap-3 pt-4 border-t border-zinc-900">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-bold cursor-pointer">{t('cancel')}</button>
                                    <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-gold-400 hover:bg-gold-500 text-black text-xs font-extrabold cursor-pointer disabled:opacity-50">{saving ? '...' : t('save')}</button>
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
        <label className="block text-[10px] text-zinc-500 uppercase font-extrabold tracking-widest">
            {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

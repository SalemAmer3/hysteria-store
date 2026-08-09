import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ImageUpload } from '../../components/ImageUpload';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2, X, Megaphone } from 'lucide-react';

const emptyForm = { description: '', image_url: '', link: '', arabic: '', hebrew: '', is_active: true };

export const AdminAds: React.FC = () => {
    const { t, direction } = useLanguage();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try { const res = await api.ads.listAdmin(1, 100); setItems(res.data); }
        catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openCreate = () => { setEditItem(null); setForm({ ...emptyForm }); setError(null); setShowForm(true); };
    const openEdit = (item: any) => {
        setEditItem(item); setError(null);
        setForm({ description: item.description || '', image_url: item.image_url || '', link: item.link || '', arabic: item.arabic || '', hebrew: item.hebrew || '', is_active: item.is_active ?? true });
        setShowForm(true);
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try { await api.ads.delete(id); loadData(); } catch (err: any) { alert(err.message); }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        const payload = { description: form.description || null, image_url: form.image_url || null, link: form.link || null, arabic: form.arabic || null, hebrew: form.hebrew || null, is_active: form.is_active };
        try {
            if (editItem) await api.ads.update(editItem.id, payload);
            else await api.ads.create(payload);
            setShowForm(false); loadData();
        } catch (err: any) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <AdminLayout>
            <div className="space-y-6" dir={direction}>
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 flex items-center gap-2"><Megaphone size={22} className="text-gold-400" /> {t('adsManage')}</h1>
                    <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer"><Plus size={16} /> {t('addNew')}</button>
                </div>
                {error && <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs rounded-xl">{error}</div>}

                <div className="space-y-3">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-zinc-950 border border-zinc-900 rounded-xl shimmer" />)
                        : items.map(item => (
                            <div key={item.id} className="bg-[#0d0d11]/50 border border-zinc-900 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-800 transition-colors">
                                {item.image_url && <div className="w-24 h-16 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0"><img src={item.image_url} alt="" className="w-full h-full object-cover" /></div>}
                                <div className="flex-1 min-w-0">
                                    <p className="text-zinc-200 text-sm leading-relaxed line-clamp-2">{item.description || '—'}</p>
                                    {item.arabic && <p className="text-zinc-500 text-xs mt-1 rtl:text-right" dir="rtl">{item.arabic}</p>}
                                    <div className="flex gap-2 mt-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-emerald-400/20 text-emerald-400' : 'bg-zinc-900 text-zinc-600'}`}>{item.is_active ? t('active') : t('inactive')}</span>
                                        {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 underline">Link</a>}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 cursor-pointer"><Pencil size={15} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 cursor-pointer"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
                        <div className="w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-900 overflow-y-auto p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                                <h2 className="text-lg font-extrabold text-zinc-100">{editItem ? t('edit') : t('addNew')} Ad</h2>
                                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X size={22} /></button>
                            </div>
                            {error && <div className="p-3 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs rounded-xl">{error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AdminField label={t('descriptionItem')}><textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-input resize-none" placeholder="English promo text..." /></AdminField>
                                <AdminField label={t('prodNameAr')}><textarea rows={2} value={form.arabic} onChange={e => setForm(f => ({ ...f, arabic: e.target.value }))} className="admin-input resize-none" dir="rtl" placeholder="النص العربي للإعلان" /></AdminField>
                                <AdminField label={t('prodNameHe')}><textarea rows={2} value={form.hebrew} onChange={e => setForm(f => ({ ...f, hebrew: e.target.value }))} className="admin-input resize-none" dir="rtl" /></AdminField>
                                <AdminField label="Link (URL)"><input type="text" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="admin-input" placeholder="https://..." /></AdminField>
                                <AdminField label={t('active')}>
                                    <select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} className="admin-input">
                                        <option value="true">{t('active')}</option>
                                        <option value="false">{t('inactive')}</option>
                                    </select>
                                </AdminField>
                                <ImageUpload label="Ad Banner Image" value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} />
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

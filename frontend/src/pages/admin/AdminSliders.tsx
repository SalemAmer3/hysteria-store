import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ImageUpload } from '../../components/ImageUpload';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2, X, Sliders as SlidersIcon } from 'lucide-react';

const emptyForm = { name: '', description: '', image_url: '', link: '', order: 0, interval: 5000, arabic: '', hebrew: '', is_active: true };

export const AdminSliders: React.FC = () => {
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
        try { const res = await api.sliders.listAdmin(1, 100); setItems(res.data); }
        catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openCreate = () => { setEditItem(null); setForm({ ...emptyForm }); setError(null); setShowForm(true); };
    const openEdit = (item: any) => {
        setEditItem(item); setError(null);
        setForm({ name: item.name || '', description: item.description || '', image_url: item.image_url || '', link: item.link || '', order: item.order || 0, interval: item.interval || 5000, arabic: item.arabic || '', hebrew: item.hebrew || '', is_active: item.is_active ?? true });
        setShowForm(true);
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try { await api.sliders.delete(id); loadData(); } catch (err: any) { alert(err.message); }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        const payload = { name: form.name, description: form.description || null, image_url: form.image_url || null, link: form.link || null, order: Number(form.order), interval: Number(form.interval), arabic: form.arabic || null, hebrew: form.hebrew || null, is_active: form.is_active };
        try {
            if (editItem) await api.sliders.update(editItem.id, payload);
            else await api.sliders.create(payload);
            setShowForm(false); loadData();
        } catch (err: any) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <AdminLayout>
            <div className="space-y-6" dir={direction}>
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 flex items-center gap-2"><SlidersIcon size={22} className="text-gold-400" /> {t('slidersManage')}</h1>
                    <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer"><Plus size={16} /> {t('addNew')}</button>
                </div>
                {error && <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs rounded-xl">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[16/7] bg-zinc-950 border border-zinc-900 rounded-2xl shimmer" />)
                        : items.map(item => (
                            <div key={item.id} className="group relative aspect-[16/7] rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950">
                                {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                                    <div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-emerald-400/20 text-emerald-400' : 'bg-zinc-900 text-zinc-600'}`}>{item.is_active ? t('active') : t('inactive')}</span>
                                        <p className="text-white font-bold text-sm mt-1">{item.name}</p>
                                        <p className="text-zinc-400 text-xs">Interval: {item.interval / 1000}s · Order: {item.order}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-black/80 hover:bg-zinc-800 text-blue-400 border border-zinc-800 cursor-pointer"><Pencil size={14} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-black/80 hover:bg-zinc-800 text-rose-400 border border-zinc-800 cursor-pointer"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
                        <div className="w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-900 overflow-y-auto p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                                <h2 className="text-lg font-extrabold text-zinc-100">{editItem ? t('edit') : t('addNew')} Slider</h2>
                                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X size={22} /></button>
                            </div>
                            {error && <div className="p-3 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs rounded-xl">{error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AdminField label={t('prodNameEn')} required><input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="admin-input" /></AdminField>
                                <AdminField label={t('prodNameAr')}><input type="text" value={form.arabic} onChange={e => setForm(f => ({ ...f, arabic: e.target.value }))} className="admin-input" dir="rtl" /></AdminField>
                                <AdminField label={t('prodNameHe')}><input type="text" value={form.hebrew} onChange={e => setForm(f => ({ ...f, hebrew: e.target.value }))} className="admin-input" dir="rtl" /></AdminField>
                                <AdminField label={t('descriptionItem')}><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-input resize-none" /></AdminField>
                                <AdminField label="Link (URL)"><input type="text" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="admin-input" placeholder="https://..." /></AdminField>
                                <div className="grid grid-cols-2 gap-3">
                                    <AdminField label={t('orderWeight')}><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className="admin-input" /></AdminField>
                                    <AdminField label="Interval (ms)"><input type="number" min="1000" step="500" value={form.interval} onChange={e => setForm(f => ({ ...f, interval: Number(e.target.value) }))} className="admin-input" /></AdminField>
                                </div>
                                <AdminField label={t('active')}>
                                    <select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} className="admin-input">
                                        <option value="true">{t('active')}</option>
                                        <option value="false">{t('inactive')}</option>
                                    </select>
                                </AdminField>
                                <ImageUpload label="Slider Banner Image" value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} />
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

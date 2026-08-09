import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2, X, Ticket, Calendar } from 'lucide-react';

const emptyForm = { name: '', code: '', amount: '', percentage: '', from_date: '', to_date: '', is_active: true };

export const AdminCoupons: React.FC = () => {
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
        try { const res = await api.coupons.listAdmin(1, 100); setItems(res.data); }
        catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openCreate = () => { setEditItem(null); setForm({ ...emptyForm }); setError(null); setShowForm(true); };
    const openEdit = (item: any) => {
        setEditItem(item); setError(null);
        setForm({
            name: item.name || '',
            code: item.code || '',
            amount: item.amount != null ? String(item.amount) : '',
            percentage: item.percentage != null ? String(item.percentage) : '',
            from_date: item.from_date ? item.from_date.split('T')[0] : '',
            to_date: item.to_date ? item.to_date.split('T')[0] : '',
            is_active: item.is_active ?? true,
        });
        setShowForm(true);
    };
    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try { await api.coupons.delete(id); loadData(); } catch (err: any) { alert(err.message); }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        const payload: any = {
            name: form.name.trim() || form.code.trim().toUpperCase(),
            code: form.code.trim().toUpperCase(),
            is_active: form.is_active,
            amount: form.amount ? Number(form.amount) : null,
            percentage: form.percentage ? Number(form.percentage) : null,
            from_date: form.from_date ? new Date(form.from_date).toISOString() : null,
            to_date: form.to_date ? new Date(form.to_date).toISOString() : null,
        };
        if (!payload.amount && !payload.percentage) {
            setError('Please set either a fixed amount or percentage discount.');
            setSaving(false); return;
        }
        try {
            if (editItem) await api.coupons.update(editItem.id, payload);
            else await api.coupons.create(payload);
            setShowForm(false); loadData();
        } catch (err: any) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <AdminLayout>
            <div className="space-y-6" dir={direction}>
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 flex items-center gap-2"><Ticket size={22} className="text-gold-400" /> {t('couponsManage')}</h1>
                    <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer"><Plus size={16} /> {t('addNew')}</button>
                </div>
                {error && <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs rounded-xl">{error}</div>}

                <div className="space-y-3">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-zinc-950 border border-zinc-900 rounded-xl shimmer" />)
                        : items.map(item => {
                            const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
                            return (
                                <div key={item.id} className="bg-[#0d0d11]/50 border border-zinc-900 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-800 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
                                        <Ticket size={20} className="text-gold-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-extrabold text-zinc-100 text-base font-mono tracking-widest">{item.code}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_active && !isExpired ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>
                                                {isExpired ? 'Expired' : item.is_active ? t('active') : t('inactive')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-1 text-[10px] font-semibold">
                                            {item.amount && <span className="text-gold-400">Fixed: ₪{item.amount}</span>}
                                            {item.percentage && <span className="text-gold-400">{item.percentage}% OFF</span>}
                                            {item.min_order_amount && <span className="text-zinc-500">Min: ₪{item.min_order_amount}</span>}
                                            {item.max_uses && <span className="text-zinc-500">Max uses: {item.max_uses}</span>}
                                            {item.uses_count != null && <span className="text-zinc-500">Used: {item.uses_count}×</span>}
                                            {item.expires_at && (
                                                <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : 'text-zinc-500'}`}>
                                                    <Calendar size={11} /> {new Date(item.expires_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 cursor-pointer"><Pencil size={15} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 cursor-pointer"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
                        <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 overflow-y-auto p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                                <h2 className="text-lg font-extrabold text-zinc-100">{editItem ? t('edit') : t('addNew')} Coupon</h2>
                                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X size={22} /></button>
                            </div>
                            {error && <div className="p-3 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs rounded-xl">{error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AdminField label="Coupon Name" required>
                                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="admin-input" placeholder="Summer Sale 20%" />
                                </AdminField>
                                <AdminField label="Coupon Code" required>
                                    <input type="text" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="admin-input font-mono tracking-widest" placeholder="HISTERIA10" dir="ltr" />
                                </AdminField>
                                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
                                    <p className="font-bold text-zinc-300">Discount Type (fill one or both)</p>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <AdminField label="Fixed Amount (₪)"><input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="admin-input" placeholder="50.00" /></AdminField>
                                        <AdminField label="Percentage (%)"><input type="number" min="0" max="100" step="0.1" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))} className="admin-input" placeholder="10" /></AdminField>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <AdminField label="Start Date (from)"><input type="date" value={form.from_date} onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))} className="admin-input" /></AdminField>
                                    <AdminField label="End Date (to)"><input type="date" value={form.to_date} onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))} className="admin-input" /></AdminField>
                                </div>
                                <AdminField label={t('active')}>
                                    <select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))} className="admin-input">
                                        <option value="true">{t('active')}</option>
                                        <option value="false">{t('inactive')}</option>
                                    </select>
                                </AdminField>
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

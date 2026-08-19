import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2, X, ScrollText, GripVertical } from 'lucide-react';

const emptyForm = { text: '', arabic: '', hebrew: '', is_active: true, order: 0 };

export const AdminTicker: React.FC = () => {
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
        try {
            const res = await api.ticker.listAdmin();
            setItems(res.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openCreate = () => {
        setEditItem(null);
        setForm({ ...emptyForm, order: items.length });
        setError(null);
        setShowForm(true);
    };

    const openEdit = (item: any) => {
        setEditItem(item);
        setError(null);
        setForm({
            text: item.text || '',
            arabic: item.arabic || '',
            hebrew: item.hebrew || '',
            is_active: item.is_active ?? true,
            order: item.order ?? 0,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try { await api.ticker.delete(id); loadData(); }
        catch (err: any) { alert(err.message); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const payload = {
            text: form.text,
            arabic: form.arabic || null,
            hebrew: form.hebrew || null,
            is_active: form.is_active,
            order: form.order,
        };
        try {
            if (editItem) await api.ticker.update(editItem.id, payload);
            else await api.ticker.create(payload);
            setShowForm(false);
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6" dir={direction}>
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
                        <ScrollText size={22} className="text-gold-400" />
                        {direction === 'rtl' ? 'الشريط المتحرك' : 'Ticker Messages'}
                    </h1>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer"
                    >
                        <Plus size={16} />
                        {t('addNew')}
                    </button>
                </div>

                <p className="text-xs text-zinc-500">
                    {direction === 'rtl'
                        ? 'الرسائل التي تظهر في الشريط المتحرك أعلى الموقع. رتّبها بتغيير رقم الترتيب.'
                        : 'Messages shown in the scrolling ticker at the top of the site. Set the Order number to control display sequence.'}
                </p>

                {error && <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs rounded-xl">{error}</div>}

                <div className="space-y-2">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 bg-zinc-950 border border-zinc-900 rounded-xl shimmer" />
                        ))
                        : items.length === 0
                            ? (
                                <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl text-sm">
                                    {direction === 'rtl' ? 'لا توجد رسائل بعد. أضف رسالتك الأولى!' : 'No ticker messages yet. Add your first one!'}
                                </div>
                            )
                            : items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-[#0d0d11]/50 border border-zinc-900 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-800 transition-colors"
                                >
                                    <GripVertical size={16} className="text-zinc-700 flex-shrink-0" />

                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <p className="text-zinc-200 text-sm font-semibold truncate">{item.text}</p>
                                        {item.arabic && (
                                            <p className="text-zinc-500 text-xs truncate" dir="rtl">{item.arabic}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-[10px] text-zinc-600 font-mono">#{item.order}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-emerald-400/20 text-emerald-400' : 'bg-zinc-900 text-zinc-600'}`}>
                                            {item.is_active ? t('active') : t('inactive')}
                                        </span>
                                        <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 cursor-pointer">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 cursor-pointer">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                    }
                </div>

                {/* Slide-over form */}
                {showForm && (
                    <div
                        className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm"
                        onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
                    >
                        <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-900 overflow-y-auto p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                                <h2 className="text-lg font-extrabold text-zinc-100">
                                    {editItem
                                        ? (direction === 'rtl' ? 'تعديل الرسالة' : 'Edit Message')
                                        : (direction === 'rtl' ? 'إضافة رسالة' : 'Add Message')}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                                    <X size={22} />
                                </button>
                            </div>

                            {error && <div className="p-3 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs rounded-xl">{error}</div>}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Field label={direction === 'rtl' ? 'النص (إنجليزي)' : 'Text (English)'} required>
                                    <input
                                        type="text"
                                        required
                                        value={form.text}
                                        onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                                        className="admin-input"
                                        placeholder="✨ Free shipping on orders over ₪350!"
                                    />
                                </Field>

                                <Field label={direction === 'rtl' ? 'النص بالعربية' : 'Arabic Text'}>
                                    <input
                                        type="text"
                                        value={form.arabic}
                                        onChange={e => setForm(f => ({ ...f, arabic: e.target.value }))}
                                        className="admin-input"
                                        dir="rtl"
                                        placeholder="✨ شحن مجاني للطلبات فوق ₪350"
                                    />
                                </Field>

                                <Field label={direction === 'rtl' ? 'النص بالعبرية' : 'Hebrew Text'}>
                                    <input
                                        type="text"
                                        value={form.hebrew}
                                        onChange={e => setForm(f => ({ ...f, hebrew: e.target.value }))}
                                        className="admin-input"
                                        dir="rtl"
                                        placeholder="✨ משלוח חינם מעל ₪350"
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label={direction === 'rtl' ? 'الترتيب' : 'Order'}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.order}
                                            onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                                            className="admin-input"
                                        />
                                    </Field>
                                    <Field label={t('active')}>
                                        <select
                                            value={form.is_active ? 'true' : 'false'}
                                            onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}
                                            className="admin-input"
                                        >
                                            <option value="true">{t('active')}</option>
                                            <option value="false">{t('inactive')}</option>
                                        </select>
                                    </Field>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-zinc-900">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-bold cursor-pointer"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-3 rounded-xl bg-gold-400 text-black text-xs font-extrabold cursor-pointer disabled:opacity-50"
                                    >
                                        {saving ? '...' : t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] text-zinc-500 uppercase font-extrabold tracking-widest">
            {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

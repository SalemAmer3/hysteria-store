import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ImageUpload } from '../../components/ImageUpload';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, PackageSearch } from 'lucide-react';

interface ProductOption {
    id?: string;
    size?: string;
    color_name?: string;
    shade?: string;
    color?: string;
    price: number;
    image_url?: string;
    arabic?: string;
    hebrew?: string;
}

interface ProductImage {
    id?: string;
    image_url: string;
}

interface ProductFormState {
    name: string;
    description: string;
    category_id: string;
    brand_id: string;
    arabic: string;
    hebrew: string;
    options: ProductOption[];
    images: ProductImage[];
}

const emptyForm: ProductFormState = {
    name: '', description: '', category_id: '', brand_id: '',
    arabic: '', hebrew: '', options: [], images: [],
};

const emptyOption: ProductOption = {
    size: '', color_name: '', shade: '', color: '', price: 0, image_url: '', arabic: '', hebrew: ''
};

export const AdminProducts: React.FC = () => {
    const { t, direction } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<any | null>(null);
    const [form, setForm] = useState<ProductFormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [prodsRes, catsRes, brandsRes] = await Promise.all([
                api.products.listAdmin(page, 15),
                api.categories.listPublic(),
                api.brands.listPublic(),
            ]);
            setProducts(prodsRes.data);
            setTotalPages(prodsRes.pagination?.totalPages || 1);
            setCategories(catsRes.data);
            setBrands(brandsRes.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const openCreate = () => {
        setEditProduct(null);
        setForm(emptyForm);
        setError(null);
        setShowForm(true);
    };

    const openEdit = async (prod: any) => {
        try {
            const res = await api.products.getAdmin(prod.id);
            const p = res.data;
            setEditProduct(p);
            setForm({
                name: p.name || '',
                description: p.description || '',
                category_id: p.category_id || '',
                brand_id: p.brand_id || '',
                arabic: p.arabic || '',
                hebrew: p.hebrew || '',
                options: (p.options || []).map((o: any) => ({
                    id: o.id, size: o.size || '', color_name: o.color_name || '',
                    shade: o.shade || '', color: o.color || '', price: Number(o.price), image_url: o.image_url || '',
                    arabic: o.arabic || '', hebrew: o.hebrew || '',
                })),
                images: (p.images || []).map((img: any) => ({ id: img.id, image_url: img.image_url })),
            });
            setError(null);
            setShowForm(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try {
            await api.products.delete(id);
            loadProducts();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleOptionChange = (idx: number, key: string, value: any) => {
        const updated = [...form.options];
        updated[idx] = { ...updated[idx], [key]: value };
        setForm(f => ({ ...f, options: updated }));
    };

    const addOption = () => setForm(f => ({ ...f, options: [...f.options, { ...emptyOption }] }));
    const removeOption = (idx: number) => setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));

    const addImage = () => setForm(f => ({ ...f, images: [...f.images, { image_url: '' }] }));
    const removeImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            let productId: string;

            if (editProduct) {
                await api.products.update(editProduct.id, {
                    name: form.name, description: form.description || null,
                    category_id: form.category_id, brand_id: form.brand_id,
                    arabic: form.arabic || null, hebrew: form.hebrew || null,
                });
                productId = editProduct.id;

                // Sync images: delete old ones not in form, add new ones
                const existingImageIds = (editProduct.images || []).map((img: any) => img.id);
                const formImageIds = form.images.filter(img => img.id).map(img => img.id);
                for (const imgId of existingImageIds) {
                    if (!formImageIds.includes(imgId)) {
                        await api.productImages.delete(imgId);
                    }
                }
                for (const img of form.images) {
                    if (!img.id && img.image_url) {
                        await api.productImages.create({ product_id: productId, image_url: img.image_url });
                    }
                }

                // Sync options: delete old ones, add/update
                const existingOptIds = (editProduct.options || []).map((o: any) => o.id);
                const formOptIds = form.options.filter(o => o.id).map(o => o.id);
                for (const optId of existingOptIds) {
                    if (!formOptIds.includes(optId)) {
                        await api.productOptions.delete(optId);
                    }
                }
                for (const opt of form.options) {
                    if (opt.id) {
                        await api.productOptions.update(opt.id, {
                            size: opt.size || null, color_name: opt.color_name || null,
                            shade: opt.shade || null,
                            color: opt.color || null, price: opt.price,
                            image_url: opt.image_url || null, arabic: opt.arabic || null, hebrew: opt.hebrew || null,
                        });
                    } else {
                        await api.productOptions.create({
                            product_id: productId, size: opt.size || null, color_name: opt.color_name || null,
                            shade: opt.shade || null,
                            color: opt.color || null, price: opt.price,
                            image_url: opt.image_url || null, arabic: opt.arabic || null, hebrew: opt.hebrew || null,
                        });
                    }
                }
            } else {
                const res = await api.products.create({
                    name: form.name, description: form.description || null,
                    category_id: form.category_id, brand_id: form.brand_id,
                    arabic: form.arabic || null, hebrew: form.hebrew || null,
                });
                productId = res.data.id;

                for (const img of form.images) {
                    if (img.image_url) {
                        await api.productImages.create({ product_id: productId, image_url: img.image_url });
                    }
                }
                for (const opt of form.options) {
                    await api.productOptions.create({
                        product_id: productId, size: opt.size || null, color_name: opt.color_name || null,
                        shade: opt.shade || null,
                        color: opt.color || null, price: opt.price,
                        image_url: opt.image_url || null, arabic: opt.arabic || null, hebrew: opt.hebrew || null,
                    });
                }
            }

            setShowForm(false);
            loadProducts();
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
                        <PackageSearch size={22} className="text-gold-400" />
                        {t('productsManage')}
                    </h1>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer tracking-wider">
                        <Plus size={16} /> {t('addNew')}
                    </button>
                </div>

                {error && <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs rounded-xl">{error}</div>}

                {/* Products List */}
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-20 bg-zinc-950 border border-zinc-900 rounded-xl shimmer" />
                        ))
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">{t('noProducts')}</div>
                    ) : (
                        products.map((prod) => (
                            <div key={prod.id} className="bg-[#0d0d11]/50 border border-zinc-900 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-800 transition-colors">
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800">
                                    {prod.images?.[0]?.image_url
                                        ? <img src={prod.images[0].image_url} alt={prod.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-zinc-700"><PackageSearch size={18} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-zinc-200 font-semibold text-sm truncate">{prod.name}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850">
                                            {prod.category?.name || '—'}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850">
                                            {prod.brand?.name || '—'}
                                        </span>
                                        <span className="text-[10px] text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded-full border border-gold-400/20">
                                            {prod.options?.length || 0} options
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => openEdit(prod)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 cursor-pointer transition-colors"><Pencil size={15} /></button>
                                    <button onClick={() => handleDelete(prod.id)} className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 cursor-pointer transition-colors"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-4 pt-4 border-t border-zinc-900 font-sans">
                        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 text-xs font-bold text-zinc-300 disabled:opacity-30 cursor-pointer">
                            {direction === 'rtl' ? 'السابق' : 'Previous'}
                        </button>
                        <span className="text-xs text-zinc-500 font-semibold self-center">{page} / {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 text-xs font-bold text-zinc-300 disabled:opacity-30 cursor-pointer">
                            {direction === 'rtl' ? 'التالي' : 'Next'}
                        </button>
                    </div>
                )}

                {/* Slide-over Panel for Create/Edit Product */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
                        <div className="w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-900 overflow-y-auto p-6 md:p-10 space-y-6 relative flex flex-col"
                            style={{ borderLeftWidth: direction === 'rtl' ? 0 : 1, borderRightWidth: direction === 'rtl' ? 1 : 0 }}>
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                                <h2 className="text-lg font-extrabold text-zinc-100">{editProduct ? t('edit') : t('addNew')} {t('productsManage')}</h2>
                                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X size={22} /></button>
                            </div>

                            {error && <div className="p-3 bg-rose-950/20 border border-rose-900 text-rose-400 text-xs rounded-xl">{error}</div>}

                            <form onSubmit={handleSubmit} className="space-y-6 flex-1 pb-6">

                                {/* Basic Info */}
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField label={t('prodNameEn')} required>
                                        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            className="admin-input" />
                                    </FormField>
                                    <FormField label={t('prodNameAr')}>
                                        <input type="text" value={form.arabic} onChange={e => setForm(f => ({ ...f, arabic: e.target.value }))}
                                            className="admin-input" dir="rtl" placeholder="الاسم بالعربية" />
                                    </FormField>
                                    <FormField label={t('prodNameHe')}>
                                        <input type="text" value={form.hebrew} onChange={e => setForm(f => ({ ...f, hebrew: e.target.value }))}
                                            className="admin-input" dir="rtl" placeholder="שם בעברית" />
                                    </FormField>
                                    <FormField label={t('descriptionItem')}>
                                        <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            className="admin-input resize-none" />
                                    </FormField>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField label={t('categorySelect')} required>
                                            <select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                                className="admin-input">
                                                <option value="">—</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </FormField>
                                        <FormField label={t('brandSelect')} required>
                                            <select required value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}
                                                className="admin-input">
                                                <option value="">—</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </FormField>
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="space-y-3 border-t border-zinc-900 pt-5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Product Images</span>
                                        <button type="button" onClick={addImage} className="text-xs text-gold-400 hover:text-gold-300 font-bold cursor-pointer flex items-center gap-1">
                                            <Plus size={14} /> Add Image
                                        </button>
                                    </div>
                                    {form.images.map((img, i) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="flex-1">
                                                <ImageUpload value={img.image_url} onChange={url => {
                                                    const updated = [...form.images]; updated[i] = { ...img, image_url: url };
                                                    setForm(f => ({ ...f, images: updated }));
                                                }} />
                                            </div>
                                            <button type="button" onClick={() => removeImage(i)} className="mt-2 text-rose-400 hover:text-rose-300 cursor-pointer"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>

                                {/* Options (Size / Color / Price) */}
                                <div className="space-y-3 border-t border-zinc-900 pt-5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Options (Size / Color / Price)</span>
                                        <button type="button" onClick={addOption} className="text-xs text-gold-400 hover:text-gold-300 font-bold cursor-pointer flex items-center gap-1">
                                            <Plus size={14} /> Add Option
                                        </button>
                                    </div>
                                    {form.options.map((opt, i) => {
                                        const key = `opt-${i}`;
                                        const isExpanded = expandedOptions[key] !== false; // default open
                                        return (
                                            <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                                                <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                                    onClick={() => setExpandedOptions(prev => ({ ...prev, [key]: !isExpanded }))}>
                                                    <span className="text-xs font-bold text-zinc-300">
                                                        Option {i + 1}: {[opt.color_name, opt.shade, opt.size].filter(Boolean).join(' - ') || 'New Option'}
                                                        {opt.price > 0 && <span className="text-gold-400 ml-2 font-sans">₪{opt.price}</span>}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={e => { e.stopPropagation(); removeOption(i); }} className="text-rose-400 hover:text-rose-300 cursor-pointer"><X size={14} /></button>
                                                        {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                                                    </div>
                                                </div>
                                                {isExpanded && (
                                                    <div className="border-t border-zinc-800 p-4 grid grid-cols-2 gap-3">
                                                        <FormField label={t('sizeOption')}>
                                                            <input type="text" value={opt.size || ''} onChange={e => handleOptionChange(i, 'size', e.target.value)} className="admin-input" placeholder="50ml / S / M" />
                                                        </FormField>
                                                        <FormField label={t('priceOption')} required>
                                                            <input type="number" min="0" step="0.01" required value={opt.price || ''} onChange={e => handleOptionChange(i, 'price', Number(e.target.value))} className="admin-input" />
                                                        </FormField>
                                                        <FormField label={t('colorNameOption')}>
                                                            <input type="text" value={opt.color_name || ''} onChange={e => handleOptionChange(i, 'color_name', e.target.value)} className="admin-input" placeholder="Red / أحمر" />
                                                        </FormField>
                                                        <FormField label={t('shadeOption')}>
                                                            <input type="text" value={opt.shade || ''} onChange={e => handleOptionChange(i, 'shade', e.target.value)} className="admin-input" placeholder="Dark Red / أحمر غامق" />
                                                        </FormField>
                                                        <FormField label={t('colorOptionHex')}>
                                                            <div className="flex gap-2 items-center">
                                                                <input type="color" value={opt.color || '#ffffff'} onChange={e => handleOptionChange(i, 'color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-zinc-800" />
                                                                <input type="text" value={opt.color || ''} onChange={e => handleOptionChange(i, 'color', e.target.value)} className="admin-input flex-1" placeholder="#ffffff" />
                                                            </div>
                                                        </FormField>
                                                        <FormField label={t('prodNameAr')}>
                                                            <input type="text" value={opt.arabic || ''} onChange={e => handleOptionChange(i, 'arabic', e.target.value)} className="admin-input" dir="rtl" />
                                                        </FormField>
                                                        <FormField label={t('prodNameHe')}>
                                                            <input type="text" value={opt.hebrew || ''} onChange={e => handleOptionChange(i, 'hebrew', e.target.value)} className="admin-input" dir="rtl" />
                                                        </FormField>
                                                        <div className="col-span-2">
                                                            <ImageUpload label="Option Image" value={opt.image_url || ''} onChange={url => handleOptionChange(i, 'image_url', url)} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Save Controls */}
                                <div className="flex gap-3 pt-4 border-t border-zinc-900 sticky bottom-0 bg-zinc-950 pb-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-bold cursor-pointer transition-colors">{t('cancel')}</button>
                                    <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-gold-400 hover:bg-gold-500 text-black text-xs font-extrabold transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 tracking-wider">
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

// Helper reusable form field wrapper
const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] text-zinc-500 uppercase font-extrabold tracking-widest">
            {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

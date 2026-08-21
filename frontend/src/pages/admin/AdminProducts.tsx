import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ImageUpload } from '../../components/ImageUpload';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, PackageSearch, Search } from 'lucide-react';

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
    sku: string;
    description: string;
    arabic_description: string;
    hebrew_description: string;
    category_id: string;
    brand_id: string;
    arabic: string;
    hebrew: string;
    options: ProductOption[];
    images: ProductImage[];
}

const emptyForm: ProductFormState = {
    name: '', sku: '', description: '', arabic_description: '', hebrew_description: '',
    category_id: '', brand_id: '',
    arabic: '', hebrew: '', options: [], images: [],
};

const emptyOption: ProductOption = {
    size: '', color_name: '', shade: '', color: '', price: 0, image_url: '', arabic: '', hebrew: ''
};

// ── Color group structure for UI ──────────────────────────────────
interface ShadeEntry {
    id?: string;         // existing option id when editing
    shade: string;
    price: number;
    size: string;
    image_url: string;
    arabic: string;
}

interface ColorGroup {
    color_name: string;
    color: string;       // hex
    shades: ShadeEntry[];
}

const emptyShade = (): ShadeEntry => ({ shade: '', price: 0, size: '', image_url: '', arabic: '' });

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
    const [translating, setTranslating] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Color groups state — drives the new color+shades UI
    const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);

    // ── Color group helpers ────────────────────────────────────────
    const addColorGroup = () =>
        setColorGroups(prev => [...prev, { color_name: '', color: '#888888', shades: [emptyShade()] }]);

    const removeColorGroup = (gi: number) =>
        setColorGroups(prev => prev.filter((_, i) => i !== gi));

    const updateColorGroup = (gi: number, field: 'color_name' | 'color', value: string) =>
        setColorGroups(prev => prev.map((g, i) => i === gi ? { ...g, [field]: value } : g));

    const addShade = (gi: number) =>
        setColorGroups(prev => prev.map((g, i) => i === gi ? { ...g, shades: [...g.shades, emptyShade()] } : g));

    const removeShade = (gi: number, si: number) =>
        setColorGroups(prev => prev.map((g, i) => i === gi ? { ...g, shades: g.shades.filter((_, j) => j !== si) } : g));

    const updateShade = (gi: number, si: number, field: keyof ShadeEntry, value: any) =>
        setColorGroups(prev => prev.map((g, i) => i === gi
            ? { ...g, shades: g.shades.map((s, j) => j === si ? { ...s, [field]: value } : s) }
            : g
        ));

    // Debounce search input — 400ms
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Auto-translate description using MyMemory free API
    // Source: Arabic (arabic_description) → translates to EN (description) + HE (hebrew_description)
    const autoTranslate = async () => {
        if (!form.arabic_description.trim()) return;
        setTranslating(true);
        try {
            const [enRes, heRes] = await Promise.all([
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(form.arabic_description)}&langpair=ar|en`),
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(form.arabic_description)}&langpair=ar|he`),
            ]);
            const [enData, heData] = await Promise.all([enRes.json(), heRes.json()]);
            const enText = enData?.responseData?.translatedText || '';
            const heText = heData?.responseData?.translatedText || '';
            setForm(f => ({
                ...f,
                description: enText || f.description,
                hebrew_description: heText || f.hebrew_description,
            }));
        } catch {
            // silently fail — user can fill manually
        } finally {
            setTranslating(false);
        }
    };

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [prodsRes, catsRes, brandsRes] = await Promise.all([
                api.products.listAdmin(page, 15, debouncedSearch || undefined),
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
    }, [page, debouncedSearch]);

    // Reset to page 1 when search changes
    useEffect(() => { setPage(1); }, [debouncedSearch]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const openCreate = () => {
        setEditProduct(null);
        setForm(emptyForm);
        setColorGroups([]);
        setError(null);
        setShowForm(true);
    };

    const openEdit = async (prod: any) => {
        try {
            const res = await api.products.getAdmin(prod.id);
            const p = res.data;
            setEditProduct(p);

            // Separate color options from plain options
            const allOptions: any[] = p.options || [];
            const colorOptions = allOptions.filter((o: any) => o.color_name);
            const plainOptions = allOptions.filter((o: any) => !o.color_name);

            // Build colorGroups from existing options grouped by color_name
            const groupMap: Record<string, ColorGroup> = {};
            colorOptions.forEach((o: any) => {
                const key = o.color_name;
                if (!groupMap[key]) {
                    groupMap[key] = { color_name: key, color: o.color || '#888888', shades: [] };
                }
                groupMap[key].shades.push({
                    id: o.id,
                    shade: o.shade || '',
                    price: Number(o.price),
                    size: o.size || '',
                    image_url: o.image_url || '',
                    arabic: o.arabic || '',
                });
            });
            setColorGroups(Object.values(groupMap));

            setForm({
                name: p.name || '',
                sku: p.sku || '',
                description: p.description || '',
                arabic_description: p.arabic_description || '',
                hebrew_description: p.hebrew_description || '',
                category_id: p.category_id || '',
                brand_id: p.brand_id || '',
                arabic: p.arabic || '',
                hebrew: p.hebrew || '',
                options: plainOptions.map((o: any) => ({
                    id: o.id, size: o.size || '', color_name: '', shade: '', color: '',
                    price: Number(o.price), image_url: o.image_url || '', arabic: o.arabic || '', hebrew: o.hebrew || '',
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

            // Build flat options list: colorGroups → options + plain options
            const colorOptions: ProductOption[] = colorGroups.flatMap(group =>
                group.shades.map(shade => ({
                    id: shade.id,
                    color_name: group.color_name,
                    color: group.color,
                    shade: shade.shade || null,
                    size: shade.size || null,
                    price: shade.price,
                    image_url: shade.image_url || null,
                    arabic: shade.arabic || null,
                    hebrew: undefined,
                } as ProductOption))
            );
            const allOptions = [...colorOptions, ...form.options];

            if (editProduct) {
                await api.products.update(editProduct.id, {
                    name: form.name, description: form.description || null,
                    sku: form.sku || null,
                    category_id: form.category_id, brand_id: form.brand_id || null,
                    arabic: form.arabic || null, hebrew: form.hebrew || null,
                    arabic_description: form.arabic_description || null,
                    hebrew_description: form.hebrew_description || null,
                });
                productId = editProduct.id;

                // Sync images
                const existingImageIds = (editProduct.images || []).map((img: any) => img.id);
                const formImageIds = form.images.filter(img => img.id).map(img => img.id);
                for (const imgId of existingImageIds) {
                    if (!formImageIds.includes(imgId)) await api.productImages.delete(imgId);
                }
                for (const img of form.images) {
                    if (!img.id && img.image_url) {
                        await api.productImages.create({ product_id: productId, image_url: img.image_url });
                    }
                }

                // Sync options: delete removed, update existing, create new
                const existingOptIds = (editProduct.options || []).map((o: any) => o.id);
                const formOptIds = allOptions.filter(o => o.id).map(o => o.id);
                for (const optId of existingOptIds) {
                    if (!formOptIds.includes(optId)) await api.productOptions.delete(optId);
                }
                for (const opt of allOptions) {
                    const payload = {
                        size: opt.size || null, color_name: opt.color_name || null,
                        shade: opt.shade || null, color: opt.color || null,
                        price: opt.price, image_url: opt.image_url || null,
                        arabic: opt.arabic || null, hebrew: opt.hebrew || null,
                    };
                    if (opt.id) {
                        await api.productOptions.update(opt.id, payload);
                    } else {
                        await api.productOptions.create({ product_id: productId, ...payload });
                    }
                }
            } else {
                const res = await api.products.create({
                    name: form.name, description: form.description || null,
                    sku: form.sku || null,
                    category_id: form.category_id, brand_id: form.brand_id || null,
                    arabic: form.arabic || null, hebrew: form.hebrew || null,
                    arabic_description: form.arabic_description || null,
                    hebrew_description: form.hebrew_description || null,
                });
                productId = res.data.id;

                for (const img of form.images) {
                    if (img.image_url) {
                        await api.productImages.create({ product_id: productId, image_url: img.image_url });
                    }
                }
                for (const opt of allOptions) {
                    await api.productOptions.create({
                        product_id: productId,
                        size: opt.size || null, color_name: opt.color_name || null,
                        shade: opt.shade || null, color: opt.color || null,
                        price: opt.price, image_url: opt.image_url || null,
                        arabic: opt.arabic || null, hebrew: opt.hebrew || null,
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

                {/* Search bar */}
                <div className="relative">
                    <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
                    <input
                        type="text"
                        placeholder={direction === 'rtl' ? 'ابحث عن منتج...' : 'Search products...'}
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
                                    {prod.sku && (
                                        <p className="text-[10px] text-zinc-600 font-mono mt-0.5">SKU: {prod.sku}</p>
                                    )}
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
                                    <FormField label="SKU (اختياري)">
                                        <input
                                            type="text"
                                            value={form.sku}
                                            onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                                            className="admin-input font-mono tracking-widest"
                                            placeholder="e.g. HST-001 / PERF-RED-50ML"
                                        />
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
                                        <div className="space-y-2">
                                            {/* Arabic description - primary input */}
                                            <div>
                                                <label className="block text-[10px] text-zinc-600 mb-1" dir="rtl">الوصف بالعربية (المصدر)</label>
                                                <textarea rows={3} value={form.arabic_description} onChange={e => setForm(f => ({ ...f, arabic_description: e.target.value }))}
                                                    className="admin-input resize-none" dir="rtl" placeholder="اكتب الوصف بالعربية هنا..." />
                                                {form.arabic_description.trim() && (
                                                    <button
                                                        type="button"
                                                        onClick={autoTranslate}
                                                        disabled={translating}
                                                        className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-gold-400 hover:text-gold-300 disabled:opacity-50 cursor-pointer transition-colors"
                                                    >
                                                        {translating ? (
                                                            <span className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin inline-block" />
                                                        ) : '🌐'}
                                                        {translating ? 'جاري الترجمة…' : 'ترجم تلقائياً للإنجليزي والعبري'}
                                                    </button>
                                                )}
                                            </div>
                                            {/* English description */}
                                            <div>
                                                <label className="block text-[10px] text-zinc-600 mb-1">Description (English)</label>
                                                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                                    className="admin-input resize-none" placeholder="English description (auto-filled or manual)" />
                                            </div>
                                            {/* Hebrew description */}
                                            <div>
                                                <label className="block text-[10px] text-zinc-600 mb-1" dir="rtl">תיאור בעברית</label>
                                                <textarea rows={2} value={form.hebrew_description} onChange={e => setForm(f => ({ ...f, hebrew_description: e.target.value }))}
                                                    className="admin-input resize-none" dir="rtl" placeholder="תיאור בעברית (אוטומטי או ידני)" />
                                            </div>
                                        </div>
                                    </FormField>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField label={t('categorySelect')} required>
                                            <select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                                className="admin-input">
                                                <option value="">—</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </FormField>
                                        <FormField label={`${t('brandSelect')} (${t('optional')})`}>
                                            <select value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}
                                                className="admin-input">
                                                <option value="">— {t('optional')} —</option>
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

                                {/* Options (Size / Color / Shades / Price) */}
                                <div className="space-y-4 border-t border-zinc-900 pt-5">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">الألوان والدرجات</span>
                                            <p className="text-[10px] text-zinc-600 mt-0.5">كل لون يمكن أن يحتوي على أكثر من درجة</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addColorGroup}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold cursor-pointer transition-all"
                                        >
                                            <Plus size={14} /> إضافة لون
                                        </button>
                                    </div>

                                    {colorGroups.map((group, gi) => (
                                        <div key={gi} className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
                                            {/* Color header */}
                                            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/60 border-b border-zinc-800">
                                                <div
                                                    className="w-6 h-6 rounded-full border-2 border-zinc-700 flex-shrink-0 cursor-pointer relative overflow-hidden"
                                                    style={{ backgroundColor: group.color || '#888' }}
                                                >
                                                    <input
                                                        type="color"
                                                        value={group.color || '#888888'}
                                                        onChange={e => updateColorGroup(gi, 'color', e.target.value)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        title="اختر اللون"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={group.color_name}
                                                    onChange={e => updateColorGroup(gi, 'color_name', e.target.value)}
                                                    placeholder="اسم اللون (مثال: أحمر / Red)"
                                                    className="admin-input flex-1 text-sm font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeColorGroup(gi)}
                                                    className="text-rose-400 hover:text-rose-300 cursor-pointer flex-shrink-0 p-1"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>

                                            {/* Shades list */}
                                            <div className="p-3 space-y-2">
                                                {group.shades.map((shade, si) => {
                                                    const key = `shade-${gi}-${si}`;
                                                    const isExp = expandedOptions[key] !== false;
                                                    return (
                                                        <div key={si} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/40">
                                                            {/* Shade header row */}
                                                            <div
                                                                className="flex items-center justify-between px-3 py-2 cursor-pointer"
                                                                onClick={() => setExpandedOptions(prev => ({ ...prev, [key]: !isExp }))}
                                                            >
                                                                <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
                                                                    <span className="text-zinc-500">درجة {si + 1}:</span>
                                                                    <span className="text-zinc-200">{shade.shade || '—'}</span>
                                                                    {shade.price > 0 && <span className="text-gold-400 font-sans text-xs">₪{shade.price}</span>}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={e => { e.stopPropagation(); removeShade(gi, si); }}
                                                                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                                                                    >
                                                                        <X size={13} />
                                                                    </button>
                                                                    {isExp ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                                                                </div>
                                                            </div>

                                                            {/* Shade fields */}
                                                            {isExp && (
                                                                <div className="border-t border-zinc-800 p-3 grid grid-cols-2 gap-3">
                                                                    <FormField label="اسم الدرجة" required>
                                                                        <input
                                                                            type="text"
                                                                            value={shade.shade || ''}
                                                                            onChange={e => updateShade(gi, si, 'shade', e.target.value)}
                                                                            className="admin-input"
                                                                            placeholder="أحمر غامق / Dark Red"
                                                                        />
                                                                    </FormField>
                                                                    <FormField label={t('priceOption')} required>
                                                                        <input
                                                                            type="number" min="0" step="0.01" required
                                                                            value={shade.price || ''}
                                                                            onChange={e => updateShade(gi, si, 'price', Number(e.target.value))}
                                                                            className="admin-input"
                                                                        />
                                                                    </FormField>
                                                                    <FormField label={t('sizeOption')}>
                                                                        <input
                                                                            type="text"
                                                                            value={shade.size || ''}
                                                                            onChange={e => updateShade(gi, si, 'size', e.target.value)}
                                                                            className="admin-input"
                                                                            placeholder="50ml / S / M"
                                                                        />
                                                                    </FormField>
                                                                    <FormField label={t('prodNameAr')}>
                                                                        <input type="text" value={shade.arabic || ''} onChange={e => updateShade(gi, si, 'arabic', e.target.value)} className="admin-input" dir="rtl" />
                                                                    </FormField>
                                                                    <div className="col-span-2">
                                                                        <ImageUpload label="صورة الدرجة (اختياري)" value={shade.image_url || ''} onChange={url => updateShade(gi, si, 'image_url', url)} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Add shade button */}
                                                <button
                                                    type="button"
                                                    onClick={() => addShade(gi)}
                                                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-zinc-700 rounded-lg text-[11px] text-zinc-500 hover:text-gold-400 hover:border-gold-400/50 transition-all cursor-pointer"
                                                >
                                                    <Plus size={13} /> إضافة درجة لهذا اللون
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Plain options without color (size/price only) */}
                                    <div className="pt-2 border-t border-zinc-800/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] text-zinc-600 uppercase font-extrabold tracking-wider">خيارات بدون لون (حجم / سعر فقط)</span>
                                            <button
                                                type="button"
                                                onClick={addOption}
                                                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-gold-400 font-bold cursor-pointer"
                                            >
                                                <Plus size={12} /> إضافة
                                            </button>
                                        </div>
                                        {form.options.map((opt, i) => {
                                            const key = `opt-${i}`;
                                            const isExpanded = expandedOptions[key] !== false;
                                            return (
                                                <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden mb-2">
                                                    <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer"
                                                        onClick={() => setExpandedOptions(prev => ({ ...prev, [key]: !isExpanded }))}>
                                                        <span className="text-xs font-bold text-zinc-400">
                                                            {opt.size || 'خيار جديد'}
                                                            {opt.price > 0 && <span className="text-gold-400 ml-2 font-sans">₪{opt.price}</span>}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={e => { e.stopPropagation(); removeOption(i); }} className="text-rose-400 hover:text-rose-300 cursor-pointer"><X size={13} /></button>
                                                            {isExpanded ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                                                        </div>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="border-t border-zinc-800 p-3 grid grid-cols-2 gap-3">
                                                            <FormField label={t('sizeOption')}>
                                                                <input type="text" value={opt.size || ''} onChange={e => handleOptionChange(i, 'size', e.target.value)} className="admin-input" placeholder="50ml / S / M" />
                                                            </FormField>
                                                            <FormField label={t('priceOption')} required>
                                                                <input type="number" min="0" step="0.01" required value={opt.price || ''} onChange={e => handleOptionChange(i, 'price', Number(e.target.value))} className="admin-input" />
                                                            </FormField>
                                                            <div className="col-span-2">
                                                                <ImageUpload label="صورة الخيار" value={opt.image_url || ''} onChange={url => handleOptionChange(i, 'image_url', url)} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
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

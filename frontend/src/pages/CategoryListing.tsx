import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, Trash2, ChevronDown } from 'lucide-react';

export const CategoryListing: React.FC = () => {
    const { getLocalized, direction, t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Track which parent categories are expanded in the accordion
    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

    const activeCategoryId = searchParams.get('category');
    const activeBrandId = searchParams.get('brand');
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [catsRes, brandsRes] = await Promise.all([
                    api.categories.listPublic(),
                    api.brands.listPublic(),
                ]);
                setCategories(catsRes.data.filter((c: any) => c.is_active));
                setBrands(brandsRes.data);

                const productsRes = await api.products.listPublic(currentPage, 30);
                setProducts(productsRes.data);
                if (productsRes.pagination) {
                    setTotalPages(productsRes.pagination.totalPages || 1);
                }
            } catch (err) {
                console.error('Failed to load listings data', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategoryId, activeBrandId, searchQuery]);

    // Auto-expand parent if a child is active
    useEffect(() => {
        if (activeCategoryId && activeCategoryId !== 'all') {
            const activeChild = categories.find(c => c.id === activeCategoryId && c.parent_id);
            if (activeChild) {
                setExpandedCats(prev => ({ ...prev, [activeChild.parent_id]: true }));
            }
        }
    }, [activeCategoryId, categories]);

    const filteredProducts = products.filter((p) => {
        if (activeCategoryId && activeCategoryId !== 'all') {
            if (p.category_id !== activeCategoryId) {
                const targetCategory = categories.find((c) => c.id === p.category_id);
                if (!targetCategory || targetCategory.parent_id !== activeCategoryId) {
                    return false;
                }
            }
        }
        if (activeBrandId && activeBrandId !== 'all') {
            if (p.brand_id !== activeBrandId) return false;
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const nameMatch = p.name?.toLowerCase().includes(q);
            const descMatch = p.description?.toLowerCase().includes(q);
            const arNameMatch = p.arabic?.toLowerCase().includes(q);
            const heNameMatch = p.hebrew?.toLowerCase().includes(q);
            if (!nameMatch && !descMatch && !arNameMatch && !heNameMatch) return false;
        }
        return true;
    });

    const clearAllFilters = () => setSearchParams({});

    const handleCategoryClick = (catId: string) => {
        const params = new URLSearchParams(searchParams);
        if (catId === 'all') {
            params.delete('category');
        } else {
            params.set('category', catId);
        }
        setSearchParams(params);
    };

    const handleBrandClick = (brandId: string) => {
        const params = new URLSearchParams(searchParams);
        if (brandId === 'all') {
            params.delete('brand');
        } else {
            params.set('brand', brandId);
        }
        setSearchParams(params);
    };

    const toggleExpand = (catId: string) => {
        setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    // Separate parent and child categories
    const parentCategories = categories.filter(c => !c.parent_id);
    const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId);

    // Nested Accordion Category list — shared between desktop sidebar & mobile
    const NestedCategoryList = () => (
        <div className="flex flex-col gap-0.5">
            {/* "All" button */}
            <button
                onClick={() => handleCategoryClick('all')}
                className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !activeCategoryId || activeCategoryId === 'all'
                        ? 'bg-gold-400 text-black font-extrabold'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
                style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
            >
                <span>🏠</span>
                <span>{t('allCategories')}</span>
            </button>

            {/* Parent categories with optional accordion for children */}
            {parentCategories.map((parent) => {
                const children = getChildren(parent.id);
                const hasChildren = children.length > 0;
                const isExpanded = !!expandedCats[parent.id];
                const isParentActive = activeCategoryId === parent.id;
                const isChildActive = children.some(c => c.id === activeCategoryId);
                const isHighlighted = isParentActive || isChildActive;

                return (
                    <div key={parent.id}>
                        {/* Parent row */}
                        <div
                            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                                isHighlighted
                                    ? 'bg-gold-400/15 text-gold-400 border border-gold-400/30'
                                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
                            }`}
                        >
                            {/* Category name — clicking selects it */}
                            <button
                                onClick={() => handleCategoryClick(parent.id)}
                                className="flex items-center gap-2 flex-1 cursor-pointer text-left"
                                style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
                            >
                                <span className="text-sm">{parent.image_url ? <img src={parent.image_url} className="w-4 h-4 rounded object-cover" /> : '📂'}</span>
                                <span className={isHighlighted ? 'font-extrabold' : ''}>{getLocalized(parent, 'name')}</span>
                            </button>

                            {/* Expand arrow — only if has children */}
                            {hasChildren && (
                                <button
                                    onClick={() => toggleExpand(parent.id)}
                                    className="p-1 rounded cursor-pointer flex-shrink-0 hover:text-gold-400 transition-colors"
                                >
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                </button>
                            )}
                        </div>

                        {/* Children — animated slide */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className={`flex flex-col gap-0.5 mt-0.5 ${direction === 'rtl' ? 'mr-4 pr-2 border-r border-zinc-800' : 'ml-4 pl-2 border-l border-zinc-800'}`}>
                                {children.map((child) => {
                                    const isChildSelected = activeCategoryId === child.id;
                                    return (
                                        <button
                                            key={child.id}
                                            onClick={() => handleCategoryClick(child.id)}
                                            className={`w-full flex items-center gap-2 py-1.5 px-3 rounded-lg text-[11px] transition-all cursor-pointer ${
                                                isChildSelected
                                                    ? 'bg-gold-400 text-black font-extrabold'
                                                    : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
                                            }`}
                                            style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
                                        >
                                            <span className="text-zinc-600 text-[10px]">{direction === 'rtl' ? '←' : '→'}</span>
                                            <span>{getLocalized(child, 'name')}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 select-none">

            {/* Header */}
            <div className="py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 mb-8">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-100 flex items-center gap-2">
                        <span>{searchQuery ? `${t('searchResult')}: "${searchQuery}"` : t('categories')}</span>
                    </h1>
                    <p className="text-xs md:text-sm text-zinc-550 mt-1 font-light">
                        {direction === 'rtl' ? `عرض ${filteredProducts.length} منتج` : `Showing ${filteredProducts.length} products`}
                    </p>
                </div>

                {(activeCategoryId || activeBrandId || searchQuery) && (
                    <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1.5 px-4 py-2 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-400 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                    >
                        <Trash2 size={13} />
                        <span>{t('clearFilters')}</span>
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-start">

                {/* ── Desktop Sidebar ── */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-6 bg-[#0d0d11]/25 border border-zinc-900/60 p-5 rounded-2xl sticky top-28 hidden md:block">

                    <div className="flex items-center gap-2 text-zinc-300 font-extrabold uppercase text-xs tracking-widest pb-3 border-b border-zinc-900">
                        <SlidersHorizontal size={14} className="text-gold-400" />
                        <span>Filters</span>
                    </div>

                    {/* Nested Category Accordion */}
                    <div className="space-y-2">
                        <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">{t('filterByCategory')}</h4>
                        <NestedCategoryList />
                    </div>

                    {/* Brands */}
                    <div className="space-y-2 pt-4 border-t border-zinc-900/80">
                        <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">{t('filterByBrand')}</h4>
                        <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto scrollbar-thin">
                            <button
                                onClick={() => handleBrandClick('all')}
                                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                                    !activeBrandId || activeBrandId === 'all'
                                        ? 'bg-gold-400 text-black font-extrabold'
                                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                                }`}
                                style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
                            >
                                {direction === 'rtl' ? 'جميع الماركات' : 'All Brands'}
                            </button>
                            {brands.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => handleBrandClick(b.id)}
                                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                                        activeBrandId === b.id
                                            ? 'bg-gold-400 text-black font-extrabold'
                                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                                    }`}
                                    style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── Mobile Filters ── */}
                <div className="md:hidden w-full flex flex-col gap-3 mb-4">
                    {/* Category accordion — mobile horizontal doesn't work well for nested, use a compact vertical */}
                    <div className="bg-[#0d0d11]/40 border border-zinc-900 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] uppercase font-extrabold text-zinc-500 tracking-widest">{t('filterByCategory')}</p>
                        <NestedCategoryList />
                    </div>

                    {/* Brand pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            onClick={() => handleBrandClick('all')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 cursor-pointer ${
                                !activeBrandId || activeBrandId === 'all'
                                    ? 'bg-gold-400 text-black'
                                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                        >
                            {direction === 'rtl' ? 'كل الماركات' : 'All Brands'}
                        </button>
                        {brands.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => handleBrandClick(b.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 cursor-pointer ${
                                    activeBrandId === b.id
                                        ? 'bg-gold-400 text-black'
                                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                                }`}
                            >
                                {b.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Products Grid ── */}
                <div className="flex-1 w-full space-y-12">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 4, 8, 12, 16].map((i) => (
                                <div key={i} className="aspect-[3/4] bg-zinc-950 shimmer rounded-2xl border border-zinc-900" />
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-950/40 border border-zinc-900 rounded-3xl space-y-3">
                            <p className="text-zinc-400 font-medium">{t('noProducts')}</p>
                            <button onClick={clearAllFilters} className="text-xs text-gold-400 underline font-bold tracking-wide cursor-pointer">
                                {t('clearFilters')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 pt-10 border-t border-zinc-900/60 font-sans">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="p-2 px-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs font-bold"
                                    >
                                        {direction === 'rtl' ? 'السابق' : 'Previous'}
                                    </button>
                                    <span className="text-zinc-500 text-xs font-semibold">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="p-2 px-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs font-bold"
                                    >
                                        {direction === 'rtl' ? 'التالي' : 'Next'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Slider } from '../components/Slider';
import { ProductCard } from '../components/ProductCard';
import { CategoryTree } from '../components/CategoryTree';
import { useScrollReveal, useScrollRevealChildren, useGoldDivider } from '../hooks/useScrollReveal';
import { ArrowRight, ArrowLeft, ArrowUpRight } from 'lucide-react';

/** Returns true if cat is a descendant (at any depth) of ancestorId */
function isDescendantOf(
    cat: { parent_id?: string | null },
    ancestorId: string,
    allCats: { id: string; parent_id?: string | null }[],
): boolean {
    const map = Object.fromEntries(allCats.map(c => [c.id, c]));
    let current: { parent_id?: string | null } | undefined = cat;
    while (current?.parent_id) {
        if (current.parent_id === ancestorId) return true;
        current = map[current.parent_id];
    }
    return false;
}

/* ── Small helper: animated section heading ──────────────────────────────────
   Renders the title + gold divider used in multiple sections.
   The divider uses .gold-divider class → triggered by useGoldDivider.        */
const SectionHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
    const titleRef   = useScrollReveal<HTMLDivElement>(0.3);
    const dividerRef = useGoldDivider<HTMLSpanElement>();
    return (
        <div className="text-center space-y-2 mb-8 md:mb-10">
            <div ref={titleRef} className="reveal">
                <h2 className="text-xl md:text-3xl font-extrabold tracking-wide uppercase text-zinc-100 font-sans">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-zinc-500 text-xs md:text-sm font-light mt-1">{subtitle}</p>
                )}
            </div>
            {/* gold-divider: CSS transition triggered when .is-visible is added */}
            <span ref={dividerRef} className="gold-divider" />
        </div>
    );
};

export const Home: React.FC = () => {
    const { direction, t, getLocalized } = useLanguage();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<any[]>([]);
    const [brands,     setBrands]     = useState<any[]>([]);
    const [products,   setProducts]   = useState<any[]>([]);
    const [ads,        setAds]        = useState<any[]>([]);
    const [loading,    setLoading]    = useState(true);
    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
    const [showAllCategories, setShowAllCategories] = useState(false);

    // ── Scroll-reveal refs ────────────────────────────────────────────────────
    const adsRef      = useScrollReveal<HTMLElement>(0.1);
    const catsRef     = useScrollReveal<HTMLElement>(0.1);
    const prodsRef    = useScrollReveal<HTMLElement>(0.08);
    const brandsRef   = useScrollReveal<HTMLElement>(0.1);
    // Stagger-reveal product grid cards
    const cardsGridRef = useScrollRevealChildren<HTMLDivElement>('.card-lift', 0.05);

    useEffect(() => {
        async function loadHomeData() {
            try {
                const [catsRes, brandsRes, prodsRes, adsRes] = await Promise.all([
                    api.categories.listPublic(),
                    api.brands.listPublic(),
                    api.products.listPublic(1, 8),
                    api.ads.listPublic(),
                ]);
                setCategories(catsRes.data.filter((c: any) => c.is_active));
                setBrands(brandsRes.data);
                setProducts(prodsRes.data);
                setAds(adsRes.data.filter((a: any) => a.is_active));
            } catch (err) {
                console.error('Failed to load home feed', err);
            } finally {
                setLoading(false);
            }
        }
        loadHomeData();
    }, []);

    return (
        <div className="space-y-16 pb-20 select-none">

            {/* ── 1. Hero ── */}
            <section className="px-4 md:px-8 mt-4">
                <Slider />
            </section>

            {/* ── 2. Promo ads ── */}
            {!loading && ads.length > 0 && (
                <section ref={adsRef} className="reveal px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {ads.slice(0, 2).map((ad, i) => {
                            const hasValidImage = ad.image_url && ad.image_url.startsWith('http');
                            return (
                                <Link
                                    key={ad.id}
                                    to="/products?category=all"
                                    className="group relative h-[180px] md:h-[240px] rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center cursor-pointer"
                                    style={{ transitionDelay: `${i * 120}ms` }}
                                >
                                    {/* Background Image or Gradient */}
                                    {hasValidImage ? (
                                        <>
                                            <img
                                                src={ad.image_url}
                                                alt={getLocalized(ad, 'description') || 'Ad'}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // Fallback if image fails to load
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 pointer-events-none" />
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-gold-900/20 via-zinc-900 to-black" />
                                    )}
                                    
                                    <div className="relative z-10 p-6 md:p-10 max-w-md space-y-2 md:space-y-3">
                                        <span className="inline-block text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/30">
                                            {direction === 'rtl' ? 'عرض خاص' : 'Special Offer'}
                                        </span>
                                        <h3 className="text-lg md:text-2xl font-extrabold text-white leading-snug">
                                            {getLocalized(ad, 'description') || (direction === 'rtl' ? 'اكتشف عروضنا الحصرية' : 'Discover Exclusive Offers')}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gold-400 group-hover:text-gold-300 transition-colors">
                                            <span>{direction === 'rtl' ? 'تسوق الآن' : 'Shop Now'}</span>
                                            <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── 3. Categories ── */}
            <section ref={catsRef} className="reveal max-w-7xl mx-auto px-4 md:px-8">
                <SectionHeading title={t('shopCategory')} />

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                        {[1, 2, 3, 4].map((idx) => (
                            <div key={idx} className="h-14 bg-zinc-900 rounded-xl shimmer" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {categories
                                .filter(c => !c.parent_id)
                                .slice(0, showAllCategories ? undefined : 4)
                                .map((cat) => (
                                    <CategoryTree
                                        key={cat.id}
                                        categories={categories.filter(c =>
                                            c.id === cat.id || isDescendantOf(c, cat.id, categories)
                                        )}
                                        activeCategoryId={null}
                                        direction={direction}
                                        onSelect={(id) => navigate(`/products?category=${id}`)}
                                        expandedIds={expandedCats}
                                        onToggle={(id) =>
                                            setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }))
                                        }
                                        getLocalized={getLocalized}
                                        variant="home"
                                    />
                                ))}
                        </div>
                        
                        {/* Show "View All Categories" button if more than 4 categories */}
                        {categories.filter(c => !c.parent_id).length > 4 && !showAllCategories && (
                            <div className="flex justify-center pt-2">
                                <button
                                    onClick={() => setShowAllCategories(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-gold-400/50 text-zinc-300 hover:text-gold-400 rounded-xl text-sm font-bold transition-all cursor-pointer"
                                >
                                    <span>{direction === 'rtl' ? 'عرض جميع الفئات' : 'View All Categories'}</span>
                                    {direction === 'rtl' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* ── 4. Featured Products ── */}
            <section ref={prodsRef} className="reveal max-w-7xl mx-auto px-4 md:px-8 space-y-8">
                {/* Section header row */}
                <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-3xl font-extrabold tracking-wide uppercase text-zinc-100 font-sans">
                            {t('featuredProducts')}
                        </h2>
                        <p className="text-zinc-500 text-xs md:text-sm font-light">
                            Premium selections curated by our beauty experts
                        </p>
                    </div>
                    <Link
                        to="/products?category=all"
                        className="text-xs md:text-sm font-bold text-gold-400 hover:text-gold-500 flex items-center gap-1 transition-colors uppercase tracking-wider"
                    >
                        <span>{direction === 'rtl' ? 'عرض الكل' : 'View All'}</span>
                        {direction === 'rtl' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 4, 8].map((idx) => (
                            <div key={idx} className="aspect-[3/4] bg-zinc-950 shimmer border border-zinc-900 rounded-2xl" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-zinc-500">{t('noProducts')}</p>
                    </div>
                ) : (
                    /* cardsGridRef stagger-reveals each .card-lift child */
                    <div
                        ref={cardsGridRef}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
                    >
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── 5. Brands ── */}
            <section ref={brandsRef} className="reveal max-w-7xl mx-auto px-4 md:px-8 border-t border-zinc-900 pt-16">
                <SectionHeading title={t('shopBrand')} />

                {loading ? (
                    <div className="flex justify-center gap-12 py-4 overflow-x-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-24 h-12 bg-zinc-900 shimmer rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                        {brands.map((brand, i) => (
                            <Link
                                key={brand.id}
                                to={`/products?brand=${brand.id}`}
                                className="h-10 md:h-14 flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer transform hover:scale-105"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                {brand.image_url ? (
                                    <img
                                        src={brand.image_url}
                                        alt={brand.name}
                                        className="max-h-full max-w-[120px] md:max-w-[180px] object-contain"
                                    />
                                ) : (
                                    <span className="text-lg md:text-2xl font-extrabold font-sans tracking-widest text-[#f5ecd2]">
                                        {brand.name}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};

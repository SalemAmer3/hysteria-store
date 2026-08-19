import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Slider } from '../components/Slider';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, ArrowLeft, ArrowUpRight, ChevronDown } from 'lucide-react';

export const Home: React.FC = () => {
    const { direction, t, getLocalized } = useLanguage();
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

    useEffect(() => {
        async function loadHomeData() {
            try {
                const [catsRes, brandsRes, prodsRes, adsRes] = await Promise.all([
                    api.categories.listPublic(),
                    api.brands.listPublic(),
                    api.products.listPublic(1, 8), // fetch top 8 products for homepage
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

            {/* 1. Hero Carousel section */}
            <section className="px-4 md:px-8 mt-4">
                <Slider />
            </section>

            {/* 2. Announcement Promo banner (if active ads exist) */}
            {ads.length > 0 && (
                <section className="px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ads.slice(0, 2).map((ad) => (
                            <div
                                key={ad.id}
                                className="group relative h-[180px] md:h-[220px] rounded-3xl overflow-hidden border border-zinc-900 shadow-2xl bg-zinc-950 flex items-center p-8 md:p-12"
                            >
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60" style={{ backgroundImage: `url('${ad.image_url}')` }} />
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />
                                <div className="relative z-10 max-w-xs space-y-2.5">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">Exclusive Promo</span>
                                    <h3 className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-2">
                                        {getLocalized(ad, 'description') || 'Discover New Offerings'}
                                    </h3>
                                    <Link
                                        to="/products?category=all"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-gold-400 transition-colors uppercase tracking-wider"
                                    >
                                        <span>{direction === 'rtl' ? 'تسوق الان' : 'Shop Now'}</span>
                                        <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. Category Navigation - Accordion style */}
            <section className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-xl md:text-3xl font-extrabold tracking-wide uppercase text-zinc-100 font-sans">
                        {t('shopCategory')}
                    </h2>
                    <div className="w-12 h-0.5 bg-gold-400 mx-auto" />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                        {[1, 2, 3, 4].map((idx) => (
                            <div key={idx} className="h-14 bg-zinc-900 rounded-xl shimmer" />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categories.filter(c => !c.parent_id).map((cat) => {
                            const children = categories.filter(c => c.parent_id === cat.id);
                            const hasChildren = children.length > 0;
                            const isExpanded = !!expandedCats[cat.id];

                            return (
                                <div key={cat.id} className="flex flex-col">
                                    {/* Parent row */}
                                    <div className={`flex items-center justify-between rounded-xl border transition-all duration-200 overflow-hidden ${isExpanded ? 'border-gold-400/40 bg-zinc-900' : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'}`}>
                                        <Link
                                            to={`/products?category=${cat.id}`}
                                            className="flex items-center gap-3 flex-1 px-4 py-3.5 group"
                                        >
                                            {cat.image_url && (
                                                <img src={cat.image_url} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                                            )}
                                            <span className={`text-sm font-bold transition-colors ${isExpanded ? 'text-gold-400' : 'text-zinc-300 group-hover:text-gold-400'}`}>
                                                {getLocalized(cat, 'name')}
                                            </span>
                                        </Link>
                                        {hasChildren && (
                                            <button
                                                onClick={() => setExpandedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                                                className="px-3 py-3.5 text-zinc-500 hover:text-gold-400 transition-colors cursor-pointer flex-shrink-0"
                                            >
                                                <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-gold-400' : ''}`} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Children - slide down */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-80 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                        <div className={`flex flex-col gap-0.5 ${direction === 'rtl' ? 'mr-3 pr-3 border-r-2 border-gold-400/20' : 'ml-3 pl-3 border-l-2 border-gold-400/20'}`}>
                                            {children.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    to={`/products?category=${child.id}`}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all group"
                                                >
                                                    {child.image_url && (
                                                        <img src={child.image_url} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0 opacity-70 group-hover:opacity-100" />
                                                    )}
                                                    <span className="text-zinc-600 text-[10px]">{direction === 'rtl' ? '←' : '→'}</span>
                                                    <span>{getLocalized(child, 'name')}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 4. Products Grid Showcase */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* 5. Luxury Brand Showcase banner */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 border-t border-zinc-900 pt-16">
                <div className="text-center space-y-2 mb-10">
                    <h2 className="text-xl md:text-3xl font-extrabold tracking-wide uppercase text-zinc-100 font-sans">
                        {t('shopBrand')}
                    </h2>
                    <div className="w-12 h-0.5 bg-gold-400 mx-auto" />
                </div>

                {loading ? (
                    <div className="flex justify-center gap-12 py-4 overflow-x-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-24 h-12 bg-zinc-900 shimmer rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                to={`/products?brand=${brand.id}`}
                                className="h-10 md:h-14 flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer transform hover:scale-105"
                            >
                                {brand.image_url ? (
                                    <img
                                        src={brand.image_url}
                                        alt={brand.name}
                                        className="max-h-full max-w-[120px] md:max-w-[180px] object-contain"
                                    />
                                ) : (
                                    <span className="text-lg md:text-2xl font-extrabold font-sans tracking-widest text-[#f5ecd2]">{brand.name}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};


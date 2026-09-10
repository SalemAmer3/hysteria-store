import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { parseSizeLabel } from '../utils/sizeLabel';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description?: string | null;
        arabic?: string | null;
        hebrew?: string | null;
        brand?: { name: string } | null;
        images?: Array<{ image_url: string }>;
        options?: Array<{
            id: string;
            size?: string | null;
            color_name?: string | null;
            price: number;
        }>;
    };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { getLocalized, t, language } = useLanguage();
    const { toggleWishlist, isInWishlist, addToCart } = useCart();
    const heartRef = useRef<HTMLButtonElement>(null);
    const [heartAnimating, setHeartAnimating] = useState(false);

    const handleWishlistClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);

        // micro-animation: add class, remove after animation completes
        if (heartRef.current && !heartAnimating) {
            setHeartAnimating(true);
            heartRef.current.classList.add('heart-pop');
            const onEnd = () => {
                heartRef.current?.classList.remove('heart-pop');
                setHeartAnimating(false);
            };
            heartRef.current.addEventListener('animationend', onEnd, { once: true });
        }
    }, [product, toggleWishlist, heartAnimating]);

    const handleQuickAdd = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.options && product.options.length > 0) {
            addToCart(product, product.options[0], 1);
        }
    }, [product, addToCart]);

    const prices = product.options?.map((o) => Number(o.price)) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    const displayName  = getLocalized(product, 'name');
    const displayBrand = product.brand?.name || '';

    const primaryImage = product.images && product.images.length > 0
        ? product.images[0].image_url
        : 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=80';

    const hasOptions   = product.options && product.options.length > 0;
    const wishlistActive = isInWishlist(product.id);

    return (
        /* card-lift adds the translateY(-4px) + shadow on hover via CSS */
        <div className="group relative bg-[#0d0d11]/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-gold-400/40 hover:bg-[#0d0d11]/80 transition-all duration-500 flex flex-col h-full shadow-2xl card-lift">

            {/* ── Product Image Wrapper ── */}
            <Link to={`/products/${product.id}`} className="relative block overflow-hidden aspect-[4/5] bg-zinc-950">

                {/* Wishlist Heart — micro-animation on click */}
                <button
                    ref={heartRef}
                    onClick={handleWishlistClick}
                    className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${
                        wishlistActive
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : 'bg-black/60 text-zinc-400 hover:text-white border border-zinc-800/80'
                    }`}
                    aria-label="Add to wishlist"
                >
                    <Heart
                        size={16}
                        className={wishlistActive ? 'fill-rose-500' : ''}
                    />
                </button>

                {/* Brand tag */}
                {prices.length > 0 && (
                    <div className="absolute bottom-4 left-4 z-10 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800 text-[10px] uppercase tracking-wider font-extrabold text-gold-400">
                        {displayBrand || 'Histeria'}
                    </div>
                )}

                {/* Product image — scale on hover, independent of card-lift translateY */}
                <img
                    src={primaryImage}
                    alt={displayName}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    style={{ willChange: 'transform' }}
                    loading="lazy"
                />

                {/* "View Product" button — slides up from bottom on hover */}
                <div className="card-view-btn" aria-hidden="true">
                    <Eye size={13} strokeWidth={2.5} />
                    <span>{t('viewProduct') || 'View Product'}</span>
                </div>

                {/* Sizes strip — with unit labels */}
                {hasOptions && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pb-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-wrap gap-1.5 justify-center items-center">
                        {product.options?.map((o) => {
                            const { label } = parseSizeLabel(o.size, language as any);
                            return label ? (
                                <span
                                    key={o.id}
                                    className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-300"
                                >
                                    {label}
                                </span>
                            ) : null;
                        })}
                    </div>
                )}
            </Link>

            {/* ── Info Container ── */}
            <div className="p-5 flex flex-col flex-grow select-none">

                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold font-sans mb-1 block">
                    {displayBrand}
                </span>

                <Link
                    to={`/products/${product.id}`}
                    className="text-zinc-100 font-medium text-sm md:text-base line-clamp-1 hover:text-gold-400 transition-colors flex-grow mb-1"
                >
                    {displayName}
                </Link>

                <p className="text-zinc-500 text-xs line-clamp-2 mb-4 leading-relaxed flex-grow">
                    {getLocalized(product, 'description') || 'Histeria specialty luxury collection.'}
                </p>

                {/* Footer: Price & Quick-add */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-900/60">

                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t('price')}</span>
                        <span className="font-sans text-base font-extrabold text-[#f5ecd2]">
                            {minPrice === maxPrice
                                ? `₪${minPrice}`
                                : `₪${minPrice} – ₪${maxPrice}`}
                        </span>
                    </div>

                    {/* Quick Add — btn-shine adds sweep on hover */}
                    {hasOptions && (
                        <button
                            onClick={handleQuickAdd}
                            type="button"
                            className="p-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-black font-extrabold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-gold-500/10 btn-shine"
                            title={t('addToCart')}
                        >
                            <ShoppingBag size={18} />
                        </button>
                    )}

                </div>
            </div>

        </div>
    );
};

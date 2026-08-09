import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag } from 'lucide-react';

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
    const { getLocalized, t } = useLanguage();
    const { toggleWishlist, isInWishlist, addToCart } = useCart();

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.options && product.options.length > 0) {
            // Add the first option by default
            addToCart(product, product.options[0], 1);
        }
    };

    // Find lowest price
    const prices = product.options?.map((o) => Number(o.price)) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    const displayName = getLocalized(product, 'name');
    const displayBrand = product.brand?.name || '';

    // Get primary image
    const primaryImage = product.images && product.images.length > 0
        ? product.images[0].image_url
        : 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=80'; // fallback luxury perfume image

    const hasOptions = product.options && product.options.length > 0;
    const wishlistActive = isInWishlist(product.id);

    return (
        <div className="group relative bg-[#0d0d11]/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-gold-400/40 hover:bg-[#0d0d11]/80 transition-all duration-500 flex flex-col h-full shadow-2xl">

            {/* Product Image Wrapper */}
            <Link to={`/products/${product.id}`} className="relative block overflow-hidden aspect-[4/5] bg-zinc-950">

                {/* Wishlist Heart Icon */}
                <button
                    onClick={handleWishlistClick}
                    className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${wishlistActive
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : 'bg-black/60 text-zinc-400 hover:text-white border border-zinc-800/80'
                        }`}
                    aria-label="Add to wishlist"
                >
                    <Heart size={16} className={wishlistActive ? 'fill-rose-500' : ''} />
                </button>

                {/* Brand/Discount tag */}
                {prices.length > 0 && (
                    <div className="absolute bottom-4 left-4 z-10 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800 text-[10px] uppercase tracking-wider font-extrabold text-gold-400">
                        {displayBrand || 'Histeria'}
                    </div>
                )}

                <img
                    src={primaryImage}
                    alt={displayName}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                />

                {/* Overlay showing sizes */}
                {hasOptions && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-wrap gap-1.5 justify-center items-center">
                        {product.options?.map((o) => (
                            o.size && (
                                <span
                                    key={o.id}
                                    className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-300"
                                >
                                    {getLocalized(o, 'size')}
                                </span>
                            )
                        ))}
                    </div>
                )}
            </Link>

            {/* Info Container */}
            <div className="p-5 flex flex-col flex-grow select-none">

                {/* Brand name */}
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold font-sans mb-1 block">
                    {displayBrand}
                </span>

                {/* Title */}
                <Link
                    to={`/products/${product.id}`}
                    className="text-zinc-100 font-medium text-sm md:text-base line-clamp-1 hover:text-gold-400 transition-colors flex-grow mb-1"
                >
                    {displayName}
                </Link>

                {/* Description brief */}
                <p className="text-zinc-500 text-xs line-clamp-2 mb-4 leading-relaxed flex-grow">
                    {getLocalized(product, 'description') || 'Histeria specialty luxury collection.'}
                </p>

                {/* Footer Area: Price & Action */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-900/60">

                    {/* Price */}
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t('price')}</span>
                        <span className="font-sans text-base font-extrabold text-[#f5ecd2]">
                            {minPrice === maxPrice ? (
                                `₪${minPrice}`
                            ) : (
                                `₪${minPrice} - ₪${maxPrice}`
                            )}
                        </span>
                    </div>

                    {/* Quick Add To Cart */}
                    {hasOptions && (
                        <button
                            onClick={handleQuickAdd}
                            type="button"
                            className="p-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-black font-extrabold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-gold-500/10"
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

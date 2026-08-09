import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
    const { wishlist, toggleWishlist, addToCart } = useCart();
    const { getLocalized, direction, t } = useLanguage();

    const handleAddToCart = (product: any) => {
        if (product.options && product.options.length > 0) {
            addToCart(product, product.options[0], 1);
        }
    };

    if (wishlist.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-6 select-none font-sans">
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto border border-zinc-800 text-zinc-600">
                    <Heart size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-300">{t('wishlist')}</h2>
                    <p className="text-sm text-zinc-500">{direction === 'rtl' ? 'لا توجد منتجات في المفضلة حتى الآن.' : 'No products in wishlist yet.'}</p>
                </div>
                <Link to="/products?category=all" className="inline-block px-8 py-3.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-black text-xs font-extrabold transition-all uppercase tracking-wider cursor-pointer shadow-lg">
                    {direction === 'rtl' ? 'تصفح المنتجات' : 'Browse Products'}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 select-none font-sans" dir={direction}>
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 border-b border-zinc-900 pb-5 mb-8 flex items-center gap-3">
                <Heart size={26} className="text-rose-500 fill-rose-500" />
                <span>{t('wishlist')}</span>
                <span className="text-base font-normal text-zinc-500">({wishlist.length})</span>
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {wishlist.map((product) => {
                    const name = getLocalized(product, 'name');
                    const img = product.images?.[0]?.image_url || '';
                    const price = product.options?.[0]?.price ? `₪${product.options[0].price}` : '';

                    return (
                        <div key={product.id} className="group bg-[#0d0d11]/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-gold-400/30 transition-all duration-300 flex flex-col">
                            <Link to={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-zinc-950">
                                {img
                                    ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Heart size={32} /></div>
                                }
                            </Link>
                            <div className="p-4 flex flex-col gap-3 flex-grow">
                                <Link to={`/products/${product.id}`} className="text-zinc-200 text-sm font-semibold line-clamp-1 hover:text-gold-400 transition-colors">{name}</Link>
                                {price && <span className="text-gold-400 font-extrabold text-sm font-sans">{price}</span>}
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-gold-400 hover:bg-gold-500 text-black text-[10px] font-extrabold transition-all cursor-pointer tracking-wide"
                                    >
                                        <ShoppingBag size={13} />
                                        <span>{t('addToCart')}</span>
                                    </button>
                                    <button
                                        onClick={() => toggleWishlist(product)}
                                        className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 border border-zinc-800 transition-colors cursor-pointer"
                                        title={t('removedFromWishlist')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

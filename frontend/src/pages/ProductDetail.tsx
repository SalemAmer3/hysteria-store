import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Heart, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getLocalized, direction, t } = useLanguage();
    const { addToCart, toggleWishlist, isInWishlist } = useCart();
    const navigate = useNavigate();

    const [product, setProduct] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeImage, setActiveImage] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<any | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedShade, setSelectedShade] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

    useEffect(() => {
        async function loadProduct() {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const res = await api.products.getPublic(id);
                const prod = res.data;
                setProduct(prod);

                // Set default selected option and color/shade/size states
                if (prod.options && prod.options.length > 0) {
                    const firstOpt = prod.options[0];
                    setSelectedOption(firstOpt);
                    setSelectedColor(firstOpt.color_name || null);
                    setSelectedShade(firstOpt.shade || null);
                    setSelectedSize(firstOpt.size || null);
                }

                // Set default primary image
                if (prod.images && prod.images.length > 0) {
                    setActiveImage(prod.images[0].image_url);
                } else if (prod.options && prod.options.some((o: any) => o.image_url)) {
                    const optWithImg = prod.options.find((o: any) => o.image_url);
                    setActiveImage(optWithImg.image_url);
                } else {
                    setActiveImage('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80');
                }

                // Load related products from same category
                if (prod.category_id) {
                    const publicProds = await api.products.listPublic(1, 4);
                    const items = publicProds.data.filter((p: any) => p.category_id === prod.category_id && p.id !== prod.id);
                    setRelatedProducts(items);
                }
            } catch (err: any) {
                setError(err.message || 'Product not found');
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [id]);

    // Adjust active image to option image if user selects color with image
    useEffect(() => {
        if (selectedOption?.image_url) {
            setActiveImage(selectedOption.image_url);
        }
    }, [selectedOption]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 animate-pulse space-y-12">
                <div className="flex flex-col md:flex-row gap-12">
                    <div className="w-full md:w-1/2 aspect-square bg-zinc-950 rounded-3xl shimmer" />
                    <div className="w-full md:w-1/2 space-y-6">
                        <div className="w-24 h-4 bg-zinc-900 rounded" />
                        <div className="w-64 h-8 bg-zinc-900 rounded" />
                        <div className="w-96 h-20 bg-zinc-900 rounded" />
                        <div className="w-32 h-6 bg-zinc-900 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
                <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-zinc-400 font-medium">
                    {error || 'The requested product could not be loaded.'}
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 mx-auto text-xs font-bold text-gold-400 hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                    <span>{direction === 'rtl' ? 'الرجوج للخلف' : 'Go Back'}</span>
                </button>
            </div>
        );
    }

    const name = getLocalized(product, 'name');
    const details = getLocalized(product, 'description');
    const brandName = product.brand?.name || '';
    const categoryName = product.category?.name || '';
    const wishlistActive = isInWishlist(product.id);

    // Options filtering & selector helpers
    const options = product.options || [];

    const uniqueColors = Array.from(
        new Set(options.map((o: any) => o.color_name).filter(Boolean))
    ) as string[];

    const availableShades = Array.from(
        new Set(
            options
                .filter((o: any) => !selectedColor || o.color_name === selectedColor)
                .map((o: any) => o.shade)
                .filter(Boolean)
        )
    ) as string[];

    const availableSizes = Array.from(
        new Set(
            options
                .filter((o: any) =>
                    (!selectedColor || o.color_name === selectedColor) &&
                    (!selectedShade || o.shade === selectedShade)
                )
                .map((o: any) => o.size)
                .filter(Boolean)
        )
    ) as string[];

    const handleSelectColor = (c: string) => {
        setSelectedColor(c);
        const shades = Array.from(new Set(options.filter((o: any) => o.color_name === c).map((o: any) => o.shade).filter(Boolean))) as string[];
        const newShade = shades[0] || null;
        setSelectedShade(newShade);

        const sizes = Array.from(new Set(options.filter((o: any) => o.color_name === c && (!newShade || o.shade === newShade)).map((o: any) => o.size).filter(Boolean))) as string[];
        const newSize = sizes[0] || null;
        setSelectedSize(newSize);

        const match = options.find((o: any) => o.color_name === c && (!newShade || o.shade === newShade) && (!newSize || o.size === newSize)) || options.find((o: any) => o.color_name === c);
        if (match) setSelectedOption(match);
    };

    const handleSelectShade = (s: string) => {
        setSelectedShade(s);
        const sizes = Array.from(new Set(options.filter((o: any) => (!selectedColor || o.color_name === selectedColor) && o.shade === s).map((o: any) => o.size).filter(Boolean))) as string[];
        const newSize = sizes[0] || null;
        setSelectedSize(newSize);

        const match = options.find((o: any) => (!selectedColor || o.color_name === selectedColor) && o.shade === s && (!newSize || o.size === newSize)) || options.find((o: any) => (!selectedColor || o.color_name === selectedColor) && o.shade === s);
        if (match) setSelectedOption(match);
    };

    const handleSelectSize = (sz: string) => {
        setSelectedSize(sz);
        const match = options.find((o: any) =>
            (!selectedColor || o.color_name === selectedColor) &&
            (!selectedShade || o.shade === selectedShade) &&
            o.size === sz
        );
        if (match) setSelectedOption(match);
    };

    const handleAddToCart = () => {
        if (!selectedOption) return;
        addToCart(product, selectedOption, quantity);
    };

    const handleBuyNow = () => {
        if (!selectedOption) return;
        addToCart(product, selectedOption, quantity);
        navigate('/cart');
    };

    // Collect all unique option images
    const allImages = [
        ...(product.images || []).map((img: any) => img.image_url),
        ...options.map((o: any) => o.image_url).filter(Boolean)
    ].filter((url, idx, self) => self.indexOf(url) === idx); // unique list

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 select-none font-sans" dir={direction}>

            {/* Back button link */}
            <div className="py-4 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                    <ArrowLeft size={14} className={direction === 'rtl' ? 'rotate-180' : ''} />
                    <span>{direction === 'rtl' ? 'الرجوع للمنتجات' : 'Back to products'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                {/* Left Side: Images Viewer Gallery */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] w-full rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-900 relative shadow-2xl">
                        <img
                            src={activeImage}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                        {wishlistActive && (
                            <span className="absolute top-4 right-4 bg-rose-500/10 text-rose-500 border border-rose-500/30 px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full backdrop-blur-md">
                                Liked
                            </span>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none justify-center">
                            {allImages.map((imgUrl, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(imgUrl)}
                                    className={`w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 bg-zinc-950 transition-all cursor-pointer ${activeImage === imgUrl ? 'border-gold-400 scale-95 shadow-md' : 'border-zinc-900 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={imgUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Description, Options Selection */}
                <div className="bg-zinc-950/40 border border-zinc-900 p-6 md:p-10 rounded-3xl space-y-8 shadow-2xl">

                    {/* Brand & Title */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-xs uppercase font-extrabold tracking-widest text-gold-400">
                                {brandName}
                            </span>
                            <button
                                onClick={() => toggleWishlist(product)}
                                className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer ${wishlistActive
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                                title={t('wishlist')}
                            >
                                <Heart size={18} className={wishlistActive ? 'fill-rose-500' : ''} />
                            </button>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#f5ecd2] leading-tight">
                            {name}
                        </h1>

                        <div className="text-xs text-zinc-550 flex items-center gap-2 font-semibold">
                            <span className="bg-zinc-900 bg-opacity-70 px-2.5 py-1 rounded-md text-zinc-450 border border-zinc-850">
                                {categoryName}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">{t('stockStatus')}</span>
                        </div>
                    </div>

                    {/* Pricing area */}
                    <div className="p-4 bg-zinc-900/35 border border-zinc-900 rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-550 uppercase font-extrabold tracking-wider">{t('price')}</span>
                            <div className="text-2xl md:text-3xl font-sans font-extrabold text-white">
                                ₪{selectedOption ? Number(selectedOption.price).toFixed(2) : 0}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 font-sans">
                            <button
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="w-10 h-10 flex items-center justify-center hover:bg-zinc-900 text-zinc-400 active:text-white text-lg font-bold cursor-pointer"
                            >
                                -
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-zinc-100">{quantity}</span>
                            <button
                                onClick={() => setQuantity(prev => prev + 1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-zinc-900 text-zinc-400 active:text-white text-lg font-bold cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Color / Shade / Size Selectors */}
                    {options.length > 0 && (
                        <div className="space-y-5 border-t border-zinc-900/80 pt-6">

                            {/* Color Selector */}
                            {uniqueColors.length > 0 && (
                                <div className="space-y-2.5">
                                    <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center justify-between">
                                        <span>{t('selectColor')} ({t('color')})</span>
                                        {selectedColor && <span className="text-gold-400 font-bold">{selectedColor}</span>}
                                    </span>
                                    <div className="flex flex-wrap gap-2.5">
                                        {uniqueColors.map((colName) => {
                                            const isSelected = selectedColor === colName;
                                            const matchingOpt = options.find((o: any) => o.color_name === colName);
                                            const hexColor = matchingOpt?.color;

                                            return (
                                                <button
                                                    key={colName}
                                                    type="button"
                                                    onClick={() => handleSelectColor(colName)}
                                                    className={`flex items-center gap-2.5 px-4 py-2.5 border rounded-xl font-sans text-xs transition-all cursor-pointer ${isSelected
                                                        ? 'bg-gold-400 text-black border-gold-400 font-extrabold shadow-lg shadow-gold-500/10 scale-105'
                                                        : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                                                        }`}
                                                >
                                                    {hexColor && (
                                                        <span
                                                            className="w-4 h-4 rounded-full border border-black/40 flex-shrink-0"
                                                            style={{ backgroundColor: hexColor }}
                                                        />
                                                    )}
                                                    <span>{colName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Shade Selector */}
                            {availableShades.length > 0 && (
                                <div className="space-y-2.5">
                                    <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center justify-between">
                                        <span>{t('selectShade')} ({t('shade')})</span>
                                        {selectedShade && <span className="text-gold-400 font-bold">{selectedShade}</span>}
                                    </span>
                                    <div className="flex flex-wrap gap-2.5">
                                        {availableShades.map((shadeName) => {
                                            const isSelected = selectedShade === shadeName;

                                            return (
                                                <button
                                                    key={shadeName}
                                                    type="button"
                                                    onClick={() => handleSelectShade(shadeName)}
                                                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-sans text-xs transition-all cursor-pointer ${isSelected
                                                        ? 'bg-gold-400 text-black border-gold-400 font-extrabold shadow-lg shadow-gold-500/10 scale-105'
                                                        : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                                                        }`}
                                                >
                                                    <span>{shadeName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size Selector */}
                            {availableSizes.length > 0 && (
                                <div className="space-y-2.5">
                                    <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center justify-between">
                                        <span>{t('size')}</span>
                                        {selectedSize && <span className="text-gold-400 font-bold">{selectedSize}</span>}
                                    </span>
                                    <div className="flex flex-wrap gap-2.5">
                                        {availableSizes.map((sz) => {
                                            const isSelected = selectedSize === sz;

                                            return (
                                                <button
                                                    key={sz}
                                                    type="button"
                                                    onClick={() => handleSelectSize(sz)}
                                                    className={`px-4 py-2 border rounded-xl font-sans text-xs transition-all cursor-pointer ${isSelected
                                                        ? 'bg-gold-400 text-black border-gold-400 font-extrabold shadow-lg shadow-gold-500/10 scale-105'
                                                        : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                                                        }`}
                                                >
                                                    <span>{sz}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Fallback flat options if product has no color_name and no shade */}
                            {uniqueColors.length === 0 && availableShades.length === 0 && availableSizes.length === 0 && (
                                <div className="flex flex-wrap gap-2.5">
                                    {options.map((opt: any) => {
                                        const isSelected = selectedOption?.id === opt.id;
                                        const sizeLbl = opt.size ? getLocalized(opt, 'size') : '';
                                        const colLbl = opt.color_name ? getLocalized(opt, 'color_name') : '';
                                        const priceLabel = `₪${opt.price}`;

                                        const pillText = [sizeLbl, colLbl].filter(Boolean).join(' - ');

                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setSelectedOption(opt)}
                                                className={`flex items-center gap-2.5 px-4 py-2 border rounded-xl font-sans text-xs transition-all cursor-pointer ${isSelected
                                                    ? 'bg-gold-400 text-black border-gold-400 font-extrabold shadow-lg shadow-gold-500/10 scale-105'
                                                    : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                                                    }`}
                                            >
                                                {opt.color && (
                                                    <span
                                                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                                                        style={{ backgroundColor: opt.color }}
                                                    />
                                                )}
                                                <span>{pillText || `Option (${priceLabel})`}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    )}

                    {/* Description Block */}
                    <div className="space-y-2 text-xs md:text-sm leading-relaxed border-t border-zinc-900/60 pt-6">
                        <h3 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">{t('details')}</h3>
                        <p className="text-zinc-550 font-light whitespace-pre-line leading-relaxed">
                            {details || 'This brand-new luxury collection has been crafted to make an outstanding impression. Features premium notes and natural essentials.'}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-900/80 pt-6">
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedOption}
                            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 border-2 border-zinc-850 hover:border-gold-400 rounded-2xl bg-zinc-900 hover:bg-zinc-900/20 text-zinc-200 hover:text-white font-extrabold text-sm transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer tracking-wider"
                        >
                            <ShoppingBag size={18} />
                            <span>{t('addToCart')}</span>
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={!selectedOption}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gold-400 hover:bg-gold-500 text-black font-extrabold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer tracking-wider shadow-lg shadow-gold-500/10"
                        >
                            <span>{t('buyNow')}</span>
                        </button>
                    </div>

                    {/* Trust markers */}
                    <div className="grid grid-cols-3 gap-2 px-2 py-4 bg-zinc-900/10 border border-zinc-900/60 rounded-2xl text-[9px] md:text-[10px] text-zinc-500 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <ShieldCheck size={16} className="text-gold-400" />
                            <span>Authentic Original</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <Truck size={16} className="text-gold-400" />
                            <span>Free Delivery &gt; 350₪</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <RefreshCw size={16} className="text-gold-400" />
                            <span>Safety checkout</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Related Products Grid */}
            {relatedProducts.length > 0 && (
                <section className="mt-20 border-t border-zinc-900 pt-16 space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide text-zinc-200 font-sans">
                            {t('relatedProducts')}
                        </h2>
                        <div className="w-12 h-0.5 bg-gold-400 mx-auto" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
};

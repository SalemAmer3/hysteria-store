import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';

export const CartPage: React.FC = () => {
    const {
        cart,
        selectedOptionIds,
        toggleSelectCartItem,
        toggleSelectAll,
        updateQuantity,
        removeFromCart,
        getCartTotal,
        applyCouponCode,
        removeCoupon,
        coupon,
        couponError
    } = useCart();

    const { getLocalized, direction, t } = useLanguage();
    const navigate = useNavigate();

    const [couponCodeVal, setCouponCodeVal] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCodeVal.trim()) return;

        setCouponLoading(true);
        setSuccessMsg(null);
        const success = await applyCouponCode(couponCodeVal.trim());
        setCouponLoading(false);

        if (success) {
            setSuccessMsg(t('couponApplied'));
            setCouponCodeVal('');
        }
    };

    const { subtotal, discount, total } = getCartTotal();
    const allSelected = cart.length > 0 && selectedOptionIds.length === cart.length;
    const noSelected = selectedOptionIds.length === 0;

    if (cart.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-6 select-none font-sans">
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-550 border border-zinc-800">
                    <ShoppingBag size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-300">
                        {t('shoppingBag')}
                    </h2>
                    <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                        {t('cartEmpty')}
                    </p>
                </div>
                <Link
                    to="/products?category=all"
                    className="inline-block px-8 py-3.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-black text-xs font-extrabold transition-all uppercase tracking-wider shadow-lg shadow-gold-500/10 cursor-pointer"
                >
                    {direction === 'rtl' ? 'تصفح منتجاتنا' : 'Browse Products'}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 select-none font-sans" dir={direction}>

            <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-100 border-b border-zinc-900 pb-5 mb-8">
                {t('shoppingBag')}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

                {/* Left Side: Items list */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Select Info banner */}
                    <div className="flex justify-between items-center bg-[#0d0d11]/45 p-4 rounded-xl border border-zinc-900 text-xs text-zinc-400 font-semibold mb-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => toggleSelectAll(e.target.checked)}
                                className="w-4.5 h-4.5 rounded border-zinc-800 bg-zinc-950 text-gold-400 focus:ring-transparent accent-gold-400 cursor-pointer"
                            />
                            <span>{t('selectItemsToOrder')}</span>
                        </label>
                        <span>
                            {selectedOptionIds.length} / {cart.length} {t('itemCount')}
                        </span>
                    </div>

                    {/* Cart Products loop */}
                    {cart.map((item) => {
                        const isSelected = selectedOptionIds.includes(item.option.id);
                        const itemName = getLocalized(item.product, 'name');
                        const itemSize = item.option.size ? getLocalized(item.option, 'size') : '';
                        const itemColor = item.option.color_name ? getLocalized(item.option, 'color_name') : '';
                        const itemShade = item.option.shade ? getLocalized(item.option, 'shade') : '';

                        const optionSubtitle = [itemColor, itemShade, itemSize].filter(Boolean).join(' | ');
                        const primaryImage = item.option.image_url || (item.product.images && item.product.images[0]?.image_url) || '';

                        return (
                            <div
                                key={item.option.id}
                                className={`p-4 md:p-6 rounded-2xl border transition-all flex gap-4 md:gap-6 items-center ${isSelected
                                    ? 'bg-[#0e0e12]/60 border-gold-400/20'
                                    : 'bg-[#0d0d11]/25 border-zinc-900/60 opacity-60'
                                    }`}
                            >
                                {/* Checkbox state */}
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectCartItem(item.option.id)}
                                    className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-gold-400 focus:ring-transparent accent-gold-400 cursor-pointer flex-shrink-0"
                                />

                                {/* Thumbnail Image */}
                                <Link
                                    to={`/products/${item.product.id}`}
                                    className="w-16 h-20 md:w-20 md:h-24 rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden flex-shrink-0 cursor-pointer"
                                >
                                    <img src={primaryImage} alt={itemName} className="w-full h-full object-cover" />
                                </Link>

                                {/* Details summary */}
                                <div className="flex-grow min-w-0">
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold font-sans">
                                        Histeria Store
                                    </span>

                                    {/* Name */}
                                    <Link
                                        to={`/products/${item.product.id}`}
                                        className="block text-zinc-200 hover:text-gold-400 transition-colors font-semibold text-sm md:text-base truncate cursor-pointer"
                                    >
                                        {itemName}
                                    </Link>

                                    {/* Option descriptions */}
                                    {optionSubtitle && (
                                        <span className="block text-[10px] text-zinc-500 font-medium md:text-xs mt-0.5">
                                            ({optionSubtitle})
                                        </span>
                                    )}

                                    {/* Price info */}
                                    <div className="font-sans text-sm font-extrabold text-gold-400 mt-2 block">
                                        ₪{Number(item.option.price).toFixed(2)}
                                    </div>
                                </div>

                                {/* Quantity Controls & Remove */}
                                <div className="flex flex-col md:flex-row items-center gap-4 flex-shrink-0">
                                    {/* Adjuster */}
                                    <div className="flex items-center border border-zinc-850 rounded-xl bg-zinc-950 font-sans">
                                        <button
                                            onClick={() => updateQuantity(item.option.id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center text-zinc-450 hover:text-white text-base font-bold cursor-pointer"
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center text-xs font-bold text-zinc-200">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.option.id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center text-zinc-450 hover:text-white text-base font-bold cursor-pointer"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() => removeFromCart(item.option.id)}
                                        className="text-zinc-600 hover:text-rose-500 p-2 cursor-pointer transition-colors"
                                        title={t('delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                            </div>
                        );
                    })}

                </div>

                {/* Right Side: Order summary / Coupon box */}
                <div className="space-y-6">
                    <div className="bg-[#0e0e12] border border-zinc-900 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl relative">
                        <h3 className="text-zinc-100 font-extrabold text-base tracking-wide uppercase border-b border-zinc-900 pb-3">
                            {t('orderSummary')}
                        </h3>

                        {/* Calculations list */}
                        <div className="space-y-3.5 text-xs md:text-sm font-semibold select-none">
                            <div className="flex justify-between text-zinc-500">
                                <span>{t('subtotal')} ({selectedOptionIds.length} {t('itemCount').toLowerCase()})</span>
                                <span className="font-sans">₪{subtotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                    <span>{t('discount')} {coupon ? `(${coupon.code})` : ''}</span>
                                    <span className="font-sans">-₪{discount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="h-px bg-zinc-900 my-2" />
                            <div className="flex justify-between text-base font-extrabold text-white">
                                <span>{t('total')}</span>
                                <span className="font-sans text-gold-400">₪{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Coupon Code Applying Widget */}
                        <div className="border-t border-zinc-900 pt-6">
                            {coupon ? (
                                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs text-emerald-400">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold">Code: {coupon.code}</span>
                                        <span>
                                            {coupon.amount ? `₪${coupon.amount} OFF` : `${coupon.percentage}% OFF`}
                                        </span>
                                    </div>
                                    <button
                                        onClick={removeCoupon}
                                        className="text-emerald-500 hover:text-white font-bold cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleApplyCoupon} className="space-y-3">
                                    <label className="block text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">
                                        {t('couponCode')}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-800 flex-grow uppercase font-semibold text-center"
                                            value={couponCodeVal}
                                            onChange={(e) => setCouponCodeVal(e.target.value)}
                                            placeholder="EX: HISTERIA10"
                                            disabled={couponLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={couponLoading || !couponCodeVal.trim()}
                                            className="px-4 py-2.5 bg-zinc-850 group-hover:bg-zinc-800 text-zinc-200 hover:text-gold-400 text-xs font-bold rounded-xl border border-zinc-800 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                        >
                                            {t('applyCoupon')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Feedback responses */}
                            {couponError && (
                                <span className="block text-xs font-semibold text-rose-500 mt-2">{couponError}</span>
                            )}
                            {successMsg && (
                                <span className="block text-xs font-semibold text-emerald-400 mt-2">{successMsg}</span>
                            )}
                        </div>

                        {/* Checkout Action button */}
                        <button
                            onClick={() => navigate('/checkout')}
                            disabled={noSelected}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gold-400 hover:bg-gold-500 text-black font-extrabold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer tracking-wider shadow-lg shadow-gold-500/10"
                        >
                            <span>{t('checkout')}</span>
                            {direction === 'rtl' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                        </button>

                        {/* Sub-markers */}
                        <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-550 border-t border-zinc-900/60 pt-4">
                            <ShieldCheck size={14} className="text-gold-400" />
                            <span>Safety Checkout via WhatsApp Channel</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

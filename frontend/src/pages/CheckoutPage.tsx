import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, ArrowLeft, CheckCircle2, User, Phone, MapPin, Home } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
    const { cart, selectedOptionIds, getCartTotal, coupon, checkoutWhatsApp, clearCart } = useCart();
    const { direction, t, getLocalized } = useLanguage();
    const navigate = useNavigate();

    const [fullname, setFullname] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [sent, setSent] = useState(false);

    const selectedItems = cart.filter(item => selectedOptionIds.includes(item.option.id));
    const { subtotal, discount, total } = getCartTotal();

    useEffect(() => {
        if (selectedItems.length === 0 && !sent) {
            navigate('/cart');
        }
    }, [selectedItems.length, sent, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullname.trim() || !phone.trim()) return;

        checkoutWhatsApp({ fullname, phone, city, address });
        setSent(true);
    };

    if (sent) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 text-center space-y-6 select-none font-sans">
                <div className="w-20 h-20 rounded-full bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={36} className="text-emerald-400" />
                </div>
                <div className="space-y-2 max-w-xs">
                    <h2 className="text-xl font-extrabold text-zinc-100">{t('checkoutSuccess')}</h2>
                    <p className="text-sm text-zinc-500">
                        {direction === 'rtl'
                            ? 'تم إعداد رسالة طلبك. إذا لم ينفتح واتساب تلقائيًا، تحقق من حظر النوافذ المنبثقة.'
                            : 'Your order message is ready. If WhatsApp did not open, check your popup blocker settings.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => { clearCart(); navigate('/'); }}
                        className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-extrabold text-zinc-300 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                    >
                        {direction === 'rtl' ? 'العودة للرئيسية' : 'Back to Home'}
                    </button>
                    <button
                        onClick={() => { setSent(false); navigate('/products?category=all'); }}
                        className="px-6 py-3 rounded-xl bg-gold-400 hover:bg-gold-500 text-black text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider"
                    >
                        {direction === 'rtl' ? 'تسوق أكثر' : 'Continue Shopping'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-24 select-none font-sans" dir={direction}>
            <div className="py-6 mb-4">
                <button onClick={() => navigate('/cart')} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white font-semibold transition-colors cursor-pointer">
                    <ArrowLeft size={14} className={direction === 'rtl' ? 'rotate-180' : ''} />
                    <span>{direction === 'rtl' ? 'العودة للسلة' : 'Back to Cart'}</span>
                </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 border-b border-zinc-900 pb-5 mb-10 flex items-center gap-3">
                <MessageCircle className="text-emerald-400" size={28} />
                <span>{t('checkoutTitle')}</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left: Customer Info form */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-[#0e0e12] border border-zinc-900 p-8 rounded-3xl shadow-2xl">
                    <h2 className="text-base font-extrabold text-zinc-200 uppercase tracking-widest border-b border-zinc-900 pb-3">
                        {direction === 'rtl' ? 'بيانات التوصيل' : 'Delivery Details'}
                    </h2>

                    <div className="space-y-4">
                        {/* Full Name */}
                        <div className="relative">
                            <User size={16} className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                            <input
                                type="text" required
                                placeholder={t('fullname')}
                                value={fullname}
                                onChange={e => setFullname(e.target.value)}
                                className={`w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gold-400 ${direction === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                            />
                        </div>

                        {/* Phone */}
                        <div className="relative">
                            <Phone size={16} className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                            <input
                                type="tel" required
                                placeholder={t('phone')}
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className={`w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gold-400 ${direction === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                                dir="ltr"
                            />
                        </div>

                        {/* City */}
                        <div className="relative">
                            <MapPin size={16} className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                            <input
                                type="text"
                                placeholder={t('city')}
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                className={`w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gold-400 ${direction === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                            />
                        </div>

                        {/* Address Details */}
                        <div className="relative">
                            <Home size={16} className={`absolute top-4 text-zinc-500 ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                            <textarea
                                rows={3}
                                placeholder={t('addressDetails')}
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className={`w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gold-400 resize-none ${direction === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                            />
                        </div>
                    </div>

                    {/* WhatsApp Preview Snippet */}
                    <div className="bg-[#0a2a10] border border-emerald-900/40 rounded-2xl p-4 text-xs text-emerald-300 space-y-1.5 font-mono leading-relaxed">
                        <div className="text-[10px] text-emerald-500 uppercase font-extrabold tracking-widest mb-2 font-sans">
                            WhatsApp Message Preview
                        </div>
                        <div>🛍️ *{direction === 'rtl' ? 'طلب جديد من متجر هستيريا' : 'New Order from Histeria Store'}*</div>
                        <div className="text-emerald-400/70">👤 {fullname || (direction === 'rtl' ? 'الاسم الكامل' : 'Full Name')}</div>
                        <div className="text-emerald-400/70">📞 {phone || '...'}</div>
                        {selectedItems.slice(0, 2).map((item, i) => (
                            <div key={i} className="text-emerald-400/60">
                                {i + 1}. *{getLocalized(item.product, 'name')}* — ₪{item.option.price} × {item.quantity}
                            </div>
                        ))}
                        {selectedItems.length > 2 && <div className="text-emerald-500/50">...and {selectedItems.length - 2} more items</div>}
                        <div className="border-t border-emerald-900/30 pt-1.5 font-bold text-emerald-300">
                            *{t('total')}: ₪{total.toFixed(2)}*
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer tracking-wider shadow-lg shadow-emerald-500/10"
                    >
                        <MessageCircle size={20} />
                        <span>{t('whatsAppOrder')}</span>
                    </button>
                </form>

                {/* Right: Order Summary */}
                <div className="bg-[#0e0e12] border border-zinc-900 p-8 rounded-3xl shadow-2xl space-y-6">
                    <h2 className="text-base font-extrabold text-zinc-200 uppercase tracking-widest border-b border-zinc-900 pb-3">
                        {t('orderSummary')}
                    </h2>

                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
                        {selectedItems.map((item) => {
                            const name = getLocalized(item.product, 'name');
                            const size = item.option.size ? getLocalized(item.option, 'size') : '';
                            const color = item.option.color_name ? getLocalized(item.option, 'color_name') : '';
                            const optLabel = [size, color].filter(Boolean).join(' / ');
                            const img = item.option.image_url || item.product.images?.[0]?.image_url || '';

                            return (
                                <div key={item.option.id} className="flex items-center gap-4 p-3 bg-zinc-950/50 rounded-xl border border-zinc-900/50">
                                    {img && (
                                        <div className="w-14 h-16 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-850">
                                            <img src={img} alt={name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-zinc-200 font-semibold text-xs truncate">{name}</div>
                                        {optLabel && <div className="text-zinc-500 text-[10px]">({optLabel})</div>}
                                        <div className="text-gold-400 font-extrabold text-xs font-sans mt-1">
                                            ₪{item.option.price} × {item.quantity} = ₪{(Number(item.option.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Totals */}
                    <div className="space-y-3 border-t border-zinc-900 pt-5 text-sm font-semibold">
                        <div className="flex justify-between text-zinc-500">
                            <span>{t('subtotal')}</span>
                            <span className="font-sans">₪{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                                <span>{t('discount')} {coupon ? `(${coupon.code})` : ''}</span>
                                <span className="font-sans">-₪{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-extrabold text-white border-t border-zinc-900 pt-3">
                            <span>{t('total')}</span>
                            <span className="font-sans text-gold-400">₪{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

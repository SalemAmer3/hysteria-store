import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Phone, MapPin, Mail, Instagram, MessageCircle, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
    const { direction, t, getLocalized } = useLanguage();
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await api.categories.listPublic();
                setCategories(res.data.filter((c: any) => c.is_active).slice(0, 5));
            } catch (err) {
                console.error('Failed to load categories for footer', err);
            }
        }
        loadCategories();
    }, []);

    return (
        <footer className="bg-[#050507] border-t border-zinc-900 select-none">
            {/* Top visual accent */}
            <div className="h-0.5 w-full bg-gradient-to-r from-zinc-950 via-gold-400 to-zinc-950"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-zinc-400 text-sm">

                    {/* Brand Introduction */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-block">
                            <span className="font-sans text-2xl font-extrabold tracking-widest text-[#f5ecd2]">
                                HISTERIA
                            </span>
                            <span className="block text-[9px] tracking-[0.25em] text-gold-400 uppercase font-semibold">
                                Luxury & Lifestyle
                            </span>
                        </Link>
                        <p className="text-zinc-500 text-xs md:text-sm leading-relaxed">
                            {direction === 'rtl'
                                ? 'متجر هستيرا يقدم أرقى العطور الفاخرة ومستحضرات التجميل ومنتجات العناية بالبشرة لأسلوب حياة متكامل وعصري. تصاميم حصرية وجودة لا تضاهى.'
                                : 'Histeria offers the finest luxury perfumes, cosmetic items, and premium lifestyle essentials. Discover exclusive collections selected for your unique taste.'
                            }
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a
                                href="https://www.facebook.com/share/1B5VqeTtTh/?mibextid=wwXIfr"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 hover:text-blue-500 transition-colors"
                                title="Facebook"
                            >
                                <Facebook size={18} />
                            </a>
                            <a
                                href="https://www.instagram.com/hysteria.he"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-colors"
                                title="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="https://wa.me/972593957882"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 hover:text-emerald-500 transition-colors"
                                title="WhatsApp"
                            >
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Categories */}
                    <div>
                        <h3 className="text-zinc-100 font-semibold mb-5 text-base tracking-wide uppercase border-b border-zinc-900 pb-2">
                            {t('categories')}
                        </h3>
                        {categories.length > 0 ? (
                            <ul className="space-y-2.5">
                                {categories.map((c) => (
                                    <li key={c.id}>
                                        <Link
                                            to={`/products?category=${c.id}`}
                                            className="hover:text-gold-400 transition-colors text-zinc-500 hover:underline"
                                        >
                                            {getLocalized(c, 'name')}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <ul className="space-y-2.5">
                                <li>
                                    <Link to="/products?category=all" className="hover:text-gold-500 transition-colors text-zinc-500">
                                        {t('allCategories')}
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Store Hours / Support */}


                    {/* Contact Details */}
                    <div>
                        <h3 className="text-zinc-100 font-semibold mb-5 text-base tracking-wide uppercase border-b border-zinc-900 pb-2">
                            {direction === 'rtl' ? 'معلومات الاتصال' : 'Contact Us'}
                        </h3>
                        <ul className="space-y-4 text-xs md:text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-gold-400 mt-0.5 flex-shrink-0" />
                                <span className="text-zinc-500">
                                    {direction === 'rtl' ? 'الخليل الهيبرون سنتر الجديد - الطابق الثاني' : 'Hebron, Hebron Center New - Second Floor'}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-gold-400 flex-shrink-0" />
                                <a href="tel:+972593957882" className="text-zinc-500 hover:text-white transition-colors">
                                    +972 593 957 882
                                </a>
                            </li>

                        </ul>
                    </div>

                </div>

                {/* Lower bar */}
                <div className="border-t border-zinc-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-xs">
                    <p>{t('allRightsReserved')}</p>
                    <div className="flex gap-4 font-semibold">
                        <Link to="/admin-login" className="hover:text-zinc-400 transition-colors">{t('admin')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

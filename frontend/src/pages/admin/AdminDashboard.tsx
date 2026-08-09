import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { ShoppingBag, FolderOpen, Sparkles, Sliders, Megaphone, Ticket, TrendingUp, ArrowRight } from 'lucide-react';

interface StatCard {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    path: string;
}

export const AdminDashboard: React.FC = () => {
    const { t, direction } = useLanguage();
    const [stats, setStats] = useState({
        products: 0, categories: 0, brands: 0, sliders: 0, ads: 0, coupons: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [prodsRes, catsRes, brandsRes, slidersRes, adsRes, couponsRes] = await Promise.all([
                    api.products.listAdmin(1, 1),
                    api.categories.listAdmin(1, 1),
                    api.brands.listAdmin(1, 1),
                    api.sliders.listAdmin(1, 1),
                    api.ads.listAdmin(1, 1),
                    api.coupons.listAdmin(1, 1),
                ]);
                setStats({
                    products: prodsRes.pagination?.total || 0,
                    categories: catsRes.pagination?.total || 0,
                    brands: brandsRes.pagination?.total || 0,
                    sliders: slidersRes.pagination?.total || 0,
                    ads: adsRes.pagination?.total || 0,
                    coupons: couponsRes.pagination?.total || 0,
                });
            } catch (err) {
                console.error('Dashboard stats error', err);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const statCards: StatCard[] = [
        { title: t('productsManage'), value: stats.products, icon: <ShoppingBag size={22} />, color: 'gold', path: '/admin/products' },
        { title: t('categoriesManage'), value: stats.categories, icon: <FolderOpen size={22} />, color: 'blue', path: '/admin/categories' },
        { title: t('brandsManage'), value: stats.brands, icon: <Sparkles size={22} />, color: 'purple', path: '/admin/brands' },
        { title: t('slidersManage'), value: stats.sliders, icon: <Sliders size={22} />, color: 'cyan', path: '/admin/sliders' },
        { title: t('adsManage'), value: stats.ads, icon: <Megaphone size={22} />, color: 'rose', path: '/admin/ads' },
        { title: t('couponsManage'), value: stats.coupons, icon: <Ticket size={22} />, color: 'emerald', path: '/admin/coupons' },
    ];

    const colorMap: Record<string, string> = {
        gold: 'bg-gold-400/10 border-gold-400/20 text-gold-400',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    };

    return (
        <AdminLayout>
            <div className="space-y-10" dir={direction}>

                {/* Header Welcome */}
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 flex items-center gap-2">
                        <TrendingUp className="text-gold-400" size={28} />
                        {t('dashboard')}
                    </h1>
                    <p className="text-sm text-zinc-500">
                        {direction === 'rtl' ? 'مرحباً بك في لوحة تحكم متجر هستيريا.' : 'Welcome to the Histeria store admin panel.'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {statCards.map((card) => (
                        <Link
                            key={card.path}
                            to={card.path}
                            className="group bg-[#0d0d11]/50 border border-zinc-900 hover:border-zinc-800 p-6 rounded-2xl flex flex-col gap-5 transition-all hover:shadow-xl cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorMap[card.color]}`}>
                                    {card.icon}
                                </div>
                                <ArrowRight size={16} className={`text-zinc-700 group-hover:text-zinc-400 transition-colors ${direction === 'rtl' ? 'rotate-180' : ''}`} />
                            </div>
                            <div className="space-y-1">
                                {loading ? (
                                    <div className="w-12 h-8 bg-zinc-900 shimmer rounded-md" />
                                ) : (
                                    <div className="text-3xl font-extrabold text-white font-sans">{card.value}</div>
                                )}
                                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{card.title}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Links */}
                <div className="bg-[#0d0d11]/30 border border-zinc-900 rounded-2xl p-6 space-y-4">
                    <h2 className="font-extrabold text-zinc-300 text-sm uppercase tracking-wider border-b border-zinc-900 pb-3">
                        {direction === 'rtl' ? 'روابط سريعة' : 'Quick Actions'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link to="/admin/products" className="flex items-center gap-3 px-5 py-3.5 bg-gold-400 hover:bg-gold-500 text-black rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer tracking-wider">
                            <ShoppingBag size={16} />
                            {direction === 'rtl' ? '+ إضافة منتج جديد' : '+ Add New Product'}
                        </Link>
                        <Link to="/admin/categories" className="flex items-center gap-3 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer tracking-wider">
                            <FolderOpen size={16} />
                            {direction === 'rtl' ? '+ إضافة فئة' : '+ Add Category'}
                        </Link>
                        <Link to="/" target="_blank" className="flex items-center gap-3 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer tracking-wider">
                            <ArrowRight size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                            {direction === 'rtl' ? 'عرض المتجر' : 'View Store'}
                        </Link>
                    </div>
                </div>

                {/* Footer credit */}
                <div className="text-center py-4 border-t border-zinc-900/50">
                    <p className="text-xs text-zinc-600 font-semibold tracking-wide">
                        تم إنشاء هذا الموقع بواسطة <span className="text-gold-400">أمير</span>
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
};

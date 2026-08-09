import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    LayoutDashboard,
    ShoppingBag,
    FolderOpen,
    Sparkles,
    Sliders as SlidersIcon,
    Megaphone,
    Ticket,
    ArrowLeft,
    LogOut,
    Menu,
    X
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { isAuthenticated, logout, username } = useAuth();
    const { direction, t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    // Authenticate guard
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/admin-login');
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-sans">
                Authenticating session...
            </div>
        );
    }

    const menuItems = [
        { name: t('dashboard'), path: '/admin', icon: LayoutDashboard },
        { name: t('productsManage'), path: '/admin/products', icon: ShoppingBag },
        { name: t('categoriesManage'), path: '/admin/categories', icon: FolderOpen },
        { name: t('brandsManage'), path: '/admin/brands', icon: Sparkles },
        { name: t('slidersManage'), path: '/admin/sliders', icon: SlidersIcon },
        { name: t('adsManage'), path: '/admin/ads', icon: Megaphone },
        { name: t('couponsManage'), path: '/admin/coupons', icon: Ticket },
    ];

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col md:flex-row relative font-sans" dir={direction}>

            {/* Mobile Top Header */}
            <div className="md:hidden w-full bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex items-center justify-between z-30">
                <Link to="/" className="flex items-center">
                    <img
                        src="/hysteria-logo.jpeg"
                        alt="Histeria Logo"
                        className="h-10 w-auto object-contain"
                    />
                </Link>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-zinc-300 p-2 hover:bg-zinc-900 rounded-lg cursor-pointer"
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={`fixed md:sticky top-0 bottom-0 z-30 w-64 bg-zinc-950 border-r border-zinc-900/60 p-6 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : direction === 'rtl' ? 'translate-x-full' : '-translate-x-full'
                    } ${direction === 'rtl' ? 'right-0' : 'left-0'}`}
                style={{
                    borderLeftWidth: direction === 'rtl' ? '1px' : '0px',
                    borderRightWidth: direction === 'rtl' ? '0px' : '1px'
                }}
            >
                <div className="space-y-8 select-none">
                    {/* Admin title */}
                    <div className="border-b border-zinc-900 pb-5">
                        <Link to="/" className="flex flex-col items-center">
                            <img
                                src="/hysteria-logo.jpeg"
                                alt="Histeria Logo"
                                className="h-16 w-auto object-contain mb-2"
                            />
                            <span className="text-[10px] tracking-widest uppercase text-gold-400 font-semibold">
                                {t('admin')} dashboard
                            </span>
                        </Link>
                        <div className="mt-3 text-xs text-zinc-500 font-semibold">
                            Logged in: <span className="text-zinc-300">{username}</span>
                        </div>
                    </div>

                    {/* Links list */}
                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold capitalize tracking-wide transition-all border ${isActive
                                            ? 'bg-gold-400 text-black border-gold-400 shadow-lg shadow-gold-400/10'
                                            : 'bg-zinc-950 border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer Controls */}
                <div className="border-t border-zinc-900 pt-5 space-y-2">
                    {/* Back to store */}
                    <Link
                        to="/"
                        className="w-full flex items-center gap-3 px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} className={direction === 'rtl' ? 'rotate-180' : ''} />
                        <span>{direction === 'rtl' ? 'الرجوع للمتجر' : 'Go back to store'}</span>
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 text-red-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    >
                        <LogOut size={14} />
                        <span>{t('logout')}</span>
                    </button>
                </div>

            </aside>

            {/* Mobile Drawer Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-20 bg-black/60 md:hidden"
                />
            )}

            {/* Main Pages Content Frame */}
            <main className="flex-1 w-full bg-[#070709] min-h-[calc(100vh-69px)] md:min-h-screen p-6 md:p-12 overflow-x-hidden">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

        </div>
    );
};

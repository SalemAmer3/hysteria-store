import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, ShoppingBag, Heart, Menu, X, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { language, setLanguage, direction, t } = useLanguage();
    const { cart, wishlist } = useCart();
    const { isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLangChange = (lang: 'ar' | 'en' | 'he') => {
        setLanguage(lang);
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-black/90 border-b border-zinc-900 shadow-lg' : 'bg-black/95'
            }`}>
            {/* Top micro-bar for quick links */}
            <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-xs border-b border-zinc-900 border-opacity-50 text-zinc-400">
                <div>
                    <span>{t('stockStatus')}</span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Language Switcher only in top bar */}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-20 gap-4">

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-zinc-100 p-2 hover:bg-zinc-900 rounded-lg cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center select-none group">
                            <img
                                src="/hysteria-logo.jpeg"
                                alt="Histeria Logo"
                                className="h-12 md:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity"
                            />
                        </Link>
                    </div>

                    {/* Search bar - Desktop */}
                    <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative select-none">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-full px-5 py-2 pl-12 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all text-sm"
                            dir={direction}
                        />
                        <button
                            type="submit"
                            className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer ${direction === 'rtl' ? 'left-4' : 'right-4'
                                }`}
                        >
                            <Search size={18} />
                        </button>
                    </form>

                    {/* Menu / Language & Icons */}
                    <div className="flex items-center gap-2 md:gap-5">
                        {/* Language Switcher */}
                        <div className="relative group text-sm">
                            <button className="flex items-center gap-1.5 text-zinc-300 hover:text-gold-400 py-2 cursor-pointer font-medium tracking-wide">
                                <span>
                                    {language === 'ar' ? '🇸🇦' : language === 'he' ? '🇮🇱' : '🇬🇧'}
                                </span>
                                <span className="hidden sm:inline">{t('languageName')}</span>
                            </button>

                            <div className={`absolute top-full bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl py-1.5 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-1 ${direction === 'rtl' ? 'left-0' : 'right-0'
                                }`}>
                                <button
                                    onClick={() => handleLangChange('ar')}
                                    className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer ${language === 'ar' ? 'text-gold-400 font-semibold' : ''
                                        }`}
                                    style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
                                >
                                    <span>🇸🇦</span> <span className="font-arabic font-normal">العربية</span>
                                </button>
                                <button
                                    onClick={() => handleLangChange('he')}
                                    className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer ${language === 'he' ? 'text-gold-400 font-semibold' : ''
                                        }`}
                                    style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
                                >
                                    <span>🇮🇱</span> <span className="font-arabic font-normal">עברית</span>
                                </button>
                                <button
                                    onClick={() => handleLangChange('en')}
                                    className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer ${language === 'en' ? 'text-gold-400 font-semibold' : ''
                                        }`}
                                    style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}
                                >
                                    <span>🇬🇧</span> English
                                </button>
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-zinc-300 hover:text-gold-400 transition-colors cursor-pointer"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Wishlist Link */}
                        <Link
                            to="/wishlist"
                            className="p-2.5 text-zinc-300 hover:text-rose-500 transition-colors relative"
                            title={t('wishlist')}
                        >
                            {/* className="p-2.5 text-zinc-300 hover:text-rose-500 transition-colors relative"
                            title={t('wishlist')}
                        > */}
                            <Heart size={22} 
                            className={wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''} />
                            {wishlist.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {/* Cart Link */}
                        <Link
                            to="/cart"
                            className="p-2.5 text-zinc-300 hover:text-gold-400 transition-colors relative"
                            title={t('cart')}
                        >
                            <ShoppingBag size={22} />
                            {cartCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-gold-400 text-black rounded-full text-[10px] font-extrabold flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Pages Nav Links - Desktop */}
            <nav className="border-t border-zinc-900/60 bg-black/60 hidden md:block select-none">
                <div className="max-w-7xl mx-auto px-8 flex justify-center items-center gap-8 h-12 text-sm font-semibold tracking-wide text-zinc-300">
                    <Link to="/" className="hover:text-gold-400 transition-colors py-1.5 border-b-2 border-transparent hover:border-gold-400">{t('home')}</Link>
                    <Link to="/products?category=all" className="hover:text-gold-400 transition-colors py-1.5 border-b-2 border-transparent hover:border-gold-400">{t('categories')}</Link>
                    <Link to="/products?brand=all" className="hover:text-gold-400 transition-colors py-1.5 border-b-2 border-transparent hover:border-gold-400">{t('brands')}</Link>
                </div>
            </nav>

            {/* Mobile Drawer Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 top-[116px] z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Drawer Menu */}
            <div className={`fixed top-[116px] bottom-0 z-30 w-72 max-w-sm bg-zinc-950 border-r border-zinc-900 p-6 flex flex-col justify-between transition-transform duration-300 ${mobileMenuOpen
                    ? 'translate-x-0'
                    : direction === 'rtl' ? 'translate-x-full' : '-translate-x-full'
                }`}
                style={{
                    right: direction === 'rtl' ? 0 : 'auto',
                    left: direction === 'rtl' ? 'auto' : 0,
                    borderLeftWidth: direction === 'rtl' ? '1px' : '0px',
                    borderRightWidth: direction === 'rtl' ? '0px' : '1px'
                }}
            >
                <div className="space-y-8 select-none">
                    {/* Mobile search */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:border-gold-400 text-sm"
                            dir={direction}
                        />
                        <button
                            type="submit"
                            className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer ${direction === 'rtl' ? 'left-3' : 'right-3'
                                }`}
                        >
                            <Search size={16} />
                        </button>
                    </form>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-4 text-base font-semibold">
                        <Link to="/" className="w-full py-2 hover:text-gold-400 border-b border-zinc-900 transition-colors">{t('home')}</Link>
                        <Link to="/products?category=all" className="w-full py-2 hover:text-gold-400 border-b border-zinc-900 transition-colors">{t('categories')}</Link>
                        <Link to="/products?brand=all" className="w-full py-2 hover:text-gold-400 border-b border-zinc-900 transition-colors">{t('brands')}</Link>
                    </div>
                </div>

                {/* Footer info in drawer */}
                <div className="text-zinc-600 text-xs text-center border-t border-zinc-900 pt-4">
                    <p className="mt-1">Histeriaclothes.com</p>
                </div>
            </div>
        </header>
    );
};

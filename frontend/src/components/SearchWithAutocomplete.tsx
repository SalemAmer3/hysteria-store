import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface AutocompleteProduct {
    id: string;
    name: string;
    image: string | null;
    price: number | null;
    category: string | null;
}

interface AutocompleteData {
    suggestions: string[];
    products: AutocompleteProduct[];
}

interface SearchWithAutocompleteProps {
    className?: string;
    placeholder?: string;
    onSubmit?: () => void;
}

export const SearchWithAutocomplete: React.FC<SearchWithAutocompleteProps> = ({
    className = '',
    placeholder,
    onSubmit,
}) => {
    const { direction, t } = useLanguage();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [autocompleteData, setAutocompleteData] = useState<AutocompleteData | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch autocomplete suggestions with debounce
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (searchQuery.trim().length < 2) {
            setAutocompleteData(null);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        debounceTimer.current = setTimeout(async () => {
            try {
                const response = await api.products.autocomplete(searchQuery.trim(), 5);
                if (response.success) {
                    setAutocompleteData(response.data);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error('Autocomplete error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowDropdown(false);
            if (onSubmit) onSubmit();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion);
        navigate(`/products?search=${encodeURIComponent(suggestion)}`);
        setShowDropdown(false);
        if (onSubmit) onSubmit();
    };

    const handleProductClick = (productId: string) => {
        navigate(`/product/${productId}`);
        setShowDropdown(false);
        setSearchQuery('');
        if (onSubmit) onSubmit();
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setAutocompleteData(null);
        setShowDropdown(false);
    };

    const hasResults = autocompleteData && (
        autocompleteData.suggestions.length > 0 || 
        autocompleteData.products.length > 0
    );

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <form onSubmit={handleSearchSubmit} className="flex relative select-none min-w-0">
                <input
                    type="search"
                    placeholder={placeholder || t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        if (hasResults) setShowDropdown(true);
                    }}
                    className={`w-full bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-full py-2 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all ${
                        direction === 'rtl' ? 'pr-4 pl-10' : 'pl-4 pr-10'
                    }`}
                    dir={direction}
                    autoComplete="off"
                />
                
                {/* Clear button */}
                {searchQuery && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer ${
                            direction === 'rtl' ? 'left-10' : 'right-10'
                        }`}
                        aria-label="Clear search"
                    >
                        <X size={15} />
                    </button>
                )}
                
                {/* Search button */}
                <button
                    type="submit"
                    aria-label={t('searchPlaceholder')}
                    className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer ${
                        direction === 'rtl' ? 'left-3' : 'right-3'
                    }`}
                >
                    <Search size={17} />
                </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showDropdown && hasResults && (
                <div
                    className={`absolute top-full mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto ${
                        direction === 'rtl' ? 'text-right' : 'text-left'
                    }`}
                >
                    {/* Suggestions */}
                    {autocompleteData.suggestions.length > 0 && (
                        <div className="border-b border-zinc-900">
                            <div className="px-4 py-2 text-xs text-zinc-500 font-semibold">
                                {t('suggestions') || 'اقتراحات البحث'}
                            </div>
                            {autocompleteData.suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full px-4 py-2.5 hover:bg-zinc-900 cursor-pointer text-sm text-zinc-200 flex items-center gap-2 transition-colors"
                                >
                                    <Search size={14} className="text-zinc-500 flex-shrink-0" />
                                    <span>{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Products */}
                    {autocompleteData.products.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs text-zinc-500 font-semibold">
                                {t('products') || 'منتجات'}
                            </div>
                            {autocompleteData.products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductClick(product.id)}
                                    className="w-full px-4 py-3 hover:bg-zinc-900 cursor-pointer flex items-center gap-3 transition-colors"
                                >
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-zinc-800"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex-shrink-0 flex items-center justify-center text-zinc-600">
                                            <Search size={20} />
                                        </div>
                                    )}
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="text-sm text-zinc-200 truncate">
                                            {product.name}
                                        </div>
                                        {product.category && (
                                            <div className="text-xs text-zinc-500 truncate">
                                                {product.category}
                                            </div>
                                        )}
                                    </div>
                                    {product.price && (
                                        <div className="text-sm text-gold-400 font-semibold flex-shrink-0">
                                            ₪{product.price}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Loading state */}
            {isLoading && showDropdown && (
                <div className="absolute top-full mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-400"></div>
                        <span>{t('searching') || 'جاري البحث...'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

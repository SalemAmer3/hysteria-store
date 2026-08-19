import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

export interface CartItem {
    product: {
        id: string;
        name: string;
        description?: string | null;
        arabic?: string | null;
        hebrew?: string | null;
        images?: Array<{ image_url: string }>;
        brand_name?: string | null;
        sku?: string | null;
    };
    option: {
        id: string;
        size?: string | null;
        color_name?: string | null;
        shade?: string | null;
        color?: string | null;
        price: number;
        arabic?: string | null;
        hebrew?: string | null;
        image_url?: string | null;
    };
    quantity: number;
}

export interface WishlistItem {
    id: string;
    name: string;
    description?: string | null;
    arabic?: string | null;
    hebrew?: string | null;
    images?: Array<{ image_url: string }>;
    options?: Array<{ price: number; id: string; size?: string | null }>;
}

export interface CouponData {
    code: string;
    percentage?: number;
    amount?: number;
}

interface CustomerDetails {
    fullname: string;
    phone: string;
    city: string;
    address: string;
}

interface CartContextType {
    cart: CartItem[];
    wishlist: WishlistItem[];
    coupon: CouponData | null;
    couponError: string | null;
    selectedOptionIds: string[];
    addToCart: (product: any, option: any, quantity?: number) => void;
    removeFromCart: (optionId: string) => void;
    updateQuantity: (optionId: string, quantity: number) => void;
    toggleSelectCartItem: (optionId: string) => void;
    toggleSelectAll: (checked: boolean) => void;
    toggleWishlist: (product: any) => void;
    isInWishlist: (productId: string) => boolean;
    applyCouponCode: (code: string) => Promise<boolean>;
    removeCoupon: () => void;
    clearCart: () => void;
    getCartTotal: () => { subtotal: number; discount: number; total: number };
    checkoutWhatsApp: (details: CustomerDetails) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getLocalized, t } = useLanguage();

    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('histeria_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
        const saved = localStorage.getItem('histeria_wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    const [coupon, setCoupon] = useState<CouponData | null>(() => {
        const saved = localStorage.getItem('histeria_coupon');
        return saved ? JSON.parse(saved) : null;
    });

    const [couponError, setCouponError] = useState<string | null>(null);

    const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

    // Keep selected ids synced with cart items on load
    useEffect(() => {
        setSelectedOptionIds((prev) => {
            // Keep only ids that still exist in cart
            const cartOptionIds = cart.map(item => item.option.id);
            return prev.filter(id => cartOptionIds.includes(id));
        });
    }, [cart]);

    // Sync selectedOptionIds with all cart IDs if empty on cart load
    useEffect(() => {
        if (selectedOptionIds.length === 0 && cart.length > 0) {
            setSelectedOptionIds(cart.map((item) => item.option.id));
        }
    }, [cart.length]);

    useEffect(() => {
        localStorage.setItem('histeria_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('histeria_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        if (coupon) {
            localStorage.setItem('histeria_coupon', JSON.stringify(coupon));
        } else {
            localStorage.removeItem('histeria_coupon');
        }
    }, [coupon]);

    const addToCart = (product: any, option: any, quantity: number = 1) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item.option.id === option.id);
            let newCart = [...prevCart];

            if (existingItemIndex > -1) {
                newCart[existingItemIndex].quantity += quantity;
            } else {
                newCart.push({
                    product: {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        arabic: product.arabic,
                        hebrew: product.hebrew,
                        images: product.images,
                        brand_name: product.brand?.name || null,
                        sku: product.sku || null,
                    },
                    option: {
                        id: option.id,
                        size: option.size,
                        color_name: option.color_name,
                        shade: option.shade,
                        color: option.color,
                        price: Number(option.price),
                        arabic: option.arabic,
                        hebrew: option.hebrew,
                        image_url: option.image_url,
                    },
                    quantity,
                });
            }

            // Add to selected list by default
            if (!selectedOptionIds.includes(option.id)) {
                setSelectedOptionIds(prev => [...prev, option.id]);
            }

            return newCart;
        });
    };

    const removeFromCart = (optionId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.option.id !== optionId));
        setSelectedOptionIds((prev) => prev.filter((id) => id !== optionId));
    };

    const updateQuantity = (optionId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(optionId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.option.id === optionId ? { ...item, quantity } : item
            )
        );
    };

    const toggleSelectCartItem = (optionId: string) => {
        setSelectedOptionIds((prev) =>
            prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId]
        );
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedOptionIds(cart.map((item) => item.option.id));
        } else {
            setSelectedOptionIds([]);
        }
    };

    const toggleWishlist = (product: any) => {
        setWishlist((prevWishlist) => {
            const exists = prevWishlist.some((item) => item.id === product.id);
            if (exists) {
                return prevWishlist.filter((item) => item.id !== product.id);
            } else {
                return [
                    ...prevWishlist,
                    {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        arabic: product.arabic,
                        hebrew: product.hebrew,
                        images: product.images,
                        options: product.options,
                    },
                ];
            }
        });
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((item) => item.id === productId);
    };

    const applyCouponCode = async (code: string): Promise<boolean> => {
        setCouponError(null);
        try {
            const response = await fetch(`/api/coupons/${code}`);
            const result = await response.json();

            if (response.ok && result.success && result.data) {
                setCoupon(result.data);
                return true;
            } else {
                setCouponError(result.message || t('invalidCoupon'));
                setCoupon(null);
                return false;
            }
        } catch (error) {
            setCouponError(t('errorOccurred'));
            setCoupon(null);
            return false;
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
        setCouponError(null);
    };

    const clearCart = () => {
        setCart([]);
        setSelectedOptionIds([]);
        setCoupon(null);
        setCouponError(null);
    };

    const getCartTotal = () => {
        // Only calculate for selected products
        const selectedCartItems = cart.filter((item) =>
            selectedOptionIds.includes(item.option.id)
        );

        const subtotal = selectedCartItems.reduce(
            (sum, item) => sum + item.option.price * item.quantity,
            0
        );

        let discount = 0;
        if (coupon) {
            if (coupon.percentage !== undefined) {
                discount = subtotal * (coupon.percentage / 100);
            } else if (coupon.amount !== undefined) {
                discount = Math.min(coupon.amount, subtotal);
            }
        }

        const total = Math.max(0, subtotal - discount);

        return { subtotal, discount, total };
    };

    const checkoutWhatsApp = (details: CustomerDetails) => {
        const selectedCartItems = cart.filter((item) =>
            selectedOptionIds.includes(item.option.id)
        );

        if (selectedCartItems.length === 0) return;

        const { subtotal, discount, total } = getCartTotal();

        // Setup lines based on language
        const titleEmoji = '🛍️';
        const checkLine = t('whatsAppTemplateTitle');

        let message = `${titleEmoji} ${checkLine}\n\n`;

        // Customer details
        message += `👤 *${t('fullname')}:* ${details.fullname}\n`;
        message += `📞 *${t('phone')}:* ${details.phone}\n`;
        message += `📍 *${t('city')}:* ${details.city}\n`;
        message += `🏠 *${t('addressDetails')}:* ${details.address}\n\n`;
        message += `--- ${t('orderSummary')} ---\n\n`;

        selectedCartItems.forEach((item, index) => {
            const prodName = getLocalized(item.product, 'name');
            const sizeName = item.option.size ? getLocalized(item.option, 'size') : '';
            const colorName = item.option.color_name ? getLocalized(item.option, 'color_name') : '';
            const shadeName = item.option.shade ? getLocalized(item.option, 'shade') : '';

            const optionDetails = [
                colorName ? `${t('color')}: ${colorName}` : '',
                shadeName ? `${t('shade')}: ${shadeName}` : '',
                sizeName ? `${t('size')}: ${sizeName}` : ''
            ].filter(Boolean).join(' | ');

            message += `${index + 1}. *${prodName}*\n`;
            if (item.product.sku) {
                message += `   🔖 SKU: \`${item.product.sku}\`\n`;
            }
            if (item.product.brand_name) {
                message += `   🏷️ ${item.product.brand_name}\n`;
            }
            if (optionDetails) {
                message += `   (${optionDetails})\n`;
            }
            message += `   ${t('size') === 'الحجم' ? 'الكمية' : 'Qty'}: ${item.quantity}\n`;
            message += `   ${t('price')}: ₪${item.option.price} × ${item.quantity} = ₪${item.option.price * item.quantity}\n\n`;
        });

        if (discount > 0) {
            message += `*${t('subtotal')}: ₪${subtotal}*\n`;
            message += `*${t('discount')}: ₪${discount.toFixed(2)}${coupon ? ` (${coupon.code})` : ''}*\n`;
        }

        message += `*${t('total')}: ₪${total.toFixed(2)}*\n\n`;
        message += `${t('whatsAppContactUs')} ✨`;

        // WhatsApp phone number
        const adminWhatsAppNumber = '972593957882'; // Preset channel
        const encodedText = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodedText}`;

        // Redirect to whatsapp URL
        window.open(whatsappUrl, '_blank');
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                wishlist,
                coupon,
                couponError,
                selectedOptionIds,
                addToCart,
                removeFromCart,
                updateQuantity,
                toggleSelectCartItem,
                toggleSelectAll,
                toggleWishlist,
                isInWishlist,
                applyCouponCode,
                removeCoupon,
                clearCart,
                getCartTotal,
                checkoutWhatsApp,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

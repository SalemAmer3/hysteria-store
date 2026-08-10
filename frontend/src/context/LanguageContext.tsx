import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en' | 'he';
export type Direction = 'rtl' | 'ltr';

const translations: Record<Language, Record<string, string>> = {
    ar: {
        // Nav & General
        home: 'الرئيسية',
        categories: 'الفئات',
        brands: 'الماركات',
        cart: 'السلة',
        wishlist: 'المفضلة',
        search: 'ابحث عن عطور، مكياج...',
        searchPlaceholder: 'ابحث في متجر هستيريا...',
        admin: 'لوحة التحكم',
        adminLogin: 'دخول المسؤول',
        login: 'تسجيل الدخول',
        username: 'اسم المستخدم',
        password: 'كلمة المرور',
        loggingIn: 'جاري الدخول...',
        logout: 'تسجيل خروج',
        currency: '₪',
        languageName: 'العربية',
        switchLanguage: 'تغيير اللغة',
        allRightsReserved: 'جميع الحقوق محفوظة. متجر هستيريا 2026',

        // Announce bar
        announceText: '✨ شحن مجاني للطلبات فوق ₪350! كود خصم إضافي: HISTERIA10 ✨',

        // Products / Home
        featuredProducts: 'المنتجات المميزة',
        newArrivals: 'وصل حديثاً',
        shopCategory: 'تسوق حسب الفئة',
        shopBrand: 'تسوق حسب الماركة',
        noProducts: 'لا توجد منتجات مطابقة للبحث حالياً.',
        price: 'السعر',
        details: 'التفاصيل',
        addToCart: 'إضافة للسلة',
        buyNow: 'شراء الآن',
        addedToCart: 'تم الإضافة إلى السلة!',
        removedFromWishlist: 'تمت الإزالة من المفضلة',
        addedToWishlist: 'تمت الإضافة للمفضلة',
        color: 'اللون',
        shade: 'درجة اللون',
        selectColor: 'اختر اللون',
        selectShade: 'اختر درجة اللون',
        size: 'الحجم',
        stockStatus: 'متوفر في المخزن',
        relatedProducts: 'منتجات قد تعجبك',
        searchResult: 'نتائج البحث عن',
        filterByBrand: 'تصفية حسب الماركة',
        filterByCategory: 'تصفية حسب الفئة',
        clearFilters: 'مسح التصفية',

        // Cart / Checkout
        shoppingBag: 'حقيبة التسوق',
        cartEmpty: 'سلة التسوق فارغة حالياً. ابدأ بتصفح المنتجات!',
        itemCount: 'مجموع القطع',
        subtotal: 'المجموع الفرعي',
        discount: 'الخصم',
        total: 'الإجمالي النهائي',
        couponCode: 'كود الخصم / كوبون',
        applyCoupon: 'تطبيق الكود',
        couponApplied: 'تم تطبيق الكود بنجاح!',
        invalidCoupon: 'كوبون الخصم غير صالح أو منتهي الصلاحية',
        checkoutTitle: 'إتمام الطلب عبر واتساب',
        fullname: 'الاسم الكامل',
        phone: 'رقم الهاتف للتواصل',
        city: 'المدينة / المنطقة',
        addressDetails: 'العنوان بالتفصيل',
        whatsAppOrder: 'إرسال الطلب عبر واتساب',
        whatsAppTemplateTitle: '*طلب جديد من متجر هستيريا* 🛍️',
        whatsAppContactUs: 'أرجو التواصل لإتمام الطلب 🙏',
        orderSummary: 'ملخص الطلب المعروض',
        checkoutSuccess: 'تم إعداد طلبك بنجاح! سيتم تحويلك إلى واتساب لإتمام الشراء...',
        selectItemsToOrder: 'اختر المنتجات لإرسالها في الطلب',

        // Admin Panel General
        dashboard: 'الرئيسية',
        productsManage: 'المنتجات',
        categoriesManage: 'الفئات',
        brandsManage: 'الماركات',
        slidersManage: 'اللافتات المتحركة',
        adsManage: 'الإعلانات',
        couponsManage: 'الكوبونات',
        actions: 'الإجراءات',
        edit: 'تعديل',
        delete: 'حذف',
        addNew: 'إضافة جديد',
        save: 'حفظ',
        cancel: 'إلغاء',
        uploadImage: 'رفع صورة',
        uploading: 'جاري الرفع...',
        errorOccurred: 'حدث خطأ ما',
        confirmDelete: 'هل أنت متأكد من الحذف؟',
        active: 'نشط',
        inactive: 'غير نشط',
        yes: 'نعم',
        no: 'لا',
        optional: 'اختياري',

        // Admin Forms
        prodNameEn: 'الاسم بالإنجليزية',
        prodNameAr: 'الاسم بالعربية',
        prodNameHe: 'الاسم بالعبرية',
        descriptionItem: 'الوصف',
        priceOption: 'السعر (₪)',
        sizeOption: 'الحجم / السعة',
        colorOptionHex: 'Hex اللون (مثال: #ffffff)',
        colorNameOption: 'اسم اللون',
        shadeOption: 'درجة اللون (مثال: أحمر غامق / درجة 1)',
        categorySelect: 'اختر الفئة',
        brandSelect: 'اختر الماركة',
        parentCategory: 'الفئة الأب (إن وجد)',
        orderWeight: 'ترتيب الظهور',
        sliderInterval: 'مدة العرض (بالملي ثانية)',
        couponAmount: 'قيمة الخصم الثابتة (₪)',
        couponPercent: 'نسبة الخصم (%)',
        couponFrom: 'صالح من تاريخ',
        couponTo: 'صالح إلى تاريخ',
        couponName: 'اسم الكوبون',
        couponCodeField: 'رمز الكوبون (الرمز السري)',
    },
    en: {
        // Nav & General
        home: 'Home',
        categories: 'Categories',
        brands: 'Brands',
        cart: 'Cart',
        wishlist: 'Wishlist',
        search: 'Search perfumes, makeup...',
        searchPlaceholder: 'Search Histeria store...',
        admin: 'Admin Panel',
        adminLogin: 'Admin Login',
        login: 'Login',
        username: 'Username',
        password: 'Password',
        loggingIn: 'Logging in...',
        logout: 'Logout',
        currency: '₪',
        languageName: 'English',
        switchLanguage: 'Change Language',
        allRightsReserved: 'All rights reserved. Histeria Store 2026',

        // Announce bar
        announceText: '✨ Free shipping on orders over ₪350! Extra coupon code: HISTERIA10 ✨',

        // Products / Home
        featuredProducts: 'Featured Products',
        newArrivals: 'New Arrivals',
        shopCategory: 'Shop by Category',
        shopBrand: 'Shop by Brand',
        noProducts: 'No products matching search criteria found.',
        price: 'Price',
        details: 'Details',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        addedToCart: 'Added to cart successfully!',
        removedFromWishlist: 'Removed from wishlist',
        addedToWishlist: 'Added to wishlist',
        color: 'Color',
        shade: 'Color Shade',
        selectColor: 'Select Color',
        selectShade: 'Select Color Shade',
        size: 'Size',
        stockStatus: 'In Stock',
        relatedProducts: 'You May Also Like',
        searchResult: 'Search results for',
        filterByBrand: 'Filter by Brand',
        filterByCategory: 'Filter by Category',
        clearFilters: 'Clear Filters',

        // Cart / Checkout
        shoppingBag: 'Shopping Bag',
        cartEmpty: 'Your cart is empty. Start shopping now!',
        itemCount: 'Items',
        subtotal: 'Subtotal',
        discount: 'Discount',
        total: 'Total',
        couponCode: 'Coupon Code',
        applyCoupon: 'Apply Code',
        couponApplied: 'Coupon code applied successfully!',
        invalidCoupon: 'Invalid or expired coupon code',
        checkoutTitle: 'Complete WhatsApp Order',
        fullname: 'Full Name',
        phone: 'Phone Number',
        city: 'City / Region',
        addressDetails: 'Address Details',
        whatsAppOrder: 'Send Order via WhatsApp',
        whatsAppTemplateTitle: '*New Order from Histeria Store* 🛍️',
        whatsAppContactUs: 'Please contact me to confirm the order 🙏',
        orderSummary: 'Order Summary',
        checkoutSuccess: 'Order prepared! Redirecting you to WhatsApp to complete checkout...',
        selectItemsToOrder: 'Select items to include in this checkout',

        // Admin Panel General
        dashboard: 'Dashboard',
        productsManage: 'Products',
        categoriesManage: 'Categories',
        brandsManage: 'Brands',
        slidersManage: 'Sliders',
        adsManage: 'Ads',
        couponsManage: 'Coupons',
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete',
        addNew: 'Add New',
        save: 'Save',
        cancel: 'Cancel',
        uploadImage: 'Upload Image',
        uploading: 'Uploading...',
        errorOccurred: 'An error occurred',
        confirmDelete: 'Are you sure you want to delete this?',
        active: 'Active',
        inactive: 'Inactive',
        yes: 'Yes',
        no: 'No',
        optional: 'Optional',

        // Admin Forms
        prodNameEn: 'Name (English)',
        prodNameAr: 'Name (Arabic)',
        prodNameHe: 'Name (Hebrew)',
        descriptionItem: 'Description',
        priceOption: 'Price (₪)',
        sizeOption: 'Size / Volume',
        colorOptionHex: 'Hex Color (e.g. #ffffff)',
        colorNameOption: 'Color Name',
        shadeOption: 'Shade / Variant (e.g. Dark Red / Shade 1)',
        categorySelect: 'Select Category',
        brandSelect: 'Select Brand',
        parentCategory: 'Parent Category (Optional)',
        orderWeight: 'Order (Listing order)',
        sliderInterval: 'Interval (ms)',
        couponAmount: 'Flat Discount (₪)',
        couponPercent: 'Percentage Discount (%)',
        couponFrom: 'Valid From',
        couponTo: 'Valid To',
        couponName: 'Coupon Name',
        couponCodeField: 'Coupon Code',
    },
    he: {
        // Nav & General
        home: 'דף الבית',
        categories: 'קטגוריות',
        brands: 'מותגים',
        cart: 'עגלת קניות',
        wishlist: 'רשימת משאלות',
        search: 'חפש בשמים, איפור...',
        searchPlaceholder: 'חיפוש בחנות היסטריה...',
        admin: 'פאנל ניהול',
        adminLogin: 'כניסת מנהל',
        login: 'התחברות',
        username: 'שם משתמש',
        password: 'סיסמה',
        loggingIn: 'מתחבר...',
        logout: 'התנתק',
        currency: '₪',
        languageName: 'עברית',
        switchLanguage: 'שנה שפה',
        allRightsReserved: 'כל הזכויות שמורות. חנות היסטריה 2026',

        // Announce bar
        announceText: '✨ משלוח חינם ברכישה מעל ₪350! קופון הנחה נוסף: HISTERIA10 ✨',

        // Products / Home
        featuredProducts: 'מוצרים מומלצים',
        newArrivals: 'חדש באתר',
        shopCategory: 'קנה לפי קטגוריה',
        shopBrand: 'קנה לפי מותג',
        noProducts: 'לא נמצאו מוצרים תואמים לחיפוש.',
        price: 'מחיר',
        details: 'פרטים',
        addToCart: 'הוסף לעגלה',
        buyNow: 'קנה עכשיו',
        addedToCart: 'התווסף לעגלה בהצלחה!',
        removedFromWishlist: 'הוסר מרשימת המשאלות',
        addedToWishlist: 'נוסף לרשימת המשאלות',
        color: 'צבע',
        shade: 'גוון הצבע',
        selectColor: 'בחר צבע',
        selectShade: 'בחר גוון צבע',
        size: 'מידה',
        stockStatus: 'במלאי',
        relatedProducts: 'מוצרים שעשויים לעניין אותך',
        searchResult: 'תוצאות חיפוש עבור',
        filterByBrand: 'סנן לפי מותג',
        filterByCategory: 'סנן לפי קטגוריה',
        clearFilters: 'נקה מסננים',

        // Cart / Checkout
        shoppingBag: 'תיק קניות',
        cartEmpty: 'עגלת הקניות שלך ריקה. התחל לקנות עכשיו!',
        itemCount: 'פריטים',
        subtotal: 'סכום ביניים',
        discount: 'הנחה',
        total: 'סך הכל לתשלום',
        couponCode: 'קוד קופון',
        applyCoupon: 'החל קופון',
        couponApplied: 'הקופון הוחל בהצלחה!',
        invalidCoupon: 'קוד קופון לא תקין או פג תוקף',
        checkoutTitle: 'השלמת הזמנה בוואטסאפ',
        fullname: 'שם מלא',
        phone: 'מספר טלפון',
        city: 'עיר / אזור',
        addressDetails: 'כתובת מפורטת',
        whatsAppOrder: 'שלח הזמנה בוואטסאפ',
        whatsAppTemplateTitle: '*הזמנה חדשה מחנות היסטריה* 🛍️',
        whatsAppContactUs: 'אנא צרו קשר לאישור ההזמנה 🙏',
        orderSummary: 'סיכום הזמנה',
        checkoutSuccess: 'ההזמנה מוכנה! מעביר אותך לוואטסאפ להשלמת הרכישה...',
        selectItemsToOrder: 'בחר פריטים לכלול בהזמנה זו',

        // Admin Panel General
        dashboard: 'לוח בקרה',
        productsManage: 'מוצרים',
        categoriesManage: 'קטגוריות',
        brandsManage: 'מותגים',
        slidersManage: 'סליידרים',
        adsManage: 'פרסומות',
        couponsManage: 'קופונים',
        actions: 'פעולות',
        edit: 'ערוך',
        delete: 'מחק',
        addNew: 'הוסף חדש',
        save: 'שמור',
        cancel: 'בטל',
        uploadImage: 'העלה תמונה',
        uploading: 'מעלה...',
        errorOccurred: 'אירעה שגיאה',
        confirmDelete: 'האם אתה בטוח שברצונך למחוק?',
        active: 'פעיל',
        inactive: 'לא פעיל',
        yes: 'כן',
        no: 'לא',
        optional: 'אופציונלי',

        // Admin Forms
        prodNameEn: 'שם באנגלית',
        prodNameAr: 'שם בערבית',
        prodNameHe: 'שם בעברית',
        descriptionItem: 'תיאור',
        priceOption: 'מחיר (₪)',
        sizeOption: 'מידה / נפח',
        colorOptionHex: 'קוד צבע Hex (לדוגמה: #ffffff)',
        colorNameOption: 'שם צבע',
        shadeOption: 'גוון הצבע (למשל: אדום כהה)',
        categorySelect: 'בחר קטגוריה',
        brandSelect: 'בחר מותג',
        parentCategory: 'קטגוריית אב (אופציונלי)',
        orderWeight: 'סדר תצוגה',
        sliderInterval: 'מרווח זמן (במילישניות)',
        couponAmount: 'הנחה בשקלים (₪)',
        couponPercent: 'הנחה באחוזים (%)',
        couponFrom: 'בתוקף מתאריך',
        couponTo: 'בתוקף עד תאריך',
        couponName: 'שם קופון',
        couponCodeField: 'קוד קופון',
    },
};

interface LanguageContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    getLocalized: (item: any, fieldKey?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('histeria_language');
        return (saved as Language) || 'ar'; // Default language Arabic
    });

    const direction: Direction = language === 'en' ? 'ltr' : 'rtl';

    useEffect(() => {
        localStorage.setItem('histeria_language', language);
        // Apply direction and language attributes to the document node
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
    }, [language, direction]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    // Helper function to extract translated database property (e.g. name, description, size)
    const getLocalized = (item: any, fieldKey: string = 'name'): string => {
        if (!item) return '';
        if (language === 'ar' && item.arabic) {
            // Sometimes it is stored directly as property, let's see if we ask for a subfield
            // If the fieldKey is 'name' look for name directly or inside arabic
            try {
                if (fieldKey === 'name') return item.arabic; // The arabic column stores the translated name
                if (fieldKey === 'description' && item.arabic_description) return item.arabic_description;
                // Or if it's the exact field translated
                const parsed = typeof item.arabic === 'string' && item.arabic.startsWith('{') ? JSON.parse(item.arabic) : null;
                if (parsed && parsed[fieldKey]) return parsed[fieldKey];
            } catch (e) { }
            // Fallback: If arabic field matches standard keys
            return item.arabic;
        }

        if (language === 'he' && item.hebrew) {
            try {
                if (fieldKey === 'name') return item.hebrew;
                if (fieldKey === 'description' && item.hebrew_description) return item.hebrew_description;
                const parsed = typeof item.hebrew === 'string' && item.hebrew.startsWith('{') ? JSON.parse(item.hebrew) : null;
                if (parsed && parsed[fieldKey]) return parsed[fieldKey];
            } catch (e) { }
            return item.hebrew;
        }

        // Default to LTR language fields
        return item[fieldKey] || '';
    };

    return (
        <LanguageContext.Provider value={{ language, direction, setLanguage, t, getLocalized }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

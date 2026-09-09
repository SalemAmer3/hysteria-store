import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout components
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Pages
import { Home } from './pages/Home';
import { CategoryListing } from './pages/CategoryListing';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminLogin } from './pages/AdminLogin';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminBrands } from './pages/admin/AdminBrands';
import { AdminSliders } from './pages/admin/AdminSliders';
import { AdminAds } from './pages/admin/AdminAds';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminTicker } from './pages/admin/AdminTicker';

// ── Scroll-to-top + page transition ──────────────────────────────────────────
// Wraps page content in a div that:
//  1. Instantly scrolls to top on every route change (existing behaviour)
//  2. Applies a lightweight fade+translateY entry animation via .page-enter class
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname, search } = useLocation();
  const [key, setKey]         = useState(0);
  const prevPath              = useRef(pathname + search);

  useEffect(() => {
    const next = pathname + search;
    if (next === prevPath.current) return;
    prevPath.current = next;

    // Instant scroll — same as before
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Bump key to remount the wrapper div → re-triggers CSS animation
    setKey(k => k + 1);
  }, [pathname, search]);

  return (
    <div key={key} className="page-enter">
      {children}
    </div>
  );
};

// ── Store layout ──────────────────────────────────────────────────────────────
const StoreLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#070709] flex flex-col">
    <AnnouncementBar />
    <Navbar />
    <main className="flex-1 pt-4 md:pt-6">
      {/* Each public page gets the fade-in transition */}
      <PageTransition>{children}</PageTransition>
    </main>
    <Footer />
  </div>
);

// ── App root ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Public store routes */}
                <Route path="/"           element={<StoreLayout><Home /></StoreLayout>} />
                <Route path="/products"   element={<StoreLayout><CategoryListing /></StoreLayout>} />
                <Route path="/products/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
                <Route path="/cart"       element={<StoreLayout><CartPage /></StoreLayout>} />
                <Route path="/checkout"   element={<StoreLayout><CheckoutPage /></StoreLayout>} />
                <Route path="/wishlist"   element={<StoreLayout><WishlistPage /></StoreLayout>} />

                {/* Auth */}
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* Admin panel routes — no transition wrapper needed */}
                <Route path="/admin"              element={<AdminDashboard />} />
                <Route path="/admin/products"     element={<AdminProducts />} />
                <Route path="/admin/categories"   element={<AdminCategories />} />
                <Route path="/admin/brands"       element={<AdminBrands />} />
                <Route path="/admin/sliders"      element={<AdminSliders />} />
                <Route path="/admin/ads"          element={<AdminAds />} />
                <Route path="/admin/coupons"      element={<AdminCoupons />} />
                <Route path="/admin/ticker"       element={<AdminTicker />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;

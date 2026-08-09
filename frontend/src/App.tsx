import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

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

// Store layout wrapper
const StoreLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#070709] flex flex-col">
    <AnnouncementBar />
    <Navbar />
    <main className="flex-1 pt-4 md:pt-6">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public store routes */}
              <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
              <Route path="/products" element={<StoreLayout><CategoryListing /></StoreLayout>} />
              <Route path="/products/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
              <Route path="/cart" element={<StoreLayout><CartPage /></StoreLayout>} />
              <Route path="/checkout" element={<StoreLayout><CheckoutPage /></StoreLayout>} />
              <Route path="/wishlist" element={<StoreLayout><WishlistPage /></StoreLayout>} />

              {/* Auth */}
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Admin panel routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/brands" element={<AdminBrands />} />
              <Route path="/admin/sliders" element={<AdminSliders />} />
              <Route path="/admin/ads" element={<AdminAds />} />
              <Route path="/admin/coupons" element={<AdminCoupons />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

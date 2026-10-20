import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { JournalPage } from './pages/JournalPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top on route change helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Dedicated Editorial Landing Page at root route */}
                <Route path="/" element={<LandingPage />} />

                {/* Connected secondary routes wrapped in shared layout */}
                <Route element={<Layout />}>
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="product/:slug" element={<ProductDetailPage />} />
                  <Route path="collections" element={<CollectionsPage />} />
                  <Route path="journal" element={<JournalPage />} />
                  <Route path="style-discovery" element={<Navigate to="/journal" replace />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/index.css';

// Lazy load pages for faster initial loading
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PlaceOrderPage = lazy(() => import('./pages/PlaceOrderPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminProductListPage = lazy(() => import('./pages/AdminProductListPage'));
const AdminProductPage = lazy(() => import('./pages/AdminProductPage'));
const AdminProductEditPage = lazy(() => import('./pages/AdminProductEditPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));

// Loading component for Suspense
const PageLoader = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '1.2rem',
        color: '#ffd700'
    }}>
        <div className="loader">Loading...</div>
    </div>
);

function App() {
    return (
        <Router>
            <div className="app-container">
                <Header />
                <main style={{ minHeight: '80vh' }}>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/shipping" element={<ShippingPage />} />
                            <Route path="/payment" element={<PaymentPage />} />
                            <Route path="/placeorder" element={<PlaceOrderPage />} />
                            <Route path="/order/:id" element={<OrderPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/admin/product" element={<AdminProductListPage />} />
                            <Route path="/admin/product/create" element={<AdminProductPage />} />
                            <Route path="/admin/product/:id/edit" element={<AdminProductEditPage />} />
                            <Route path="/admin/settings" element={<AdminSettingsPage />} />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;

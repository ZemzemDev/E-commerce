import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderPage from './pages/OrderPage';
import ProfilePage from './pages/ProfilePage';
import AdminProductListPage from './pages/AdminProductListPage';
import AdminProductPage from './pages/AdminProductPage';
import AdminProductEditPage from './pages/AdminProductEditPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import './styles/index.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Header />
                <main style={{ minHeight: '80vh' }}>
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
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;

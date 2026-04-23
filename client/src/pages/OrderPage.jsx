import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MockPaymentModal from '../components/MockPaymentModal';
import { API_URL } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import '../styles/CartPage.css';

const OrderPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { getCurrencySymbol } = useSettings();
    const location = useLocation();
    const [paying, setPaying] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [showMockModal, setShowMockModal] = useState(false);

    const fetchOrder = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${API_URL}/orders/${id}`, config);
            setOrder(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrder();
        }
    }, [id, user]);

    // Handle Stripe redirect logic
    useEffect(() => {
        if (user && order && !order.isPaid) {
            const query = new URLSearchParams(location.search);
            const sessionId = query.get('session_id');

            if (sessionId) {
                const verifyPayment = async () => {
                    try {
                        const config = {
                            headers: { Authorization: `Bearer ${user.token}` },
                        };
                        await axios.post(`${API_URL}/orders/${id}/verify-payment`, { session_id: sessionId }, config);
                        fetchOrder(); // Refetch to get updated status
                    } catch (error) {
                        console.error('Payment verification failed', error);
                    }
                };
                verifyPayment();
            }
        }
    }, [location, user, order, id]);

    const successPaymentHandler = async (paymentResult) => {
        setIsFinalizing(true);
        console.log('✅ Finalizing payment on backend for order:', id);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(`${API_URL}/orders/${id}/pay`, paymentResult || {}, config);
            console.log('✅ Order updated to PAID:', data);
            fetchOrder();
        } catch (error) {
            console.error('❌ Backend Payment Update Error:', error);
            const message = error.response?.data?.message || error.message;
            alert(`Payment was captured by PayPal, but we failed to update our database: ${message}. Your order status might update in a few minutes.`);
        } finally {
            setIsFinalizing(false);
        }
    };

    const payHandler = async () => {
        setPaying(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            if (order.paymentMethod === 'Stripe') {
                const { data } = await axios.post(`${API_URL}/orders/${id}/create-checkout-session`, {}, config);
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    setPaying(false);
                }
            } else {
                // For PayPal it's handled by PayPalButtons component now
                setPaying(false);
            }
        } catch (error) {
            console.error(error);
            setPaying(false);
        }
    };

    if (loading) return <div className="container"><p>Loading order...</p></div>;
    if (!order) return <div className="container"><p>Order not found</p></div>;

    return (
        <div className="container order-page">
            <h1 className="page-title">Order <span>#{order._id?.substring(0, 8) || order.id?.substring(0, 8)}</span></h1>
            <div className="checkout-grid">
                <div className="checkout-details">
                    <div className="premium-card mb-4">
                        <h3>Shipping Info</h3>
                        <p><strong>Name:</strong> {order.user?.name || 'Anonymous'}</p>
                        <p><strong>Email:</strong> {order.user?.email || 'No email'}</p>
                        <p><strong>Address:</strong> {order.shippingAddress?.address || 'N/A'}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
                    </div>
                    <div className="premium-card mb-4">
                        <h3>Payment Status</h3>
                        <p><strong>Method:</strong> {order.paymentMethod}</p>
                        <div className={`status-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                            {order.isPaid ? `Paid on ${order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'N/A'}` : 'Not Paid'}
                        </div>
                    </div>
                    <div className="premium-card">
                        <h3>Order Items</h3>
                        <ul className="order-items-list">
                            {order.orderItems.map((item, index) => (
                                <li key={index} className="order-item">
                                    <img src={item.image} alt={item.name} className="order-item-img" />
                                    <div className="order-item-info">
                                        <Link to={`/product/${item.product || item.ProductId}`}>{item.name}</Link>
                                        <p>{item.qty} x {getCurrencySymbol()}{item.price} = <strong>{getCurrencySymbol()}{(Number(item.qty || 0) * Number(item.price || 0)).toFixed(2)}</strong></p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="checkout-summary">
                    <div className="premium-card summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Items</span>
                            <span>{getCurrencySymbol()}{Number(order.totalPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{getCurrencySymbol()}{Number(order.totalPrice || 0).toFixed(2)}</span>
                        </div>
                        {isFinalizing && (
                            <div className="finalizing-badge" style={{ 
                                background: '#3498db1a', 
                                color: '#3498db', 
                                padding: '0.8rem', 
                                borderRadius: '8px', 
                                textAlign: 'center',
                                marginTop: '1rem',
                                border: '1px dashed #3498db'
                            }}>
                                🔄 <strong>Processing your payment...</strong><br/>
                                <small>Please don't refresh the page.</small>
                            </div>
                        )}
                        {!order.isPaid && !isFinalizing && (
                            <div className="payment-actions">
                                {order.paymentMethod === 'Stripe' ? (
                                    <button
                                        className="auth-btn w-full mt-4"
                                        onClick={payHandler}
                                        disabled={paying}
                                    >
                                        {paying ? 'Processing Payment...' : 'Pay with Stripe'}
                                    </button>
                                ) : (
                                    <div className="mt-4">
                                        <button 
                                            className="auth-btn w-full mb-3" 
                                            onClick={() => setShowMockModal(true)}
                                            style={{background: "linear-gradient(135deg, #1e1e1e, #121212)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "600", padding: "14px", fontSize: "1rem", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", cursor: "pointer"}}
                                            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                                        >
                                            <span>💳 Secure Credit Card Checkout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {order.isPaid && <div className="success-badge">✅ Order Paid Successfully</div>}
                    </div>
                </div>
            </div>
            {showMockModal && (
                <MockPaymentModal 
                    amount={order.totalPrice} 
                    onClose={() => setShowMockModal(false)} 
                    onSuccess={(result) => {
                        setShowMockModal(false);
                        successPaymentHandler(result);
                    }} 
                />
            )}
        </div>
    );
};

export default OrderPage;

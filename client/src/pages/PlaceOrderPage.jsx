import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/CartPage.css';

const PlaceOrderPage = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingAddress, setShippingAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');

    // Load and validate data safely
    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=placeorder');
            return;
        }

        const savedAddress = localStorage.getItem('shippingAddress');
        const savedMethod = localStorage.getItem('paymentMethod');

        if (!savedAddress) {
            navigate('/shipping');
        } else {
            try {
                setShippingAddress(JSON.parse(savedAddress));
            } catch (e) {
                console.error('Error parsing shipping address', e);
                navigate('/shipping');
            }
        }

        if (savedMethod) {
            setPaymentMethod(savedMethod);
        }
    }, [user, navigate]);

    const placeOrderHandler = async () => {
        if (!shippingAddress || !paymentMethod) {
            setError('Please complete shipping and payment details.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post('http://localhost:5000/api/orders', {
                orderItems: cart,
                shippingAddress,
                paymentMethod,
                totalPrice: cartTotal,
            }, config);

            clearCart();
            navigate(`/order/${data._id || data.id}`);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to place order. Please try again.';
            setError(message);
            console.error('Order Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!shippingAddress) {
        return <div className="container py-5 text-center"><h2>Loading Review...</h2></div>;
    }

    return (
        <div className="container place-order-page">
            <h1 className="page-title">Review <span>Order</span></h1>
            {error && (
                <div className="error-msg premium-card" style={{ 
                    color: '#ff4d4d', 
                    background: 'rgba(255, 77, 77, 0.1)', 
                    borderColor: '#ff4d4d', 
                    marginBottom: '1.5rem', 
                    padding: '1rem',
                    border: '1px solid'
                }}>
                    {error}
                </div>
            )}
            <div className="checkout-grid">
                <div className="checkout-details">
                    <div className="premium-card mb-4">
                        <h3>Shipping</h3>
                        <p><strong>Address:</strong> {shippingAddress?.address}, {shippingAddress?.city}, {shippingAddress?.postalCode}, {shippingAddress?.country}</p>
                    </div>
                    <div className="premium-card mb-4">
                        <h3>Payment Method</h3>
                        <p><strong>Method:</strong> {paymentMethod || 'Not Selected'}</p>
                    </div>
                    <div className="premium-card">
                        <h3>Order Items</h3>
                        {cart.length === 0 ? <p>Your cart is empty</p> : (
                            <ul className="order-items-list">
                                {cart.map((item, index) => (
                                    <li key={index} className="order-item">
                                        <img src={item.image} alt={item.name} className="order-item-img" />
                                        <div className="order-item-info">
                                            <Link to={`/product/${item.product || item._id}`}>{item.name}</Link>
                                            <p>{item.qty} x ${item.price} = <strong>${(Number(item.qty || 0) * Number(item.price || 0)).toFixed(2)}</strong></p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className="checkout-summary">
                    <div className="premium-card summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Items</span>
                            <span>${Number(cartTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${Number(cartTotal || 0).toFixed(2)}</span>
                        </div>
                        <button
                            className="place-order-btn"
                            disabled={cart.length === 0 || loading}
                            onClick={placeOrderHandler}
                        >
                            {loading ? 'Processing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;

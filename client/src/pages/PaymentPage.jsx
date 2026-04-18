import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';
import { useAuth } from '../context/AuthContext';

const PaymentPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=payment');
        }
    }, [user, navigate]);

    const [paymentMethod, setPaymentMethod] = useState('CreditCard');

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('paymentMethod', paymentMethod);
        navigate('/placeorder');
    };

    return (
        <div className="auth-page container">
            <div className="premium-card auth-card">
                <h2>Payment <span>Method</span></h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Method</label>
                        <div className="radio-group">
                            <label className="radio-container">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="CreditCard"
                                    checked={paymentMethod === 'CreditCard'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="checkmark"></span>
                                Secure Credit Card
                            </label>
                            <label className="radio-container">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Stripe"
                                    checked={paymentMethod === 'Stripe'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span className="checkmark"></span>
                                Stripe
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="auth-btn">Continue to Review</button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;

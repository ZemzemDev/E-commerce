import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Lock, X, Check } from 'lucide-react';
import '../styles/MockPaymentModal.css';

const MockPaymentModal = ({ amount, onClose, onSuccess }) => {
    const [cardNumber, setCardNumber] = useState('4242424242424242');
    const [expiry, setExpiry] = useState('12/28');
    const [cvc, setCvc] = useState('123');
    
    // States: 'idle' | 'processing' | 'success'
    const [status, setStatus] = useState('idle');

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const handleCardChange = (e) => {
        setCardNumber(formatCardNumber(e.target.value));
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setExpiry(val);
    };

    const handlePay = () => {
        setStatus('processing');
        
        // Simulate bank process delay
        setTimeout(() => {
            setStatus('success');
            
            // Allow user to see the success checkmark before closing
            setTimeout(() => {
                onSuccess({
                    id: `mock_cc_${Date.now()}`,
                    status: 'COMPLETED',
                    payer: { email_address: 'mock_card@example.com' },
                    gateway: 'MockPremiumGateway'
                });
            }, 1500);
        }, 2000);
    };

    return (
        <div className="mock-payment-overlay">
            <div className="mock-payment-modal">
                <div className="mock-payment-header">
                    <h3>Complete Secure Payment</h3>
                    {status === 'idle' && (
                        <button className="close-modal-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                {status === 'idle' && (
                    <>
                        <div className="mock-card-visual">
                            <div className="card-chip"></div>
                            <div className="card-number-display">
                                {cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="card-details-display">
                                <span>Cardholder Name</span>
                                <span>{expiry || 'MM/YY'}</span>
                            </div>
                        </div>

                        <div className="mp-input-group">
                            <label>Card Number</label>
                            <div className="mp-input-wrapper">
                                <CreditCard size={18} className="mp-icon" />
                                <input 
                                    className="mp-input"
                                    type="text" 
                                    maxLength="19" 
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={handleCardChange}
                                />
                            </div>
                        </div>

                        <div className="mp-row">
                            <div className="mp-input-group">
                                <label>Expiry Date</label>
                                <div className="mp-input-wrapper">
                                    <Calendar size={18} className="mp-icon" />
                                    <input 
                                        className="mp-input"
                                        type="text" 
                                        maxLength="5" 
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={handleExpiryChange}
                                    />
                                </div>
                            </div>
                            <div className="mp-input-group">
                                <label>CVC / CVV</label>
                                <div className="mp-input-wrapper">
                                    <Lock size={18} className="mp-icon" />
                                    <input 
                                        className="mp-input"
                                        type="text" 
                                        maxLength="4" 
                                        placeholder="123"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            className="mp-pay-btn" 
                            onClick={handlePay}
                        >
                            <Lock size={16} /> Pay ${Number(amount).toFixed(2)}
                        </button>
                    </>
                )}

                {status === 'processing' && (
                    <div className="mp-state-container">
                        <div className="spinner"></div>
                        <h3>Processing Payment</h3>
                        <p>Communicating with your bank...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="mp-state-container">
                        <div className="success-circle">
                            <Check size={32} color="white" />
                        </div>
                        <h3>Payment Successful!</h3>
                        <p>Your order is confirmed.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockPaymentModal;

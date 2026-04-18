import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';
import { useAuth } from '../context/AuthContext';

const ShippingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=shipping');
        }
    }, [user, navigate]);

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');


    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('shippingAddress', JSON.stringify({ address, city, postalCode, country }));
        navigate('/payment');
    };

    return (
        <div className="auth-page container">
            <div className="premium-card auth-card">
                <h2>Shipping <span>Details</span></h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            placeholder="Enter address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            placeholder="Enter city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Postal Code</label>
                        <input
                            type="text"
                            placeholder="Enter postal code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Country</label>
                        <input
                            type="text"
                            placeholder="Enter country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">Continue to Payment</button>
                </form>
            </div>
        </div>
    );
};

export default ShippingPage;

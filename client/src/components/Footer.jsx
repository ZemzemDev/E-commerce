import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-section">
                    <h3>ELITE<span>STORE</span></h3>
                    <p>The ultimate destination for premium electronics and lifestyle gear.</p>
                </div>
                <div className="footer-section">
                    <h4>Customer Care</h4>
                    <ul>
                        <li>Help Center</li>
                        <li>Shipping & Delivery</li>
                        <li>Returns</li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                        <span>Twitter</span> <span>Instagram</span> <span>LinkedIn</span>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 ELITE STORE. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

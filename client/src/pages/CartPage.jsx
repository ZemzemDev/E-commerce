import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import '../styles/CartPage.css';

const CartPage = () => {
    const { cart, removeFromCart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    return (
        <div className="cart-page container">
            <h1>Your <span>Shopping Bag</span></h1>
            {cart.length === 0 ? (
                <div className="empty-cart">
                    <p>Your bag is empty.</p>
                    <Link to="/" className="continue-btn">Explore Products</Link>
                </div>
            ) : (
                <div className="cart-container">
                    <div className="cart-items">
                        {cart.map((item) => (
                            <div key={item._id} className="premium-card cart-item">
                                <img src={item.image} alt={item.name} />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-price">${item.price.toFixed(2)} x {item.qty}</p>
                                </div>
                                <button onClick={() => removeFromCart(item._id)} className="remove-btn">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary premium-card">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free">FREE</span>
                        </div>
                        <hr />
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button className="checkout-btn" onClick={() => navigate('/login?redirect=shipping')}>
                            Proceed to Checkout
                        </button>
                        <button onClick={clearCart} className="clear-btn">Clear Bag</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;

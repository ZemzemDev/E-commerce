import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/productConstants';
import { API_URL } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import '../styles/HomePage.css';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { getCurrencySymbol } = useSettings();
    const navigate = useNavigate();

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const category = params.get('category') || '';


    const [heroImages, setHeroImages] = useState([]);
    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const fetchHero = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/settings/hero-backgrounds`);
                setHeroImages(data);
            } catch (error) {
                console.error('Error fetching hero backgrounds:', error);
            }
        };
        fetchHero();
    }, []);

    useEffect(() => {
        if (heroImages.length > 0) {
            const interval = setInterval(() => {
                setCurrentBg((prev) => (prev + 1) % heroImages.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [heroImages.length]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const url = keyword || category
                    ? `${API_URL}/products?keyword=${keyword}&category=${category === 'All' ? '' : category}`
                    : `${API_URL}/products`;
                const { data } = await axios.get(url);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [keyword, category]);

    return (
        <div className="home-page">
            {!keyword && !category && (
                <section
                    className="hero"
                    style={{
                        backgroundImage: heroImages.length > 0
                            ? `url(${heroImages[currentBg]})`
                            : `url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070')`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                >
                    <div className="container hero-content">
                        <h1>Premium <span>Electronics</span> Store</h1>
                        <p>Discover the latest in high-end phones, laptops, smart watch...</p>
                        <button 
                            className="cta-btn" 
                            onClick={() => {
                                document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Explore Tech
                        </button>
                    </div>
                </section>
            )}



            <section id="featured-products" className="featured container">
                <h2 className="section-title">
                    {keyword ? `Search results for "${keyword}"` : category ? `${category} Collection` : 'Featured Products'}
                </h2>
                {products.length > 0 && products[0]._id.toString().startsWith('mock') && (
                    <div className="demo-notice">
                        <p>⚠️ <strong>Offline Mode:</strong> Could not connect to the database. Showing premium fallback products.</p>
                    </div>
                )}
                {loading ? (
                    <div className="loading">Loading premium product...</div>
                ) : (
                    <div className="product-grid">
                        {products.length > 0 ? products.map((product, index) => (
                            <div key={product._id} className="premium-card product-card">
                                {index < 3 && !keyword && !category && (
                                    <span className="new-badge">New Arrival</span>
                                )}
                                <Link to={`/product/${product._id}`}>
                                    <img src={product.image} alt={product.name} className="product-image" />
                                    <span className="product-brand">{product.brand}</span>
                                    <h3>{product.name}</h3>
                                </Link>
                                <p className="price">{getCurrencySymbol()}{product.price.toFixed(2)}</p>
                                <button
                                    className="add-to-cart"
                                    onClick={() => {
                                        if (user) {
                                            addToCart(product);
                                        } else {
                                            navigate('/login');
                                        }
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        )) : (
                            <div className="no-results">
                                <p>No products found matching your search. Try different keywords or categories!</p>
                                <Link to="/" className="clear-filter-btn">Clear Filters</Link>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;

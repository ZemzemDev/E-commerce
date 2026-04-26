import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { API_URL } from '../utils/api';
import '../styles/ProductPage.css';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { getCurrencySymbol } = useSettings();

    useEffect(() => {
        const fetchProductAndRelated = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_URL}/products/${id}`);
                setProduct(data);

                // Fetch related products (same category, excluding current)
                const { data: related } = await axios.get(`${API_URL}/products?category=${data.category}`);
                setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 8));
            } catch (error) {
                console.error('Error fetching product details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndRelated();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '5rem' }}><div className="loading">Loading premium tech...</div></div>;
    if (!product) return <div className="container" style={{ padding: '5rem' }}>Product not found.</div>;

    return (
        <div className="product-page container">
            <div className="breadcrumbs">
                <Link to="/">Home</Link> / <Link to={`/?category=${product.category}`}>{product.category}</Link> / <span>{product.name}</span>
            </div>

            <div className="product-main">
                <div className="product-image-container premium-card">
                    <img src={product.image} alt={product.name} />
                </div>

                <div className="product-info">
                    <span className="brand-tag">{product.brand}</span>
                    <h1>{product.name}</h1>
                    <div className="price-container">
                        <p className="price">{getCurrencySymbol()}{product.price.toFixed(2)}</p>
                        <span className={product.countInStock > 0 ? 'status-in-stock' : 'status-out-of-stock'}>
                            {product.countInStock > 0 ? '● In Stock' : '● Out of Stock'}
                        </span>
                    </div>

                    <p className="description">{product.description}</p>

                    <div className="shipping-info-box">
                        <span className="shipping-icon">🚚</span>
                        <div>
                            <strong>Free Same-Day Shipping</strong>
                            <p>Order within 2 hours for today's dispatch. Free returns for 30 days.</p>
                        </div>
                    </div>

                    {product.specifications && product.specifications.length > 0 && (
                        <div className="specs-section">
                            <h3>Key Specifications</h3>
                            <ul>
                                {product.specifications.map((spec, i) => (
                                    <li key={i}><CheckCircle size={14} className="spec-icon" /> {spec}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            className="add-to-cart-btn"
                            disabled={product.countInStock === 0}
                            onClick={() => {
                                if (user) {
                                    addToCart(product);
                                } else {
                                    navigate('/login');
                                }
                            }}
                        >
                            <ShoppingCart size={20} /> Add to Cart
                        </button>
                        
                        {user && user.isAdmin && (
                            <button
                                className="add-to-cart-btn"
                                style={{ background: '#333' }}
                                onClick={() => navigate(`/admin/product/${product.id}/edit`)}
                            >
                                Edit Product
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="related-section">
                    <h2 className="section-title-alt">Related <span>Products</span></h2>
                    <div className="product-grid">
                        {relatedProducts.map((p) => (
                            <div key={p.id} className="premium-card product-card">
                                <Link to={`/product/${p.id}`}>
                                    <img src={p.image} alt={p.name} className="product-image" />
                                    <h3>{p.name}</h3>
                                </Link>
                                <p className="price">{getCurrencySymbol()}{p.price.toFixed(2)}</p>
                                <button
                                    className="add-to-cart"
                                    onClick={() => {
                                        if (user) {
                                            addToCart(p);
                                        } else {
                                            navigate('/login');
                                        }
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;

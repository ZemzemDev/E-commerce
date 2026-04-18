import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/productConstants';
import { API_URL } from '../utils/api';
import '../styles/Header.css';

const Header = () => {
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const [keyword, setKeyword] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [liveResults, setLiveResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const activeCategory = params.get('category') || 'All';


    const submitHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/?keyword=${keyword}`);
        } else {
            navigate('/');
        }
    };

    const logoutHandler = () => {
        setShowDropdown(false);
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchResults = async () => {
            if (keyword.trim().length > 0) {
                setIsSearchLoading(true);
                try {
                    const { data } = await axios.get(`${API_URL}/products?keyword=${keyword}`);
                    setLiveResults(data.slice(0, 8)); // Limit to 8 results
                    setShowResults(true);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                } finally {
                    setIsSearchLoading(false);
                }
            } else {
                setLiveResults([]);
                setShowResults(false);
            }
        };

        const debounce = setTimeout(fetchResults, 150);
        return () => clearTimeout(debounce);
    }, [keyword]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const resultClickHandler = (productId) => {
        navigate(`/product/${productId}`);
        setKeyword('');
        setShowResults(false);
    };

    return (
        <header className="header">
            <div className="header-top">
                <nav className="nav container">
                    <Link to="/" className="logo">
                        ELITE<span>STORE</span>
                    </Link>
                    <form onSubmit={submitHandler} className="search-bar" ref={searchRef}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search premium products..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onFocus={() => keyword.length > 1 && setShowResults(true)}
                        />
                        {showResults && liveResults.length > 0 && (
                            <div className="live-search-results">
                                {liveResults.map((product) => (
                                    <div
                                        key={product._id}
                                        className="result-item"
                                        onClick={() => resultClickHandler(product._id)}
                                    >
                                        <img src={product.image} alt={product.name} className="result-img" />
                                        <div className="result-info">
                                            <span className="result-name">{product.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isSearchLoading && <div className="search-loader-mini"></div>}
                    </form>
                    <ul className="nav-links">
                        <li>
                            <Link to="/cart" className="cart-link">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                <span>Cart</span>
                            </Link>
                        </li>
                        {user && user.name ? (
                            <li className="user-nav" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                                <div className="user-info-trigger">
                                    <span className="user-name">Hi, {user.name?.split(' ')[0] || 'User'}</span>
                                    <User size={18} />
                                </div>

                                {showDropdown && (
                                    <div className="user-dropdown premium-card">
                                        <Link to="/profile" className="dropdown-item">My Account</Link>
                                        {user && user.isAdmin && (
                                            <Link to="/admin/settings" className="dropdown-item" style={{ color: 'var(--primary-color)', opacity: 0.8 }}>
                                                Store Settings
                                            </Link>
                                        )}
                                        <Link to="/profile" className="dropdown-item">Settings</Link>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={logoutHandler} className="dropdown-item logout-item">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </li>
                        ) : (
                            <li><Link to="/login"><User size={20} /> <span>Sign In</span></Link></li>
                        )}
                    </ul>
                </nav>
            </div>

            <div className="header-bottom">
                <div className="container category-static-nav">
                    {CATEGORIES.map((c) => (
                        <Link
                            key={c}
                            to={c === 'All' ? '/' : `/?category=${c}`}
                            className={`category-static-link ${activeCategory === c ? 'active' : ''}`}
                        >
                            {c}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;

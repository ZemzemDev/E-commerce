import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Package, Settings, ChevronRight, Loader, ShieldCheck, BadgeCheck, LogOut, Camera } from 'lucide-react';
import { API_URL } from '../utils/api';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [settingsTab, setSettingsTab] = useState('edit-profile');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setName(user.name);
            setEmail(user.email);
            setPassword('');
            setConfirmPassword('');
            fetchMyOrders();
        }
    }, [user, navigate]);

    const logoutHandler = () => {
        logout();
        navigate('/login');
    };

    const fetchMyOrders = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${API_URL}/orders/myorders`, config);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword && password !== '') { // Only check if password is being changed
            setMessage('Passwords do not match');
        } else {
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const updateData = { name, email };
                if (password) { // Only send password if it's not empty
                    updateData.password = password;
                }

                const { data } = await axios.put(
                    `${API_URL}/auth/profile`,
                    updateData,
                    config
                );
                // Update local storage and context
                localStorage.setItem('userInfo', JSON.stringify(data));
                login(data); // Update user context
                setMessage('Profile Updated Successfully');
                setPassword('');
                setConfirmPassword('');
            } catch (error) {
                setMessage(error.response?.data?.message || error.message);
            }
        }
    };

    const renderSettingsContent = () => {
        switch (settingsTab) {
            case 'edit-profile':
                return (
                    <div className="settings-panel">
                        <h2>Account <span>Settings</span></h2>
                        {message && <div className={`message-alert ${message.includes('Success') ? 'success' : 'error'}`}>{message}</div>}
                        <form onSubmit={submitHandler} className="profile-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" placeholder="Leave blank to keep same" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="update-btn">Save Changes</button>
                        </form>
                    </div>
                );
            case 'shipping':
                return (
                    <div className="settings-panel">
                        <h2>Shipping <span>Address</span></h2>
                        <div className="empty-state">
                            <div className="icon-badge">🏠</div>
                            <p>No addresses saved yet. Your primary shipping address will appear here.</p>
                            <button className="add-btn">+ Add New Address</button>
                        </div>
                    </div>
                );
            case 'language':
                return (
                    <div className="settings-panel">
                        <h2>Language & <span>Region</span></h2>
                        <div className="form-group">
                            <label>Default Store Language</label>
                            <select className="premium-select">
                                <option>English (US)</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Currency</label>
                            <select className="premium-select">
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                                <option>GBP (£)</option>
                            </select>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="settings-panel">
                        <h2>Notification <span>Preferences</span></h2>
                        <div className="toggle-group">
                            <div className="toggle-item">
                                <div>
                                    <h4>Order Updates</h4>
                                    <p>Get notified about your order status</p>
                                </div>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div className="toggle-item">
                                <div>
                                    <h4>Promotions</h4>
                                    <p>Exclusive deals and discounts</p>
                                </div>
                                <input type="checkbox" />
                            </div>
                        </div>
                    </div>
                );
            case 'privacy':
                return (
                    <div className="settings-panel">
                        <h2>Privacy <span>Policy</span></h2>
                        <div className="policy-text">
                            <p>We take your privacy seriously. All your data is encrypted and used only for fulfilling your premium electronics orders.</p>
                            <p>Last updated: June 2024</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="profile-page container">
            <div className="profile-sidebar premium-card">
                <div className="user-profile-header">
                    <div className="user-avatar-wrapper">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {user?.isAdmin && <div className="admin-status-ring"><ShieldCheck size={14} /></div>}
                        <button className="avatar-edit-btn"><Camera size={14} /></button>
                    </div>
                    <div className="user-meta">
                        <h3>{user?.name} {user?.isAdmin && <BadgeCheck size={18} className="verified-icon" title="Verified Store Admin" />}</h3>
                        <p>{user?.email}</p>
                    </div>
                </div>

                <div className="profile-nav">
                    <button
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> My Profile
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={18} /> Order History
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={18} /> Settings
                    </button>
                    {user && user.isAdmin && (
                        <div className="sidebar-divider">
                            <span>Admin</span>
                            <button
                                className="nav-item admin-nav-item"
                                onClick={() => navigate('/admin/product')}
                            >
                                <ShieldCheck size={18} /> Manage Products
                            </button>
                            <button
                                className="nav-item admin-nav-item"
                                onClick={() => navigate('/admin/settings')}
                                style={{ marginTop: '0.5rem' }}
                            >
                                <Settings size={18} /> Store Settings
                            </button>
                        </div>
                    )}
                    <button className="nav-item logout-nav-item" onClick={logoutHandler}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>

            <div className="profile-content">
                {activeTab === 'profile' && (
                    <div className="premium-card profile-info-card">
                        <h2>Account <span>Overview</span></h2>
                        <div className="overview-grid">
                            <div className="overview-item">
                                <label>Full Name</label>
                                <p>{user?.name}</p>
                            </div>
                            <div className="overview-item">
                                <label>Email</label>
                                <p>{user?.email}</p>
                            </div>
                            <div className="overview-item">
                                <label>Member Since</label>
                                <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="overview-actions">
                            <button className="accent-btn" onClick={() => { setActiveTab('settings'); setSettingsTab('edit-profile'); }}>
                                Manage Settings
                            </button>
                            {user && user.isAdmin && (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button className="admin-btn-accent" onClick={() => navigate('/admin/product')}>
                                        Manage Product Inventory
                                    </button>
                                    <button className="admin-btn-accent" onClick={() => navigate('/admin/settings')} style={{ background: '#333' }}>
                                        Customize Store Look
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="premium-card orders-container">
                        <h2>Order <span>History</span></h2>
                        {loadingOrders ? (
                            <div className="loading-spinner"><Loader className="spin" /></div>
                        ) : orders.length === 0 ? (
                            <div className="no-orders">
                                <p>You haven't placed any orders yet.</p>
                                <button onClick={() => navigate('/')} className="shop-now-btn">Start Shopping</button>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map((order) => (
                                    <div key={order._id} className="order-item-card">
                                        <div className="order-header">
                                            <div className="order-id">
                                                <span>ID: {order._id.substring(0, 10)}...</span>
                                                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className={`order-status ${order.isPaid ? 'paid' : 'unpaid'}`}>
                                                {order.isPaid ? 'Paid' : 'Pending Payment'}
                                            </div>
                                        </div>
                                        <div className="order-details">
                                            <div className="order-total">
                                                <span>Total:</span>
                                                <strong>${order.totalPrice.toFixed(2)}</strong>
                                            </div>
                                            <button
                                                className="view-order-btn"
                                                onClick={() => navigate(`/order/${order._id}`)}
                                            >
                                                Details <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-layout">
                        <div className="premium-card settings-sidebar">
                            <button className={`settings-nav-item ${settingsTab === 'edit-profile' ? 'active' : ''}`} onClick={() => setSettingsTab('edit-profile')}>Profile Details</button>
                            <button className={`settings-nav-item ${settingsTab === 'shipping' ? 'active' : ''}`} onClick={() => setSettingsTab('shipping')}>Shipping Address</button>
                            <button className={`settings-nav-item ${settingsTab === 'language' ? 'active' : ''}`} onClick={() => setSettingsTab('language')}>Language & Currency</button>
                            <button className={`settings-nav-item ${settingsTab === 'notifications' ? 'active' : ''}`} onClick={() => setSettingsTab('notifications')}>Notifications</button>
                            <button className={`settings-nav-item ${settingsTab === 'privacy' ? 'active' : ''}`} onClick={() => setSettingsTab('privacy')}>Privacy Policy</button>
                            <div className="dropdown-divider"></div>
                            <button className="settings-nav-item logout-link" onClick={logoutHandler}>Sign Out</button>
                        </div>
                        <div className="premium-card settings-main">
                            {renderSettingsContent()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;

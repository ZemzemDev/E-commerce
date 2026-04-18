import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, ArrowLeft, Package, Search } from 'lucide-react';
import { API_URL } from '../utils/api';
import '../styles/AdminProductListPage.css';

const AdminProductListPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [editingCell, setEditingCell] = useState(null); // { id, field }
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/products`);
            setProducts(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load products' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchProducts();
    }, [user, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await axios.delete(`${API_URL}/products/${id}`, config);
                setMessage({ type: 'success', text: 'Product deleted successfully' });
                // Clean up selection if it was selected
                const newSelected = new Set(selectedIds);
                newSelected.delete(id);
                setSelectedIds(newSelected);
                fetchProducts();
                setTimeout(() => setMessage(null), 3000);
            } catch (error) {
                setMessage({ type: 'error', text: error.response?.data?.message || 'Delete failed' });
            }
        }
    };

    const bulkDeleteHandler = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) {
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await axios.post(`${API_URL}/products/bulk-delete`, { ids: Array.from(selectedIds) }, config);
                setMessage({ type: 'success', text: `${selectedIds.size} products deleted successfully` });
                setSelectedIds(new Set());
                fetchProducts();
                setTimeout(() => setMessage(null), 3000);
            } catch (error) {
                setMessage({ type: 'error', text: error.response?.data?.message || 'Bulk delete failed' });
            }
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(filteredProducts.map(p => p._id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (e, id) => {
        const newSelected = new Set(selectedIds);
        if (e.target.checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleQuickUpdate = async (id, field, value) => {
        setIsSaving(id); // Use ID to show loading on specific row if needed
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            
            const updateData = { [field]: value };
            await axios.put(`${API_URL}/products/${id}`, updateData, config);
            
            // Optimistic sync
            setProducts(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
            setEditingCell(null);
        } catch (error) {
            setMessage({ type: 'error', text: 'Update failed. Reverting...' });
            fetchProducts(); // Revert on failure
        } finally {
            setIsSaving(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleStockClick = (id, currentStock, delta) => {
        const newStock = Math.max(0, currentStock + delta);
        handleQuickUpdate(id, 'countInStock', newStock);
    };

    const filteredProducts = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user || !user.isAdmin) return null;

    return (
        <div className="admin-product-list-page container">
            <div className="admin-header">
                <button onClick={() => navigate('/profile')} className="back-btn">
                    <ArrowLeft size={18} /> Back to Profile
                </button>
                <div className="header-actions">
                    <h1>Manage <span>Inventory</span></h1>
                    <button
                        className="create-btn"
                        onClick={() => navigate('/admin/product/create')}
                    >
                        <Plus size={18} /> New Product
                    </button>
                </div>
            </div>

            {message && (
                <div className={`message-alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="premium-card list-container">
                <div className="table-controls">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {selectedIds.size > 0 && (
                        <button className="bulk-delete-btn" onClick={bulkDeleteHandler}>
                            <Trash2 size={16} /> Delete Selected ({selectedIds.size})
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>Loading products...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                                        />
                                    </th>
                                    <th>Product</th>
                                    <th>Details</th>
                                    <th>Inventory</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => {
                                    const isLowStock = product.countInStock > 0 && product.countInStock < 5;
                                    const isOutStock = product.countInStock === 0;
                                    const stockClass = isOutStock ? 'out-stock' : (isLowStock ? 'low-stock' : 'in-stock');
                                    
                                    return (
                                        <tr key={product._id} className={selectedIds.has(product._id) ? 'selected-row' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(product._id)}
                                                    onChange={(e) => handleSelectOne(e, product._id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="product-cell">
                                                    <img src={product.image} alt={product.name} className="table-img" />
                                                    <div className="product-info">
                                                        <div className="bold-cell">{product.name}</div>
                                                        <div className="brand-small">{product.brand}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="category-badge">{product.category}</div>
                                            </td>
                                            <td>
                                                <div className="stock-wrapper">
                                                    <div className="stock-container">
                                                        <span className={`stock-badge ${stockClass}`}>
                                                            {isOutStock ? 'Out of Stock' : (isLowStock ? `Only ${product.countInStock} left` : `${product.countInStock} in stock`)}
                                                        </span>
                                                        {!isOutStock && (
                                                            <div className="stock-bar-bg">
                                                                <div 
                                                                    className={`stock-bar-fill ${stockClass}`} 
                                                                    style={{ width: `${Math.min((product.countInStock / 20) * 100, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="stock-actions">
                                                        <button onClick={() => handleStockClick(product._id, product.countInStock, 1)} className="stock-btn plus">+</button>
                                                        <button onClick={() => handleStockClick(product._id, product.countInStock, -1)} className="stock-btn minus">-</button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="price-cell">
                                                {editingCell?.id === product._id && editingCell?.field === 'price' ? (
                                                    <input 
                                                        type="number"
                                                        className="inline-edit-input"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => handleQuickUpdate(product._id, 'price', Number(editValue))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleQuickUpdate(product._id, 'price', Number(editValue));
                                                            if (e.key === 'Escape') setEditingCell(null);
                                                        }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span 
                                                        className="editable-price"
                                                        onClick={() => {
                                                            setEditingCell({ id: product._id, field: 'price' });
                                                            setEditValue(product.price);
                                                        }}
                                                        title="Click to edit price"
                                                    >
                                                        ${product.price ? product.price.toFixed(2) : '0.00'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => navigate(`/admin/product/${product._id}/edit`)}
                                                    title="Edit Product"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => deleteHandler(product._id)}
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && (
                            <div className="no-results">No products found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProductListPage;

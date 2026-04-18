import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, ArrowLeft, Package, Image as ImageIcon, Tag, Hash, DollarSign } from 'lucide-react';
import { CATEGORIES, LIBRARY_IMAGES } from '../constants/productConstants';
import { API_URL } from '../utils/api';
import '../styles/AdminProductPage.css';

const AdminProductEditPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [countInStock, setCountInStock] = useState(0);
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [showLibrary, setShowLibrary] = useState(false);
    const [specifications, setSpecifications] = useState(['']);
    const [message, setMessage] = useState(null);


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/products/${id}`);
                setName(data.name);
                setBrand(data.brand);
                setCategory(data.category);
                setDescription(data.description);
                setPrice(data.price);
                setCountInStock(data.countInStock);
                setImage(data.image);
                setSpecifications(data.specifications && data.specifications.length > 0 ? data.specifications : ['']);
            } catch (error) {
                setMessage({ type: 'error', text: 'Error fetching product. It may not exist.' });
            } finally {
                setLoadingProduct(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const selectFromLibrary = (imageUrl) => {
        setImage(imageUrl + '?auto=format&fit=crop&w=800');
        setShowLibrary(false);
    };

    const addSpecField = () => {
        setSpecifications([...specifications, '']);
    };

    const removeSpecField = (index) => {
        const newSpecs = [...specifications];
        newSpecs.splice(index, 1);
        setSpecifications(newSpecs);
    };

    const handleSpecChange = (index, value) => {
        const newSpecs = [...specifications];
        newSpecs[index] = value;
        setSpecifications(newSpecs);
    };

    const detectHandler = async () => {
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'Please enter a product name first.' });
            return;
        }

        setLoading(true);
        setMessage({ type: 'success', text: 'Detecting product intelligence...' });

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(`${API_URL}/products/detect`, { name }, config);

            if (data) {
                setBrand(data.brand || brand);
                setDescription(data.description || description);
                setPrice(data.price || price);
                setImage(data.image || image);
                if (data.specifications && data.specifications.length > 0) {
                    setSpecifications(data.specifications);
                }
                setMessage({ type: 'success', text: 'Product data detected successfully!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Detection failed. Try a more specific name.' });
        } finally {
            setLoading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const productData = {
                name: name.trim(),
                brand: brand.trim(),
                category,
                description,
                price: Number(price),
                countInStock: Number(countInStock),
                image,
                specifications: specifications.filter(s => s.trim() !== ''),
            };

            await axios.put(`${API_URL}/products/${id}`, productData, config);

            setMessage({ type: 'success', text: 'Product Updated Successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user.isAdmin) {
        return (
            <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You do not have administrative privileges.</p>
                <button onClick={() => navigate('/')} className="cta-btn" style={{ marginTop: '1rem' }}>Go Home</button>
            </div>
        );
    }

    if (loadingProduct) {
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading premium tech...</div>;
    }

    return (
        <div className="admin-product-page container">
            <div className="admin-header">
                <button onClick={() => navigate('/admin/product')} className="back-btn">
                    <ArrowLeft size={18} /> Back to Products
                </button>
                <h1>Edit <span>Premium Product</span></h1>
            </div>

            <form onSubmit={submitHandler} className="admin-form-container premium-card">
                {message && (
                    <div className={`message-alert ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="form-grid">
                    <div className="form-section">
                        <h3><Package size={18} /> Basic Information</h3>
                        <div className="form-group">
                            <div className="label-with-action">
                                <label>Product Name</label>
                                <button type="button" className="detect-btn" onClick={detectHandler} disabled={loading}>
                                    {loading ? 'Detecting...' : 'Auto-Detect Info'}
                                </button>
                            </div>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. iPhone 15 Pro Max" />
                        </div>
                        <div className="form-group">
                            <label>Brand</label>
                            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="e.g. Apple" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label><Tag size={16} /> Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                                    <option value="">Select Category</option>
                                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label><DollarSign size={16} /> Price</label>
                                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label><Hash size={16} /> Stock</label>
                                <input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe the product features and qualities..." rows="5"></textarea>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3><ImageIcon size={18} /> Visual & Technical</h3>
                        <div className="form-group">
                            <div className="label-with-action">
                                <label>Image URL</label>
                                <button type="button" className="library-trigger" onClick={() => setShowLibrary(!showLibrary)}>
                                    {showLibrary ? 'Close Library' : 'Choose from Library'}
                                </button>
                            </div>
                            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} required placeholder="https://images.unsplash.com/..." />

                            {showLibrary && (
                                <div className="premium-library premium-card">
                                    <h4>Select Premium <span>Asset</span></h4>
                                    <div className="library-grid">
                                        {(category && LIBRARY_IMAGES[category] ? LIBRARY_IMAGES[category] : Object.values(LIBRARY_IMAGES).flat().slice(0, 9)).map((img, idx) => (
                                            <div key={idx} className="library-item" onClick={() => selectFromLibrary(img.url)}>
                                                <img src={img.url + '?auto=format&fit=crop&w=300'} alt={img.name} />
                                                <div className="library-overlay">
                                                    <span>{img.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="library-note">
                                        {category ? `Showing premium ${category} assets.` : "Select a category above to see specific items."}
                                    </p>
                                </div>
                            )}

                            {image && (
                                <div className="image-preview">
                                    <img src={image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>

                        <div className="form-group specs-group">
                            <label>Technical Specifications</label>
                            {specifications.map((spec, index) => (
                                <div key={index} className="spec-input-row">
                                    <input
                                        type="text"
                                        value={spec}
                                        onChange={(e) => handleSpecChange(index, e.target.value)}
                                        placeholder="e.g. 16GB RAM / 512GB SSD"
                                    />
                                    {specifications.length > 1 && (
                                        <button type="button" onClick={() => removeSpecField(index)} className="remove-spec-btn">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addSpecField} className="add-spec-btn">
                                <Plus size={16} /> Add Specification
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Processing...' : <><Save size={20} /> Update Product</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductEditPage;

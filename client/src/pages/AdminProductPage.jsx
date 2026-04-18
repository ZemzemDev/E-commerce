import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, ArrowLeft, Package, Image as ImageIcon, Tag, Hash, DollarSign, Sparkles, Wand2 } from 'lucide-react';
import { CATEGORIES, LIBRARY_IMAGES } from '../constants/productConstants';
import { autoDetectProductData } from '../utils/adminAutomation';
import { API_URL } from '../utils/api';
import '../styles/AdminProductPage.css';

const AdminProductPage = () => {
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
    const [showLibrary, setShowLibrary] = useState(false);
    const [specifications, setSpecifications] = useState(['']);
    const [message, setMessage] = useState(null);
    const [isDetectingImage, setIsDetectingImage] = useState(false);
    const [showImagePalette, setShowImagePalette] = useState(false);
    const [paletteImages, setPaletteImages] = useState([]);


    const handleMagicImage = async () => {
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'Please enter a product name to search for images.' });
            return;
        }

        setIsDetectingImage(true);
        setMessage({ type: 'info', text: 'Searching Unsplash Live... 🛰️' });
        
        try {
            const data = await autoDetectProductData(name, user.token);
            if (data.images && data.images.length > 0) {
                setPaletteImages(data.images);
                setShowImagePalette(true);
            } else {
                setImage(data.image);
                setMessage({ type: 'success', text: 'Magic image found! ✨' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Could not fetch image. try again.' });
        } finally {
            setIsDetectingImage(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const selectPaletteImage = (imgUrl) => {
        setImage(imgUrl.replace('w=800', 'w=1200')); // Use high res for final
        setShowImagePalette(false);
        setMessage({ type: 'success', text: 'Perfect choice! Image updated. ✨' });
        setTimeout(() => setMessage(null), 3000);
    };

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

            await axios.post(`${API_URL}/products`, productData, config);

            setMessage({ type: 'success', text: 'Product Created Successfully! You can now add another.' });
            // Reset form
            setName('');
            setBrand('');
            setCategory('');
            setDescription('');
            setPrice(0);
            setCountInStock(0);
            setImage('');
            setSpecifications(['']);

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

    return (
        <div className="admin-product-page container">
            <div className="admin-header">
                <button onClick={() => navigate('/admin/product')} className="back-btn">
                    <ArrowLeft size={18} /> Back to Products
                </button>
                <h1>Add New <span>Premium Product</span></h1>
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
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                placeholder="e.g. iPhone 15 Pro Max" 
                            />
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
                                <div className="label-controls">
                                    <button 
                                        type="button" 
                                        className={`magic-image-btn ${isDetectingImage ? 'spinning' : ''}`}
                                        onClick={handleMagicImage}
                                        disabled={isDetectingImage || !name}
                                        title="Magic Scraper: Detect image only"
                                    >
                                        <Wand2 size={14} /> <span>Magic Image</span>
                                    </button>
                                    <button type="button" className="library-trigger" onClick={() => setShowLibrary(!showLibrary)}>
                                        {showLibrary ? 'Close Library' : 'Choose from Library'}
                                    </button>
                                </div>
                            </div>
                            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} required placeholder="https://images.unsplash.com/..." />

                            {showLibrary && (
                                <div className="premium-library premium-card">
                                    <h4>Select Premium <span>Asset</span></h4>
                                    <div className="library-grid">
                                        {(category && libraryImages[category] ? libraryImages[category] : Object.values(libraryImages).flat().slice(0, 9)).map((img, idx) => (
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
                                <div className={`image-preview ${isDetectingImage ? 'detecting' : ''}`}>
                                    <img src={image} alt="Preview" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600?text=Broken+Image'; }} />
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
                        {loading ? 'Processing...' : <><Save size={20} /> Create Product</>}
                    </button>
                </div>
            </form>

            {showImagePalette && (
                <div className="palette-modal-overlay">
                    <div className="palette-modal premium-card">
                        <div className="palette-header">
                            <h3>Select Perfect <span>Image</span></h3>
                            <div className="palette-badges">
                                <span className="badge-live">Live Results</span>
                                <button className="close-palette" onClick={() => setShowImagePalette(false)}>×</button>
                            </div>
                        </div>
                        <p>Found <span>{paletteImages.length}</span> high-quality options for <strong>"{name}"</strong></p>
                        <div className="palette-grid">
                            {paletteImages.map((img, idx) => (
                                <div key={idx} className="palette-item" onClick={() => selectPaletteImage(img)}>
                                    <img 
                                        src={img} 
                                        alt={`Option ${idx + 1}`} 
                                        loading="lazy" 
                                        onError={(e) => e.target.closest('.palette-item').style.display = 'none'}
                                    />
                                    <div className="palette-item-overlay">
                                        <Sparkles size={20} />
                                        <span>Select</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="palette-footer">
                            <button onClick={() => setShowImagePalette(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductPage;

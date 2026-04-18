import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Plus, Trash2, Layout, Image as ImageIcon } from 'lucide-react';
import '../styles/AdminSettingsPage.css';

const AdminSettingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [heroImages, setHeroImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/settings/hero-backgrounds');
                setHeroImages(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleAddImage = () => {
        setHeroImages([...heroImages, '']);
    };

    const handleRemoveImage = (index) => {
        const newImages = [...heroImages];
        newImages.splice(index, 1);
        setHeroImages(newImages);
    };

    const handleImageChange = (index, value) => {
        const newImages = [...heroImages];
        newImages[index] = value;
        setHeroImages(newImages);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.put(
                'http://localhost:5000/api/settings/hero-backgrounds',
                { images: heroImages.filter(img => img.trim() !== '') },
                config
            );

            setMessage({ type: 'success', text: 'Settings Updated Successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || error.message });
        } finally {
            setSaving(false);
        }
    };

    if (!user || !user.isAdmin) {
        return <div className="container">Access Denied</div>;
    }

    return (
        <div className="admin-settings-page container">
            <div className="admin-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={18} /> Back
                </button>
                <h1>Store <span>System Settings</span></h1>
            </div>

            <div className="settings-grid">
                <section className="settings-section premium-card">
                    <div className="section-header">
                        <h3><Layout size={20} /> Hero <span>Backgrounds</span></h3>
                        <p>Manage the large rotating images on the Home Page hero section.</p>
                    </div>

                    {loading ? (
                        <div className="loading">Fetching current settings...</div>
                    ) : (
                        <form onSubmit={submitHandler} className="settings-form">
                            {message && (
                                <div className={`message-alert ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="hero-images-list">
                                {heroImages.map((img, index) => (
                                    <div key={index} className="hero-img-input-group">
                                        <div className="input-row">
                                            <div className="input-with-icon">
                                                <ImageIcon size={16} className="input-icon" />
                                                <input
                                                    type="text"
                                                    value={img}
                                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                                    placeholder="Enter high-definition image URL..."
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="remove-img-btn"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {img && (
                                            <div className="mini-preview">
                                                <img src={img} alt="Preview" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600?text=Broken+Image'; }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="form-footer">
                                <button type="button" onClick={handleAddImage} className="add-hero-btn">
                                    <Plus size={18} /> Add Background Image
                                </button>
                                <button type="submit" className="save-settings-btn" disabled={saving}>
                                    {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                <aside className="settings-info premium-card">
                    <h4>💡 Tips for <span>Backgrounds</span></h4>
                    <ul>
                        <li>Use <strong>High Definition</strong> images (at least 1920x1080).</li>
                        <li><strong>Unsplash</strong> is a great source for tech lifestyle photos.</li>
                        <li>Recommended: <strong>3 to 5 images</strong> for the best experience.</li>
                        <li>Images will fade smoothly every 5 seconds.</li>
                    </ul>
                </aside>
            </div>
        </div>
    );
};

export default AdminSettingsPage;

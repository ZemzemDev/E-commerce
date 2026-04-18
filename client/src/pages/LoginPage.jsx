import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import '../styles/AuthPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuth().login;
    const navigate = useNavigate();
    const location = useLocation();
    
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    const redirect = redirectParam ? `/${redirectParam}` : '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="auth-page container">
            <div className="premium-card auth-card glass-morphism">
                <div className="auth-header">
                    <div className="auth-icon-badge">
                        <LogIn size={28} />
                    </div>
                    <h2>Welcome <span>Back</span></h2>
                    <p>Enter your credentials to access your account</p>
                </div>
                
                {error && <div className="error-msg-premium"><span className="error-dot"></span> {error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group-premium">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group-premium">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="auth-btn-premium">
                        Sign In <ArrowRight size={18} />
                    </button>
                </form>
                <p className="auth-footer">
                    New customer? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

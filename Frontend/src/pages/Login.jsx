// Login Page
// Demonstrates: Authentication (Step 1 - Credentials)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../components/api';
import './Auth.css';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Verify credentials (password is hashed and compared)
      const response = await api.post('/auth/login', formData);
      
      if (response.data.requiresOTP) {
        // MFA required - redirect to OTP verification
        localStorage.setItem('tempUserId', response.data.userId);
        navigate('/verify-otp', { 
          state: { 
            userId: response.data.userId,
            email: formData.email 
          } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Secure Login</h1>
        <p className="subtitle">Placement Document Verification Portal</p>
        
        <div className="security-badge">
          <span>🔒 Multi-Factor Authentication Enabled</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Enter your password"
            />
            <small>Password is verified using bcrypt hashing</small>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>

        <div className="info-links">
          <Link to="/security-levels">Security Levels & Risks</Link>
          <Link to="/attacks">Possible Attacks</Link>
        </div>

        <div className="security-info">
          <h3>Security Features</h3>
          <ul>
            <li>✓ Password Hashing (bcrypt + salt)</li>
            <li>✓ Multi-Factor Authentication (Email OTP)</li>
            <li>✓ JWT Token-based Sessions</li>
            <li>✓ Protection against brute-force attacks</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;

// OTP Verification Page
// Demonstrates: Multi-Factor Authentication (MFA)

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../components/api';
import './Auth.css';

function OTPVerification({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 2: Verify OTP (Multi-Factor Authentication)
      const response = await api.post('/auth/verify-otp', {
        userId: userId || localStorage.getItem('tempUserId'),
        otp
      });

      // Store JWT token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.removeItem('tempUserId');
      
      // Update user state
      setUser(response.data.user);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      await api.post('/auth/resend-otp', {
        userId: userId || localStorage.getItem('tempUserId')
      });
      alert('New OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Verify OTP</h1>
        <p className="subtitle">Multi-Factor Authentication</p>
        
        <div className="security-badge">
          <span>🔐 Second Factor Required</span>
        </div>

        <p className="info-text">
          A 6-digit OTP has been sent to <strong>{email || 'your email'}</strong>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              pattern="[0-9]{6}"
              placeholder="6-digit OTP"
              className="otp-input"
            />
            <small>OTP is valid for 5 minutes</small>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            onClick={handleResendOTP} 
            className="btn-link" 
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
          <Link to="/login">Back to Login</Link>
        </div>

        <div className="security-info">
          <h4>Why OTP?</h4>
          <p>Multi-Factor Authentication adds an extra layer of security by requiring a second verification method (email OTP) in addition to your password. This protects against unauthorized access even if your password is compromised.</p>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;

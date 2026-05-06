import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './OtpVerify.css';

function OtpVerify() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/verify-otp', {
        email: state.email, otp
      });
      const res = await axios.post('http://localhost:5000/api/signup', state.formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed!');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/api/send-otp', { email: state.email });
      alert('OTP resent successfully!');
    } catch (err) {
      setError('Failed to resend OTP!');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="otp-icon">📧</div>
        <h2>Verify Your Email</h2>
        <p className="otp-subtitle">We sent a 6-digit OTP to<br /><strong>{state?.email}</strong></p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleVerify}>
          <div className="otp-inputs">
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : '✅ Verify OTP'}
          </button>
        </form>
        <p className="auth-link">
          Didn't receive? <span onClick={handleResend} style={{color:'#e94560', cursor:'pointer', fontWeight:'bold'}}>Resend OTP</span>
        </p>
      </div>
    </div>
  );
}

export default OtpVerify;
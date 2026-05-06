import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/login', form)
      .then(res => {
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate('/');
      })
      .catch(err => setError(err.response?.data?.error || 'Login failed!'));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>🎟️ User Login</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit">Login</button>
        </form>
        <p className="auth-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
        <p className="auth-link">Are you an admin? <Link to="/admin-login">Admin Login</Link></p>
      </div>
    </div>
  );
}

export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/admin/login', form)
      .then(res => {
        localStorage.setItem('admin', JSON.stringify(res.data));
        navigate('/admin');
      })
      .catch(err => setError(err.response?.data?.error || 'Admin login failed!'));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>🔐 Admin Login</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit">Login as Admin</button>
        </form>
        <p className="auth-link">Admin credentials — Email: admin@techfest.com | Password: admin123</p>
      </div>
    </div>
  );
}

export default AdminLogin;
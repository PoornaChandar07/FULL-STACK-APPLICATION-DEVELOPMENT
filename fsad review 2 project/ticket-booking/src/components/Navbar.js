import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const admin = JSON.parse(localStorage.getItem('admin'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">🎟️ EventBooking</div>
      <div className="navbar-links">
        {user && <span>👤 {user.name}</span>}
        {admin && <span>🔐 Admin</span>}
        {!user && !admin && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
        {(user || admin) && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
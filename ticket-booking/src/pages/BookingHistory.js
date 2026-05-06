import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookingHistory.css';

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings');
      const userBookings = res.data.filter(b => b.email === user.email);
      setBookings(userBookings);
    } catch (err) {
      setError('Failed to load bookings!');
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    return status === 'paid' ? (
      <span className="badge-paid">✅ Paid</span>
    ) : (
      <span className="badge-pending">⏳ Pending</span>
    );
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? '#10b981' : '#f59e0b';
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>📋 Your Booking History</h1>
        <p className="header-subtitle">View all your event bookings and tickets</p>
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back to Events
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <h2>No Bookings Yet</h2>
          <p>You haven't booked any tickets yet. Explore events and book your first ticket!</p>
          <button className="btn-explore" onClick={() => navigate('/')}>
            → Explore Events
          </button>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking, idx) => (
            <div key={idx} className="booking-card">
              <div className="card-header">
                <h3>{booking.event_name}</h3>
                {getStatusBadge(booking.payment_status)}
              </div>

              <div className="card-body">
                <div className="booking-info">
                  <div className="info-row">
                    <span className="label">📅 Booking Date</span>
                    <span className="value">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">👤 Name</span>
                    <span className="value">{booking.name}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">📧 Email</span>
                    <span className="value">{booking.email}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">🎓 Roll Number</span>
                    <span className="value">{booking.roll_number}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">🏢 Department</span>
                    <span className="value">{booking.department}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">🎫 Ticket Type</span>
                    <span className="value">{booking.ticket_type}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">🔢 Quantity</span>
                    <span className="value">{booking.quantity}</span>
                  </div>

                  <div className="info-row amount">
                    <span className="label">💰 Amount Paid</span>
                    <span className="value">₹{booking.total_amount}</span>
                  </div>

                  <div className="info-row code">
                    <span className="label">🔐 Verification Code</span>
                    <span className="value code-text">{booking.verification_code}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <span 
                  className="status-indicator" 
                  style={{ backgroundColor: getStatusColor(booking.payment_status) }}
                ></span>
                <span className="status-text">
                  {booking.payment_status === 'paid' ? 'Payment Confirmed' : 'Awaiting Payment'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="history-footer">
        <p className="footer-text">
          💡 Save your verification code. You'll need it at the event entrance.
        </p>
      </div>
    </div>
  );
}

export default BookingHistory;
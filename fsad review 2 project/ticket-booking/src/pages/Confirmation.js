import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Confirmation.css';

function Confirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div className="loading">No booking found!</div>;

  const { booking, event, form } = state;

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="success-icon">✅</div>
        <h2>Booking Confirmed!</h2>
        <div className="ticket">
          <div className="ticket-header">
            <h3>{event.name}</h3>
          </div>
          <div className="ticket-details">
            <div className="ticket-row">
              <span>Booking ID</span>
              <span>#{booking.booking_id}</span>
            </div>
            <div className="ticket-row">
              <span>Name</span>
              <span>{form.name}</span>
            </div>
            <div className="ticket-row">
              <span>Email</span>
              <span>{form.email}</span>
            </div>
            <div className="ticket-row">
              <span>Roll Number</span>
              <span>{form.roll_number}</span>
            </div>
            <div className="ticket-row">
              <span>Department</span>
              <span>{form.department}</span>
            </div>
            <div className="ticket-row">
              <span>Ticket Type</span>
              <span>{form.ticket_type}</span>
            </div>
            <div className="ticket-row">
              <span>Quantity</span>
              <span>{form.quantity}</span>
            </div>
            <div className="ticket-row">
              <span>Venue</span>
              <span>{event.venue}</span>
            </div>
            <div className="ticket-row">
              <span>Date</span>
              <span>{event.date}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
}

export default Confirmation;
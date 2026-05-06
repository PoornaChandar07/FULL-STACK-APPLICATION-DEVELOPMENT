import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookingForm.css';

function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    roll_number: '',
    department: '',
    ticket_type: 'General',
    quantity: 1
  });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => console.log(err));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/bookings', { ...form, event_id: id })
      .then(res => {
        navigate('/confirmation', { state: { booking: res.data, event, form } });
      })
      .catch(err => alert(err.response?.data?.error || 'Booking failed!'));
  };

  if (!event) return <div className="loading">Loading...</div>;

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h2>Book Tickets for {event.name}</h2>
        <div className="event-info">
          <span>📅 {event.date}</span>
          <span>📍 {event.venue}</span>
          <span>🎟️ {event.available_seats} seats left</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Roll Number</label>
            <input type="text" name="roll_number" value={form.roll_number} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input type="text" name="department" value={form.department} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Ticket Type</label>
            <select name="ticket_type" value={form.ticket_type} onChange={handleChange}>
              <option value="General">General</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" max="5" required />
          </div>
          <button type="submit">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
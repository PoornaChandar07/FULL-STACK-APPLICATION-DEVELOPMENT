import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './BookingForm.css';

function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    roll_number: '',
    department: '',
    ticket_type: 'General',
    quantity: 1
  });
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => setError('Event not found!'));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const totalAmount = () => {
    if (!event) return 0;
    const price = form.ticket_type === 'General' ? event.general_price : event.vip_price;
    return price * form.quantity;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/bookings', {
        event_id: id,
        user_id: user?.id,
        name: form.name,
        email: form.email,
        roll_number: form.roll_number,
        department: form.department,
        ticket_type: form.ticket_type,
        quantity: parseInt(form.quantity),
        total_amount: totalAmount()
      });
      setBookingData({
        booking_id: res.data.booking_id,
        verification_code: res.data.verification_code
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed!');
    }
    setLoading(false);
  };

  const handlePaid = () => {
    axios.put(`http://localhost:5000/api/bookings/${bookingData.booking_id}/paid`, {
      email: form.email,
      name: form.name,
      event_name: event.name,
      verification_code: bookingData.verification_code,
      total_amount: totalAmount(),
      ticket_type: form.ticket_type,
      quantity: form.quantity,
      venue: event.venue,
      date: event.date
    }).then(() => {
      setStep(3);
    });
  };

  const downloadTicket = async () => {
    const element = document.getElementById('ticket-content');
    const canvas = await html2canvas(element);
    const image = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(image, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`ticket_${bookingData.booking_id}.pdf`);
  };

  if (!event) return <div className="loading">Loading event...</div>;

  return (
    <div className="booking-container">
      {step === 1 && (
        <div className="booking-step">
          <div className="step-header">
            <h2>🎟️ Step 1: Booking Details</h2>
            <p className="event-title">{event.name}</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleBooking}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Roll Number</label>
                <input type="text" name="roll_number" value={form.roll_number} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" name="department" value={form.department} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ticket Type</label>
                <select name="ticket_type" value={form.ticket_type} onChange={handleChange}>
                  <option value="General">General - ₹{event.general_price}</option>
                  {event.has_vip && <option value="VIP">VIP - ₹{event.vip_price}</option>}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" max={event.available_seats} required />
              </div>
            </div>

            <div className="amount-display">
              <h3>Total Amount: <span className="amount">₹{totalAmount()}</span></h3>
              <p className="available-seats">Available Seats: {event.available_seats}</p>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : '→ Proceed to Payment'}
            </button>
          </form>
        </div>
      )}

      {step === 2 && bookingData && (
        <div className="booking-step">
          <div className="step-header">
            <h2>💳 Step 2: Payment</h2>
          </div>

          <div className="payment-card">
            <div className="payment-info">
              <p><strong>Event:</strong> {event.name}</p>
              <p><strong>Amount:</strong> ₹{totalAmount()}</p>
              <p><strong>Tickets:</strong> {form.quantity} x {form.ticket_type}</p>
            </div>

            <div className="qr-section">
              <p className="qr-label">📱 Scan UPI QR Code to Pay</p>
              <div className="qr-display">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${event.upi_id || 'admin@bank'}&pn=EventBooking&am=${totalAmount()}&tr=BK${bookingData.booking_id}&tn=EventTicket&cu=INR`}
                  alt="UPI QR Code"
                  className="qr-image"
                />
              </div>
              <p className="qr-instruction">Use Google Pay, PhonePe, or Paytm</p>
              <p className="upi-text">💳 Amount: ₹{totalAmount()}</p>
            </div>

            <div className="payment-actions">
              <button className="btn-paid" onClick={handlePaid}>
                ✅ I Have Paid
              </button>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && bookingData && (
        <div className="booking-step">
          <div className="step-header">
            <h2>🎟️ Step 3: Your Ticket</h2>
          </div>

          <div className="ticket-container" id="ticket-content">
            <div className="ticket">
              <div className="ticket-left">
                <div className="ticket-event">
                  <h1>{event.name}</h1>
                  <p className="ticket-date">📅 {event.date}</p>
                  <p className="ticket-venue">📍 {event.venue}</p>
                </div>

                <div className="ticket-details">
                  <div className="detail-row">
                    <span>Booking ID:</span>
                    <strong>{bookingData.booking_id}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Name:</span>
                    <strong>{form.name}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Roll No:</span>
                    <strong>{form.roll_number}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Ticket Type:</span>
                    <strong>{form.ticket_type}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Quantity:</span>
                    <strong>{form.quantity}</strong>
                  </div>
                  <div className="detail-row amount">
                    <span>Amount Paid:</span>
                    <strong>₹{totalAmount()}</strong>
                  </div>
                </div>
              </div>

              <div className="ticket-right">
                <p className="verify-code-label">Verification Code</p>
                <div className="verify-code">{bookingData.verification_code}</div>
                <p className="ticket-footer">Show this at event entrance</p>
              </div>
            </div>
          </div>

          <div className="ticket-actions">
            <button className="btn-download" onClick={downloadTicket}>
              ⬇️ Download PDF Ticket
            </button>
            <button className="btn-home" onClick={() => navigate('/')}>
              ← Back to Events
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingForm;
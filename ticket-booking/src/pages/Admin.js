import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [upiSettings, setUpiSettings] = useState({ upi_id: '', upi_name: '' });
  const [editEvent, setEditEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: '', description: '', date: '', venue: '',
    total_seats: '', category: 'internal', event_type: 'other',
    general_price: '', vip_price: '', has_vip: false
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    axios.get('http://localhost:5000/api/bookings').then(res => setBookings(res.data));
    axios.get('http://localhost:5000/api/events').then(res => setEvents(res.data));
    axios.get('http://localhost:5000/api/settings').then(res => setUpiSettings(res.data));
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/events', newEvent).then(() => {
      fetchAll();
      setNewEvent({ name: '', description: '', date: '', venue: '', total_seats: '', category: 'internal', event_type: 'other', general_price: '', vip_price: '', has_vip: false });
      alert('Event added successfully!');
    }).catch(err => alert(err.response?.data?.error || 'Failed to add event!'));
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      axios.delete(`http://localhost:5000/api/events/${id}`).then(() => fetchAll());
    }
  };

  const handleEditEvent = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/events/${editEvent.id}`, editEvent).then(() => {
      fetchAll();
      setEditEvent(null);
      alert('Event updated successfully!');
    }).catch(err => alert(err.response?.data?.error || 'Failed to update event!'));
  };

  const handleUpiSave = (e) => {
    e.preventDefault();
    axios.put('http://localhost:5000/api/settings', upiSettings).then(() => alert('UPI settings updated!'));
  };

  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
        <div className="admin-stats">
          <div className="stat-card"><span className="stat-num">{bookings.length}</span><span className="stat-label">Total Bookings</span></div>
          <div className="stat-card"><span className="stat-num">{events.length}</span><span className="stat-label">Total Events</span></div>
          <div className="stat-card"><span className="stat-num">₹{totalRevenue}</span><span className="stat-label">Total Revenue</span></div>
          <div className="stat-card"><span className="stat-num">{bookings.filter(b => b.payment_status === 'paid').length}</span><span className="stat-label">Paid Bookings</span></div>
        </div>
      </div>

      <div className="admin-tabs">
        {['bookings', 'events', 'add-event', 'upi'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab === 'bookings' ? '📋 Bookings' : tab === 'events' ? '🎯 Manage Events' : tab === 'add-event' ? '➕ Add Event' : '💳 UPI Settings'}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="admin-section">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Event</th><th>Name</th><th>Email</th>
                  <th>Roll No</th><th>Dept</th><th>Type</th><th>Qty</th>
                  <th>Amount</th><th>Status</th><th>Code</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.event_name}</td>
                    <td>{b.name}</td>
                    <td>{b.email}</td>
                    <td>{b.roll_number}</td>
                    <td>{b.department}</td>
                    <td><span className={`badge ${b.ticket_type === 'VIP' ? 'vip' : 'general'}`}>{b.ticket_type}</span></td>
                    <td>{b.quantity}</td>
                    <td>₹{b.total_amount}</td>
                    <td><span className={`badge ${b.payment_status === 'paid' ? 'paid' : 'pending'}`}>{b.payment_status}</span></td>
                    <td><code>{b.verification_code}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage Events Tab */}
      {activeTab === 'events' && (
        <div className="admin-section">
          {editEvent && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Edit Event</h3>
                <form onSubmit={handleEditEvent}>
                  <div className="form-grid">
                    <div className="form-group"><label>Name</label><input value={editEvent.name} onChange={e => setEditEvent({ ...editEvent, name: e.target.value })} required /></div>
                    <div className="form-group"><label>Date</label><input type="date" value={editEvent.date?.split('T')[0]} onChange={e => setEditEvent({ ...editEvent, date: e.target.value })} required /></div>
                    <div className="form-group"><label>Venue</label><input value={editEvent.venue} onChange={e => setEditEvent({ ...editEvent, venue: e.target.value })} required /></div>
                    <div className="form-group"><label>Total Seats</label><input type="number" value={editEvent.total_seats} onChange={e => setEditEvent({ ...editEvent, total_seats: e.target.value })} required /></div>
                    <div className="form-group"><label>Available Seats</label><input type="number" value={editEvent.available_seats} onChange={e => setEditEvent({ ...editEvent, available_seats: e.target.value })} required /></div>
                    <div className="form-group"><label>General Price</label><input type="number" value={editEvent.general_price} onChange={e => setEditEvent({ ...editEvent, general_price: e.target.value })} required /></div>
                    <div className="form-group"><label>VIP Price</label><input type="number" value={editEvent.vip_price} onChange={e => setEditEvent({ ...editEvent, vip_price: e.target.value })} /></div>
                    <div className="form-group"><label>Category</label>
                      <select value={editEvent.category} onChange={e => setEditEvent({ ...editEvent, category: e.target.value })}>
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea value={editEvent.description} onChange={e => setEditEvent({ ...editEvent, description: e.target.value })} rows="3" /></div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-save">Save Changes</button>
                    <button type="button" className="btn-cancel" onClick={() => setEditEvent(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Category</th><th>Date</th><th>Venue</th><th>Seats</th><th>Available</th><th>Price</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id}>
                    <td>#{e.id}</td>
                    <td>{e.name}</td>
                    <td><span className={`badge ${e.category}`}>{e.category}</span></td>
                    <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                    <td>{e.venue}</td>
                    <td>{e.total_seats}</td>
                    <td>{e.available_seats}</td>
                    <td>₹{e.general_price}{e.has_vip ? ` / ₹${e.vip_price}` : ''}</td>
                    <td>
                      <button className="btn-edit" onClick={() => setEditEvent(e)}>✏️ Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteEvent(e.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Event Tab */}
      {activeTab === 'add-event' && (
        <div className="admin-section">
          <div className="add-event-form">
            <h3>Add New Event</h3>
            <form onSubmit={handleAddEvent}>
              <div className="form-grid">
                <div className="form-group"><label>Event Name</label><input value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} required /></div>
                <div className="form-group"><label>Date</label><input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required /></div>
                <div className="form-group"><label>Venue</label><input value={newEvent.venue} onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })} required /></div>
                <div className="form-group"><label>Total Seats</label><input type="number" value={newEvent.total_seats} onChange={e => setNewEvent({ ...newEvent, total_seats: e.target.value })} required /></div>
                <div className="form-group"><label>General Price (₹)</label><input type="number" value={newEvent.general_price} onChange={e => setNewEvent({ ...newEvent, general_price: e.target.value })} required /></div>
                <div className="form-group"><label>VIP Price (₹)</label><input type="number" value={newEvent.vip_price} onChange={e => setNewEvent({ ...newEvent, vip_price: e.target.value })} /></div>
                <div className="form-group"><label>Category</label>
                  <select value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}>
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </select>
                </div>
                <div className="form-group"><label>Event Type</label>
                  <select value={newEvent.event_type} onChange={e => setNewEvent({ ...newEvent, event_type: e.target.value })}>
                    <option value="concert">Concert</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                    <option value="expo">Expo</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Has VIP?</label>
                  <select value={newEvent.has_vip} onChange={e => setNewEvent({ ...newEvent, has_vip: e.target.value === 'true' })}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Description</label><textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} rows="3" required /></div>
              <button type="submit" className="btn-primary">➕ Add Event</button>
            </form>
          </div>
        </div>
      )}

      {/* UPI Settings Tab */}
      {activeTab === 'upi' && (
        <div className="admin-section">
          <div className="upi-form">
            <h3>💳 UPI Payment Settings</h3>
            <form onSubmit={handleUpiSave}>
              <div className="form-group"><label>UPI ID</label><input value={upiSettings.upi_id} onChange={e => setUpiSettings({ ...upiSettings, upi_id: e.target.value })} placeholder="example@upi" required /></div>
              <div className="form-group"><label>UPI Name</label><input value={upiSettings.upi_name} onChange={e => setUpiSettings({ ...upiSettings, upi_name: e.target.value })} placeholder="Your Name" required /></div>
              <button type="submit" className="btn-primary">💾 Save UPI Settings</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/bookings')
      .then(res => setBookings(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h2>Admin Dashboard</h2>
        <p>Total Bookings: <strong>{bookings.length}</strong></p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Event</th>
                <th>Name</th>
                <th>Email</th>
                <th>Roll No</th>
                <th>Department</th>
                <th>Ticket Type</th>
                <th>Quantity</th>
                <th>Booking Date</th>
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
                  <td>{b.ticket_type}</td>
                  <td>{b.quantity}</td>
                  <td>{new Date(b.booking_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;
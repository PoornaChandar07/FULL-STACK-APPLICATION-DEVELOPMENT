const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'POORNA@25980',
  database: 'ticket_booking'
});

db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err);
    return;
  }
  console.log('MySQL Connected!');
});

// Admin credentials
const ADMIN_EMAIL = 'admin@techfest.com';
const ADMIN_PASSWORD = 'admin123';

// Signup
app.post('/api/signup', (req, res) => {
  const { name, email, password, roll_number, department } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: 'Email already registered!' });
    db.query(
      'INSERT INTO users (name, email, password, roll_number, department) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, roll_number, department],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Signup successful!', user_id: result.insertId, name, email });
      }
    );
  });
});

// User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid email or password!' });
    const user = results[0];
    res.json({ message: 'Login successful!', user_id: user.id, name: user.name, email: user.email });
  });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({ message: 'Admin login successful!', role: 'admin' });
  } else {
    res.status(400).json({ error: 'Invalid admin credentials!' });
  }
});

// Get all events
app.get('/api/events', (req, res) => {
  db.query('SELECT * FROM events', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get single event
app.get('/api/events/:id', (req, res) => {
  db.query('SELECT * FROM events WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const { event_id, name, email, roll_number, department, ticket_type, quantity } = req.body;
  db.query('SELECT available_seats FROM events WHERE id = ?', [event_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results[0].available_seats < quantity) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }
    db.query(
      'INSERT INTO bookings (event_id, name, email, roll_number, department, ticket_type, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [event_id, name, email, roll_number, department, ticket_type, quantity],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(
          'UPDATE events SET available_seats = available_seats - ? WHERE id = ?',
          [quantity, event_id]
        );
        res.json({ message: 'Booking successful!', booking_id: result.insertId });
      }
    );
  });
});

// Get all bookings (admin)
app.get('/api/bookings', (req, res) => {
  db.query(
    'SELECT b.*, e.name as event_name FROM bookings b JOIN events e ON b.event_id = e.id',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
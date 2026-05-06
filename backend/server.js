const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

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
  if (err) { console.log('Database connection failed:', err); return; }
  console.log('MySQL Connected!');
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const ADMIN_EMAIL = 'admin@techfest.com';
const ADMIN_PASSWORD = 'admin123';

// ── Send OTP ──────────────────────────────────────────────────
app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  db.query('DELETE FROM otps WHERE email = ?', [email], () => {
    db.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expires],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: '🎟️ EventBooking - Your OTP Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a1a2e; color: white; border-radius: 12px; overflow: hidden;">
              <div style="background: #e94560; padding: 25px; text-align: center;">
                <h1 style="margin:0; font-size: 24px;">🎟️ EventBooking</h1>
              </div>
              <div style="padding: 30px; text-align: center;">
                <h2 style="color: white;">Email Verification</h2>
                <p style="color: rgba(255,255,255,0.7);">Use the OTP below to verify your account. It expires in 10 minutes.</p>
                <div style="background: #e94560; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <h1 style="margin:0; font-size: 42px; letter-spacing: 10px; color: white;">${otp}</h1>
                </div>
                <p style="color: rgba(255,255,255,0.5); font-size: 12px;">Do not share this OTP with anyone.</p>
              </div>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) return res.status(500).json({ error: 'Failed to send OTP email!' });
          res.json({ message: 'OTP sent successfully!' });
        });
      }
    );
  });
});

// ── Verify OTP ────────────────────────────────────────────────
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  db.query(
    'SELECT * FROM otps WHERE email = ? AND otp = ? AND verified = FALSE AND expires_at > NOW()',
    [email, otp],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP!' });
      db.query('UPDATE otps SET verified = TRUE WHERE email = ?', [email]);
      res.json({ message: 'OTP verified successfully!' });
    }
  );
});

// ── Auth APIs ─────────────────────────────────────────────────
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

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid email or password!' });
    const user = results[0];
    res.json({ message: 'Login successful!', user_id: user.id, name: user.name, email: user.email });
  });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.json({ message: 'Admin login successful!', role: 'admin' });
  } else {
    res.status(400).json({ error: 'Invalid admin credentials!' });
  }
});

// ── Events APIs ───────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  db.query('SELECT * FROM events ORDER BY date ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/events/:id', (req, res) => {
  db.query('SELECT * FROM events WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Fetch UPI ID from admin_settings
    db.query('SELECT upi_id FROM admin_settings LIMIT 1', (err, settings) => {
      const event = results[0];
      const upi_id = settings[0]?.upi_id || 'admin@bank';
      
      res.json({
        ...event,
        upi_id: upi_id
      });
    });
  });
});

app.post('/api/events', (req, res) => {
  const { name, description, date, venue, total_seats, category, event_type, general_price, vip_price, has_vip } = req.body;
  db.query(
    'INSERT INTO events (name, description, date, venue, total_seats, available_seats, category, event_type, general_price, vip_price, has_vip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, description, date, venue, total_seats, total_seats, category, event_type, general_price, vip_price || 0, has_vip || false],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Event added!', id: result.insertId });
    }
  );
});

app.put('/api/events/:id', (req, res) => {
  const { name, description, date, venue, total_seats, available_seats, category, event_type, general_price, vip_price, has_vip } = req.body;
  db.query(
    'UPDATE events SET name=?, description=?, date=?, venue=?, total_seats=?, available_seats=?, category=?, event_type=?, general_price=?, vip_price=?, has_vip=? WHERE id=?',
    [name, description, date, venue, total_seats, available_seats, category, event_type, general_price, vip_price || 0, has_vip || false, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Event updated!' });
    }
  );
});

app.delete('/api/events/:id', (req, res) => {
  db.query('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Event deleted!' });
  });
});

app.get('/api/events/top/booked', (req, res) => {
  db.query(
    `SELECT e.*, COALESCE(SUM(b.quantity), 0) as total_booked 
     FROM events e LEFT JOIN bookings b ON e.id = b.event_id 
     GROUP BY e.id ORDER BY total_booked DESC, e.date ASC LIMIT 3`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// ── Bookings APIs ─────────────────────────────────────────────
app.post('/api/bookings', (req, res) => {
  const { event_id, user_id, name, email, roll_number, department, ticket_type, quantity, total_amount } = req.body;
  db.query('SELECT available_seats FROM events WHERE id = ?', [event_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results[0].available_seats < quantity) {
      return res.status(400).json({ error: 'Not enough seats available!' });
    }
    const verification_code = uuidv4().substring(0, 8).toUpperCase();
    db.query(
      'INSERT INTO bookings (event_id, user_id, name, email, roll_number, department, ticket_type, quantity, total_amount, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [event_id, user_id, name, email, roll_number, department, ticket_type, quantity, total_amount, verification_code],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query('UPDATE events SET available_seats = available_seats - ? WHERE id = ?', [quantity, event_id]);
        res.json({ message: 'Booking successful!', booking_id: result.insertId, verification_code });
      }
    );
  });
});

app.get('/api/bookings', (req, res) => {
  db.query(
    'SELECT b.*, e.name as event_name FROM bookings b JOIN events e ON b.event_id = e.id ORDER BY b.booking_date DESC',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.put('/api/bookings/:id/paid', (req, res) => {
  const { email, name, event_name, verification_code, total_amount, ticket_type, quantity, venue, date } = req.body;
  db.query('UPDATE bookings SET payment_status = "paid" WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🎟️ Booking Confirmed - ${event_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: white; border-radius: 12px; overflow: hidden;">
          <div style="background: #e94560; padding: 25px; text-align: center;">
            <h1 style="margin:0;">🎟️ Booking Confirmed!</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #e94560;">${event_name}</h2>
            <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px; color: rgba(255,255,255,0.6);">Name</td>
                <td style="padding: 10px; color: white; font-weight: bold;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px; color: rgba(255,255,255,0.6);">Ticket Type</td>
                <td style="padding: 10px; color: white; font-weight: bold;">${ticket_type}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px; color: rgba(255,255,255,0.6);">Quantity</td>
                <td style="padding: 10px; color: white; font-weight: bold;">${quantity}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px; color: rgba(255,255,255,0.6);">Amount Paid</td>
                <td style="padding: 10px; color: #e94560; font-weight: bold; font-size: 18px;">₹${total_amount}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px; color: rgba(255,255,255,0.6);">Venue</td>
                <td style="padding: 10px; color: white; font-weight: bold;">${venue}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: rgba(255,255,255,0.6);">Verification Code</td>
                <td style="padding: 10px; color: #e94560; font-weight: bold; font-size: 20px; letter-spacing: 3px;">${verification_code}</td>
              </tr>
            </table>
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 20px; text-align: center;">Show this email at the event entrance for verification.</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.log('Email error:', err);
    });

    res.json({ message: 'Payment confirmed!' });
  });
});

// ── UPI Settings ──────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  db.query('SELECT * FROM admin_settings LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

app.put('/api/settings', (req, res) => {
  const { upi_id, upi_name } = req.body;
  db.query('UPDATE admin_settings SET upi_id=?, upi_name=? WHERE id=1', [upi_id, upi_name], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Settings updated!' });
  });
});

// ── Chatbot API with Gemini ────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, events } = req.body;
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are a helpful assistant for EventBooking, a ticket booking platform. 
    Here are the current available events: ${JSON.stringify(events)}
    Help users find events, answer booking questions, and provide event details.
    Keep responses short, friendly and helpful. Use emojis occasionally.`;

    const result = await model.generateContent(systemPrompt + '\n\nUser: ' + message);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.log('Chatbot error:', err);
    res.status(500).json({ error: 'Chatbot error!' });
  }
});

app.listen(5000, () => { console.log('Server running on port 5000'); });
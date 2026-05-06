import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then(res => setEvents(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to EventBooking</h1>
        <p>Book your tickets for upcoming department events</p>
      </div>
      <div className="events-container">
        {events.map(event => (
          <div className="event-card" key={event.id}>
            <h2>{event.name}</h2>
            <p>{event.description}</p>
            <div className="event-details">
              <span>📅 {event.date}</span>
              <span>📍 {event.venue}</span>
              <span>🎟️ {event.available_seats} seats left</span>
            </div>
            <button onClick={() => navigate(`/book/${event.id}`)}>
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
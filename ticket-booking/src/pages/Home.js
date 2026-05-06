import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const [events, setEvents] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/events').then(res => setEvents(res.data));
    axios.get('http://localhost:5000/api/events/top/booked').then(res => setTopEvents(res.data));
  }, []);

  const filtered = events.filter(e => {
    const matchFilter = filter === 'all' || e.category === filter;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const typeIcon = (type) => {
    const icons = { concert: '🎵', hackathon: '💻', seminar: '🎓', workshop: '🔧', expo: '🏆', other: '🎯' };
    return icons[type] || '🎯';
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="home">
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <h1>🎟️ Discover & Book Events</h1>
          <p>Your gateway to amazing college and national events</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Top Events Scroll */}
      <div className="section">
        <h2 className="section-title">🔥 Top Events</h2>
        <div className="top-events-scroll">
          {topEvents.map(event => (
            <div className="top-event-card" key={event.id}>
              <div className="top-event-icon">{typeIcon(event.event_type)}</div>
              <div className="top-event-info">
                <h3>{event.name}</h3>
                <p>📅 {formatDate(event.date)}</p>
                <p>📍 {event.venue}</p>
                <p className="top-event-price">From ₹{event.general_price === 0 ? 'Free' : event.general_price}</p>
              </div>
              <button onClick={() => navigate(`/book/${event.id}`)}>Book Now</button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="section">
        <div className="filter-bar">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>🌐 All Events</button>
          <button className={filter === 'internal' ? 'active' : ''} onClick={() => setFilter('internal')}>🏫 College Events</button>
          <button className={filter === 'external' ? 'active' : ''} onClick={() => setFilter('external')}>🌍 External Events</button>
        </div>

        {/* Events Grid */}
        <div className="events-grid">
          {filtered.map(event => (
            <div className="event-card" key={event.id}>
              <div className="event-card-header">
                <span className="event-icon">{typeIcon(event.event_type)}</span>
                <span className={`event-badge ${event.category}`}>
                  {event.category === 'internal' ? '🏫 College' : '🌍 External'}
                </span>
              </div>
              <h3>{event.name}</h3>
              <p className="event-desc">{event.description}</p>
              <div className="event-meta">
                <span>📅 {formatDate(event.date)}</span>
                <span>📍 {event.venue}</span>
                <span>🎟️ {event.available_seats} seats left</span>
              </div>
              <div className="event-pricing">
                <span className="price-tag">General: ₹{event.general_price === 0 ? 'Free' : event.general_price}</span>
                {event.has_vip && <span className="price-tag vip">VIP: ₹{event.vip_price}</span>}
              </div>
              <button
                className={event.available_seats === 0 ? 'btn-disabled' : 'btn-book'}
                disabled={event.available_seats === 0}
                onClick={() => navigate(`/book/${event.id}`)}
              >
                {event.available_seats === 0 ? 'Sold Out' : 'Book Now →'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
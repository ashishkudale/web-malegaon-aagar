import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import '../../styles/main.css';

const HomePage = () => {
  return (
    <div className="main-site">
      <Header />

      <main className="home-hero">
        <div className="hero-content">
          <h1>Welcome to Malegaon Aagar</h1>
          <h2 className="marathi">मालेगाव आगार मध्ये आपले स्वागत आहे</h2>
          <p>Your Complete Bus Timetable & Route Finder</p>

          <div className="cta-buttons">
            <Link to="/routes" className="btn-large">View All Routes</Link>
            <Link to="/search" className="btn-large btn-outline">Search Routes</Link>
          </div>
        </div>
      </main>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-box">
              <div className="icon">🚌</div>
              <h3>All Routes</h3>
              <p>Browse complete list of bus routes in Malegaon</p>
            </div>
            <div className="feature-box">
              <div className="icon">🔍</div>
              <h3>Smart Search</h3>
              <p>Find routes between any two stops</p>
            </div>
            <div className="feature-box">
              <div className="icon">📍</div>
              <h3>Detailed Info</h3>
              <p>View all stops and timings for each route</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;

import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/main/Header';
import Footer from '../components/main/Footer';

const NotFound = () => {
  return (
    <div className="main-site">
      <Header />

      <main className="page-content">
        <div className="container">
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '120px', marginBottom: '20px' }}>🚌</div>
            <h1 style={{ fontSize: '72px', margin: '0 0 20px 0', color: '#667eea' }}>404</h1>
            <h2 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>Page Not Found</h2>
            <p className="marathi" style={{ fontSize: '24px', margin: '0 0 40px 0' }}>पृष्ठ सापडले नाही</p>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px', maxWidth: '500px' }}>
              The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/" className="btn-large" style={{ padding: '15px 40px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600' }}>
                Go Home
              </Link>
              <Link to="/routes" className="btn-large" style={{ padding: '15px 40px', background: 'transparent', color: '#667eea', textDecoration: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', border: '2px solid #667eea' }}>
                View Routes
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

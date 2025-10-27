import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>Malegaon Aagar</h1>
          <p className="marathi">मालेगाव आगार</p>
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/routes">All Routes</Link>
          <Link to="/search">Search Routes</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

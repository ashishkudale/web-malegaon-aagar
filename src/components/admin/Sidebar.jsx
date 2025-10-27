import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>

      <nav className="sidebar-nav">
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/stops">Manage Stops</Link>
        <Link to="/admin/stops/add">Add Stop</Link>
        <Link to="/admin/routes">Manage Routes</Link>
        <Link to="/admin/routes/create">Create Route</Link>
      </nav>

      <div className="sidebar-footer">
        <a href="/" target="_blank">View Main Site</a>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;

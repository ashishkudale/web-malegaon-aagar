import React, { useState, useEffect } from 'react';
import { stopService } from '../../services/stopService';
import { routeService } from '../../services/routeService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStops: 0, totalRoutes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [stops, routes] = await Promise.all([
        stopService.getAllStops(),
        routeService.getAllRoutes()
      ]);
      setStats({
        totalStops: stops.length,
        totalRoutes: routes.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Stops</h3>
          <p className="stat-number">{stats.totalStops}</p>
        </div>
        <div className="stat-card">
          <h3>Total Routes</h3>
          <p className="stat-number">{stats.totalRoutes}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

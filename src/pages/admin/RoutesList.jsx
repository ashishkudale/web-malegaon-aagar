import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { routeService } from '../../services/routeService';

const RoutesList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routeService.getAllRoutes();
      setRoutes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete route "${name}"?`)) {
      try {
        await routeService.deleteRoute(id);
        loadRoutes();
      } catch (error) {
        alert('Error deleting route');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Manage Routes</h1>
          <p style={{ marginTop: '12px' }}>Total: {routes.length}</p>
        </div>
        <Link to="/admin/routes/create" className="btn-primary">Create Route</Link>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Route No.</th>
            <th>Name (English)</th>
            <th>नाव (मराठी)</th>
            <th>Type</th>
            <th>Fare</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map(route => (
            <tr key={route.id}>
              <td><strong>{route.routeNumber}</strong></td>
              <td>{route.routeNameEnglish}</td>
              <td>{route.routeNameMarathi}</td>
              <td><span className="badge">{route.routeType}</span></td>
              <td>₹{route.fare}</td>
              <td>
                <Link to={`/admin/routes/edit/${route.id}`} className="btn-edit">
                  Edit
                </Link>
                <button onClick={() => handleDelete(route.id, route.routeNameEnglish)} className="btn-delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoutesList;

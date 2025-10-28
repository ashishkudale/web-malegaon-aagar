import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stopService } from '../../services/stopService';

const StopsList = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    try {
      const data = await stopService.getAllStops();
      setStops(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await stopService.deleteStop(id);
        loadStops();
      } catch (error) {
        alert('Error deleting stop');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Manage Stops</h1>
          <p style={{ marginTop: '12px' }}>Total: {stops.length}</p>
        </div>
        <Link to="/admin/stops/add" className="btn-primary">Add Stop</Link>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name (English)</th>
            <th>नाव (मराठी)</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stops.map(stop => (
            <tr key={stop.id}>
              <td>{stop.stopCode || '-'}</td>
              <td>{stop.stopNameEnglish}</td>
              <td>{stop.stopNameMarathi}</td>
              <td>
                {stop.latitude && stop.longitude
                  ? `${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}`
                  : '-'}
              </td>
              <td>
                <span className={`badge ${stop.isActive ? 'active' : 'inactive'}`}>
                  {stop.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <Link to={`/admin/stops/edit/${stop.id}`} className="btn-edit">
                  Edit
                </Link>
                <button onClick={() => handleDelete(stop.id, stop.stopNameEnglish)} className="btn-delete">
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

export default StopsList;

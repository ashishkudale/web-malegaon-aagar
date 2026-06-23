import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { busService } from '../../services/busService';
import { stopService } from '../../services/stopService';

const BusesList = () => {
  const [buses, setBuses] = useState([]);
  const [stopsMap, setStopsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [busData, stopsData] = await Promise.all([
        busService.getAllBuses(),
        stopService.getAllStops()
      ]);
      const map = {};
      stopsData.forEach(s => { map[s.id] = s; });
      setStopsMap(map);
      setBuses(busData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, busNumber) => {
    if (window.confirm(`Delete bus "${busNumber}"?`)) {
      try {
        await busService.deleteBus(id);
        loadData();
      } catch (error) {
        alert('Error deleting bus');
      }
    }
  };

  const getStopName = (stopId) => {
    return stopsMap[stopId]?.stopNameEnglish || stopId;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Manage Buses</h1>
          <p style={{ marginTop: '12px' }}>Total: {buses.length}</p>
        </div>
        <Link to="/admin/buses/add" className="btn-primary">Add Bus</Link>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Bus Number</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Departure</th>
            <th>Direction</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.map(bus => (
            <tr key={bus.id}>
              <td>{bus.busNumber}</td>
              <td>{getStopName(bus.sourceStopId)}</td>
              <td>{getStopName(bus.destinationStopId)}</td>
              <td>{bus.departureTime}</td>
              <td>
                <span className={`badge ${bus.direction === 'up' ? 'active' : 'inactive'}`}>
                  {bus.direction === 'up' ? '↑ Up' : '↓ Down'}
                </span>
              </td>
              <td>
                <span className={`badge ${bus.isActive ? 'active' : 'inactive'}`}>
                  {bus.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <Link to={`/admin/buses/edit/${bus.id}`} className="btn-edit">
                  Edit
                </Link>
                <button onClick={() => handleDelete(bus.id, bus.busNumber)} className="btn-delete">
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

export default BusesList;

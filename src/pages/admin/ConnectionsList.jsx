import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connectionService } from '../../services/connectionService';
import { stopService } from '../../services/stopService';

const ConnectionsList = () => {
  const [connections, setConnections] = useState([]);
  const [stops, setStops] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load connections
      const connectionsData = await connectionService.getAllConnections();
      setConnections(connectionsData);

      // Load all stops
      const stopsData = await stopService.getAllStops();
      const stopsMap = {};
      stopsData.forEach(stop => {
        stopsMap[stop.id] = stop;
      });
      setStops(stopsMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (connectionId) => {
    if (!window.confirm('Delete this connection?')) return;

    try {
      await connectionService.deleteConnection(connectionId);
      alert('Connection deleted!');
      loadData();
    } catch (error) {
      alert('Error deleting connection');
      console.error(error);
    }
  };

  const getStopName = (stopId) => {
    return stops[stopId]?.stopNameEnglish || stopId;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>All Connections</h1>
          <p style={{ marginTop: '12px' }}>Total Connections: {connections.length}</p>
        </div>
        <Link to="/admin/connections/add" className="btn-primary">
          Add Connection
        </Link>
      </div>

      <div className="connections-grid">
        {connections.map(conn => (
          <div key={conn.id} className="connection-card">
            <div className="connection-visual-card">
              <div className="stop-node">
                <div className="node-dot"></div>
                <span>{getStopName(conn.fromStopId)}</span>
              </div>

              <div className="arrow-line">
                <span className="arrow-symbol">
                  {conn.isBidirectional ? '↔️' : '→'}
                </span>
              </div>

              <div className="stop-node">
                <div className="node-dot"></div>
                <span>{getStopName(conn.toStopId)}</span>
              </div>
            </div>

            <div className="connection-info">
              <span className={`badge ${conn.isBidirectional ? 'badge-bidirectional' : 'badge-oneway'}`}>
                {conn.isBidirectional ? 'Bidirectional' : 'One-way'}
              </span>
              <span className={`badge ${conn.isActive ? 'badge-active' : 'badge-inactive'}`}>
                {conn.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="connection-actions">
              <button
                onClick={() => handleDelete(conn.id)}
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {connections.length === 0 && (
        <div className="empty-state">
          <p>No connections yet. Start by adding your first connection!</p>
          <Link to="/admin/connections/add" className="btn-primary">
            Add First Connection
          </Link>
        </div>
      )}
    </div>
  );
};

export default ConnectionsList;

import React, { useState, useEffect } from 'react';
import { connectionService } from '../../services/connectionService';
import { stopService } from '../../services/stopService';

const GraphVisualization = () => {
  const [connections, setConnections] = useState([]);
  const [stops, setStops] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0, bidirectional: 0, oneWay: 0 });

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

      // Filter only connected stops (stops that have at least one connection)
      const connectedStopIds = new Set();
      connectionsData.forEach(conn => {
        connectedStopIds.add(conn.fromStopId);
        connectedStopIds.add(conn.toStopId);
      });

      // Keep only connected stops
      const connectedStopsMap = {};
      connectedStopIds.forEach(stopId => {
        if (stopsMap[stopId]) {
          connectedStopsMap[stopId] = stopsMap[stopId];
        }
      });

      setStops(connectedStopsMap);

      // Calculate stats
      const bidirectionalCount = connectionsData.filter(c => c.isBidirectional).length;
      setStats({
        totalNodes: Object.keys(connectedStopsMap).length,
        totalEdges: connectionsData.length,
        bidirectional: bidirectionalCount,
        oneWay: connectionsData.length - bidirectionalCount
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStopName = (stopId) => {
    return stops[stopId]?.stopNameEnglish || stopId;
  };

  if (loading) return <div className="admin-page"><p>Loading graph...</p></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Graph Visualization</h1>
          <p style={{ marginTop: '12px' }}>Visual representation of stop connections</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="graph-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔵</div>
          <div>
            <h3>Total Nodes</h3>
            <p className="stat-number">{stats.totalNodes}</p>
            <p className="stat-label">Bus Stops</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">➡️</div>
          <div>
            <h3>Total Edges</h3>
            <p className="stat-number">{stats.totalEdges}</p>
            <p className="stat-label">Connections</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↔️</div>
          <div>
            <h3>Bidirectional</h3>
            <p className="stat-number">{stats.bidirectional}</p>
            <p className="stat-label">Two-way routes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">→</div>
          <div>
            <h3>One-way</h3>
            <p className="stat-number">{stats.oneWay}</p>
            <p className="stat-label">Single direction</p>
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="graph-container">
        <h2>Network Graph</h2>
        <p className="graph-description">
          Each circle represents a bus stop (node), and lines represent connections (edges) between stops.
        </p>

        <div className="graph-canvas">
          <svg width="100%" height="auto" viewBox="0 0 1200 800" style={{ border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa' }}>
            {/* Draw connections (edges) first so they appear behind nodes */}
            {connections.map((conn, index) => {
              const fromStop = stops[conn.fromStopId];
              const toStop = stops[conn.toStopId];

              if (!fromStop || !toStop) return null;

              // Linear/Grid positioning
              const stopIds = Object.keys(stops);
              const cols = Math.ceil(Math.sqrt(stopIds.length));
              const rows = Math.ceil(stopIds.length / cols);

              const fromIndex = stopIds.indexOf(conn.fromStopId);
              const toIndex = stopIds.indexOf(conn.toStopId);

              const spacing = 150;
              const offsetX = 100;
              const offsetY = 100;

              const x1 = offsetX + (fromIndex % cols) * spacing;
              const y1 = offsetY + Math.floor(fromIndex / cols) * spacing;
              const x2 = offsetX + (toIndex % cols) * spacing;
              const y2 = offsetY + Math.floor(toIndex / cols) * spacing;

              // Calculate arrow position for one-way connections
              const angle = Math.atan2(y2 - y1, x2 - x1);
              const arrowSize = 8;
              const arrowX = x2 - Math.cos(angle) * 20;
              const arrowY = y2 - Math.sin(angle) * 20;

              return (
                <g key={index}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={conn.isBidirectional ? '#27ae60' : '#f39c12'}
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  {/* Arrow for one-way connections */}
                  {!conn.isBidirectional && (
                    <polygon
                      points={`
                        ${arrowX},${arrowY}
                        ${arrowX - arrowSize * Math.cos(angle - Math.PI / 6)},${arrowY - arrowSize * Math.sin(angle - Math.PI / 6)}
                        ${arrowX - arrowSize * Math.cos(angle + Math.PI / 6)},${arrowY - arrowSize * Math.sin(angle + Math.PI / 6)}
                      `}
                      fill="#f39c12"
                    />
                  )}
                </g>
              );
            })}

            {/* Draw nodes (stops) */}
            {Object.keys(stops).map((stopId, index) => {
              const stop = stops[stopId];

              // Grid layout positioning
              const stopIds = Object.keys(stops);
              const cols = Math.ceil(Math.sqrt(stopIds.length));

              const spacing = 150;
              const offsetX = 100;
              const offsetY = 100;

              const x = offsetX + (index % cols) * spacing;
              const y = offsetY + Math.floor(index / cols) * spacing;

              // Count connections for this stop
              const connectionCount = connections.filter(
                c => c.fromStopId === stopId || c.toStopId === stopId
              ).length;

              return (
                <g key={stopId}>
                  <circle
                    cx={x}
                    cy={y}
                    r={8 + connectionCount * 2}
                    fill="#667eea"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={y - 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#333"
                    fontWeight="600"
                  >
                    {stop.stopNameEnglish.substring(0, 15)}
                  </text>
                  <text
                    x={x}
                    y={y + 30}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#666"
                  >
                    ({connectionCount})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="graph-legend">
          <h3>Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-node" style={{ background: '#667eea' }}></div>
              <span>Bus Stop (Node) - Size indicates number of connections</span>
            </div>
            <div className="legend-item">
              <div className="legend-line" style={{ background: '#27ae60' }}></div>
              <span>Bidirectional Connection (↔️)</span>
            </div>
            <div className="legend-item">
              <div className="legend-line" style={{ background: '#f39c12' }}></div>
              <span>One-way Connection (→)</span>
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className="connections-table">
          <h3>All Connections</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>From</th>
                <th>Direction</th>
                <th>To</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn, index) => (
                <tr key={conn.id}>
                  <td>{index + 1}</td>
                  <td>{getStopName(conn.fromStopId)}</td>
                  <td>
                    <span className={conn.isBidirectional ? 'badge-bidirectional' : 'badge-oneway'}>
                      {conn.isBidirectional ? '↔️' : '→'}
                    </span>
                  </td>
                  <td>{getStopName(conn.toStopId)}</td>
                  <td>
                    <span className={`badge ${conn.isBidirectional ? 'badge-bidirectional' : 'badge-oneway'}`}>
                      {conn.isBidirectional ? 'Bidirectional' : 'One-way'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualization;

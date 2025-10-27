import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import { routeService } from '../../services/routeService';

const RouteDetailsPage = () => {
  const { routeId } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoute();
  }, [routeId]);

  const loadRoute = async () => {
    try {
      const data = await routeService.getRouteById(routeId);
      setRoute(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="main-site"><div className="loading">Loading...</div></div>;
  if (!route) return <div className="main-site"><div>Route not found</div></div>;

  return (
    <div className="main-site">
      <Header />

      <main className="page-content">
        <div className="container">
          <Link to="/routes" className="back-link">← Back to All Routes</Link>

          <div className="route-detail-header">
            <div className="route-badge">{route.routeNumber}</div>
            <div>
              <h1>{route.routeNameEnglish}</h1>
              <p className="marathi">{route.routeNameMarathi}</p>
              <div className="route-detail-meta">
                <span className="badge">{route.routeType}</span>
                <span>Operator: {route.operatorName}</span>
                <span>Base Fare: ₹{route.fare}</span>
              </div>
            </div>
          </div>

          <div className="stops-section">
            <h2>Route Stops ({route.stops.length})</h2>
            <p className="marathi">मार्गावरील स्टॉप</p>

            <div className="stops-list">
              {route.stops.map((stop, index) => (
                <div key={stop.id} className="stop-detail-item">
                  <div className="stop-sequence">{index + 1}</div>
                  <div className="stop-line">
                    {index < route.stops.length - 1 && <div className="connector"></div>}
                  </div>
                  <div className="stop-detail-info">
                    <h3>{stop.stopDetails.stopNameEnglish}</h3>
                    <p className="marathi">{stop.stopDetails.stopNameMarathi}</p>
                    {stop.stopDetails.landmark && (
                      <p className="landmark">📍 {stop.stopDetails.landmark}</p>
                    )}
                    {index > 0 && (
                      <div className="stop-metrics">
                        <span>🚶 {stop.distanceFromPrevious} km</span>
                        <span>⏱️ {stop.estimatedTimeFromPrevious} min</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RouteDetailsPage;

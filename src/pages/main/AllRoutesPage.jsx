import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import { routeService } from '../../services/routeService';

const AllRoutesPage = () => {
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

  return (
    <div className="main-site">
      <Header />

      <main className="page-content">
        <div className="container">
          <div className="page-title">
            <h1>All Bus Routes</h1>
            <p className="marathi">सर्व बस मार्ग</p>
            <p className="count">Total Routes: {routes.length}</p>
          </div>

          {loading ? (
            <div className="loading">Loading routes...</div>
          ) : (
            <div className="routes-grid">
              {routes.map(route => (
                <Link
                  key={route.id}
                  to={`/routes/${route.id}`}
                  className="route-card"
                >
                  <div className="route-number">{route.routeNumber}</div>
                  <div className="route-info">
                    <h3>{route.routeNameEnglish}</h3>
                    <p className="marathi">{route.routeNameMarathi}</p>
                    <div className="route-meta">
                      <span className="badge">{route.routeType}</span>
                      <span className="fare">₹{route.fare}</span>
                    </div>
                  </div>
                  <div className="arrow">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllRoutesPage;

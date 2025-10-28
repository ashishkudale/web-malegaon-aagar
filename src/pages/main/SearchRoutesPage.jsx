import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import { stopService } from '../../services/stopService';
import { routeService } from '../../services/routeService';

const SearchRoutesPage = () => {
  const [allStops, setAllStops] = useState([]);
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    try {
      // Use getAllStops instead of getActiveStops to avoid Firestore index requirement
      const stops = await stopService.getAllStops();
      // Filter for active stops on the client side
      const activeStops = stops.filter(stop => stop.isActive !== false);
      setAllStops(activeStops);
    } catch (error) {
      console.error('Error loading stops:', error);
    }
  };

  const handleSearch = async () => {
    if (!fromStop || !toStop) {
      alert('Please select both From and To stops');
      return;
    }

    if (fromStop === toStop) {
      alert('From and To stops cannot be the same');
      return;
    }

    setSearching(true);
    setSearched(true);

    try {
      const results = await routeService.searchRoutes(fromStop, toStop);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
      alert('Error searching routes');
    } finally {
      setSearching(false);
    }
  };

  const getStopName = (stopId) => {
    const stop = allStops.find(s => s.id === stopId);
    return stop ? stop.stopNameEnglish : '';
  };

  return (
    <div className="main-site">
      <Header />

      <main className="page-content">
        <div className="container">
          <div className="page-title">
            <h1>Search Bus Routes</h1>
            <p className="marathi">बस मार्ग शोधा</p>
          </div>

          <div className="search-box">
            <div className="search-form">
              <div className="form-group">
                <label>From (प्रारंभ)</label>
                <select
                  value={fromStop}
                  onChange={(e) => setFromStop(e.target.value)}
                  className="search-select"
                >
                  <option value="">Select starting stop</option>
                  {allStops.map(stop => (
                    <option key={stop.id} value={stop.id}>
                      {stop.stopNameEnglish} ({stop.stopNameMarathi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-arrow">⬇️</div>

              <div className="form-group">
                <label>To (गंतव्य)</label>
                <select
                  value={toStop}
                  onChange={(e) => setToStop(e.target.value)}
                  className="search-select"
                >
                  <option value="">Select destination stop</option>
                  {allStops.map(stop => (
                    <option key={stop.id} value={stop.id}>
                      {stop.stopNameEnglish} ({stop.stopNameMarathi})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSearch}
                disabled={searching}
                className="btn-search"
              >
                {searching ? 'Searching...' : 'Search Routes 🔍'}
              </button>
            </div>
          </div>

          {searched && (
            <div className="search-results">
              <h2>Search Results</h2>
              {searchResults.length === 0 ? (
                <div className="no-results">
                  <p>😔 No routes found between these stops.</p>
                  <p className="marathi">या स्टॉप दरम्यान कोणतेही मार्ग आढळले नाहीत.</p>
                </div>
              ) : (
                <>
                  <p className="results-count">
                    Found {searchResults.length} route(s) from <strong>{getStopName(fromStop)}</strong> to <strong>{getStopName(toStop)}</strong>
                  </p>

                  <div className="routes-list">
                    {searchResults.map((route, idx) => (
                      <div key={route.id || `connecting-${idx}`} className="search-result-card">
                        {route.routeType === 'direct' ? (
                          // Direct route display
                          <>
                            <div className="result-header">
                              <div className="route-badge">{route.routeNumber}</div>
                              <div>
                                <h3>{route.routeNameEnglish}</h3>
                                <p className="marathi">{route.routeNameMarathi}</p>
                              </div>
                              <div className="result-fare">₹{route.fare}</div>
                            </div>

                            {route.direction === 'reverse' && (
                              <div className="route-note" style={{ padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '12px' }}>
                                ⚠️ {route.note}
                              </div>
                            )}

                            <div className="result-journey">
                              <p><strong>Your Journey:</strong></p>
                              <div className="journey-stops">
                                {route.stopsInJourney.map((stop, index) => (
                                  <div key={stop.id} className="journey-stop">
                                    <span className="journey-number">{index + 1}</span>
                                    <span>{stop.stopDetails.stopNameEnglish}</span>
                                    {index < route.stopsInJourney.length - 1 && (
                                      <span className="journey-arrow">→</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="stops-count">
                                {route.stopsInJourney.length} stops
                              </p>
                            </div>

                            <Link to={`/routes/${route.id}`} className="view-details-btn">
                              View Full Route Details →
                            </Link>
                          </>
                        ) : (
                          // Connecting route display
                          <>
                            <div className="result-header" style={{ backgroundColor: '#e3f2fd' }}>
                              <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: '4px' }}>🔄 Connecting Route (1 Transfer)</h3>
                                <p style={{ fontSize: '14px', color: '#666' }}>बदली मार्ग</p>
                              </div>
                              <div className="result-fare">₹{route.totalFare}</div>
                            </div>

                            <div className="result-journey">
                              {/* First Leg */}
                              <div style={{ marginBottom: '16px' }}>
                                <p><strong>Leg 1: Route {route.leg1.routeNumber}</strong></p>
                                <div className="journey-stops">
                                  {route.leg1.stopsInJourney.map((stop, index) => (
                                    <div key={stop.id} className="journey-stop">
                                      <span className="journey-number">{index + 1}</span>
                                      <span>{stop.stopDetails.stopNameEnglish}</span>
                                      {index < route.leg1.stopsInJourney.length - 1 && (
                                        <span className="journey-arrow">→</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                  {route.leg1.stopsInJourney.length} stops · ₹{route.leg1.fare}
                                </p>
                              </div>

                              {/* Transfer Point */}
                              <div style={{ padding: '12px', backgroundColor: '#fff9c4', borderRadius: '4px', marginBottom: '16px', textAlign: 'center' }}>
                                <strong>🚏 Transfer at: {route.transferStop.stopDetails.stopNameEnglish}</strong>
                                <p style={{ fontSize: '13px', marginTop: '4px' }}>बदली करा</p>
                              </div>

                              {/* Second Leg */}
                              <div>
                                <p><strong>Leg 2: Route {route.leg2.routeNumber}</strong></p>
                                <div className="journey-stops">
                                  {route.leg2.stopsInJourney.map((stop, index) => (
                                    <div key={stop.id} className="journey-stop">
                                      <span className="journey-number">{index + 1}</span>
                                      <span>{stop.stopDetails.stopNameEnglish}</span>
                                      {index < route.leg2.stopsInJourney.length - 1 && (
                                        <span className="journey-arrow">→</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                  {route.leg2.stopsInJourney.length} stops · ₹{route.leg2.fare}
                                </p>
                              </div>

                              <p className="stops-count" style={{ marginTop: '12px' }}>
                                Total: {route.leg1.stopsInJourney.length + route.leg2.stopsInJourney.length - 1} stops · 1 transfer
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Link to={`/routes/${route.leg1.id}`} className="view-details-btn" style={{ flex: 1 }}>
                                View Route {route.leg1.routeNumber} →
                              </Link>
                              <Link to={`/routes/${route.leg2.id}`} className="view-details-btn" style={{ flex: 1 }}>
                                View Route {route.leg2.routeNumber} →
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchRoutesPage;

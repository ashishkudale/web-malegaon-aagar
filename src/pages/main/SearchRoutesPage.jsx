import React, { useState, useEffect } from 'react';
import Header from '../../components/main/Header';
import Footer from '../../components/main/Footer';
import { stopService } from '../../services/stopService';
import { graphService } from '../../services/graphService';

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
      const stops = await stopService.getAllStops();
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
      const results = await graphService.searchAllRoutes(fromStop, toStop);
      setSearchResults(results);

      // Smooth scroll to results after a short delay
      setTimeout(() => {
        const resultsSection = document.querySelector('.search-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
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
                {searching ? 'Searching All Routes...' : 'Find All Routes 🔍'}
              </button>
            </div>
          </div>

          {searching && (
            <div className="search-results">
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                <h3 style={{ color: '#667eea', marginBottom: '10px' }}>Searching All Routes...</h3>
                <p style={{ color: '#6b7280' }}>Finding the best paths between your stops</p>
              </div>
            </div>
          )}

          {searched && !searching && (
            <div className="search-results">
              <h2>All Possible Routes</h2>
              {searchResults.length === 0 ? (
                <div className="no-results">
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
                  <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    No routes found between these stops
                  </p>
                  <p className="marathi" style={{ fontSize: '16px', marginBottom: '20px' }}>
                    या स्टॉप दरम्यान कोणतेही मार्ग आढळले नाहीत
                  </p>
                  <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: '#f3f4f6',
                    borderRadius: '10px',
                    maxWidth: '500px',
                    margin: '30px auto 0'
                  }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                      💡 <strong>Tip:</strong> Make sure these stops are connected in the admin panel.
                      Check the Graph Visualization to see all available connections.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="results-count">
                    Found <strong>{searchResults.length}</strong> possible route(s) from <strong>{getStopName(fromStop)}</strong> to <strong>{getStopName(toStop)}</strong>
                  </p>

                  <div className="routes-list">
                    {searchResults.map((result, index) => (
                      <div key={index} className="search-result-card graph-route">
                        <div className="route-header">
                          <div className="route-badge">
                            Route {index + 1}
                            {result.isShortestPath && (
                              <span className="fastest-badge">⚡ Shortest</span>
                            )}
                          </div>
                          <div className="route-stats">
                            <span>📍 {result.totalStops} stops</span>
                          </div>
                        </div>

                        <div className="path-visualization">
                          {result.stops && result.stops.map((stop, idx) => (
                            <div key={idx} className="path-stop">
                              <div className="stop-marker">
                                {idx === 0 && <span className="marker-label">START</span>}
                                {idx === result.stops.length - 1 && <span className="marker-label">END</span>}
                                <div className={`stop-dot ${idx === 0 ? 'start' : idx === result.stops.length - 1 ? 'end' : ''}`}>
                                  {idx + 1}
                                </div>
                                {idx < result.stops.length - 1 && (
                                  <div className="connector-line"></div>
                                )}
                              </div>
                              <div className="stop-details">
                                <strong>{stop.stopNameEnglish}</strong>
                                <p className="marathi-small">{stop.stopNameMarathi}</p>
                                {stop.landmark && (
                                  <p className="landmark">📍 {stop.landmark}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="route-summary">
                          <p>
                            <strong>Complete Path:</strong><br />
                            {result.stops && result.stops.map((s, i) => (
                              <span key={i}>
                                {s.stopNameEnglish}
                                {i < result.stops.length - 1 && <span style={{ margin: '0 8px', color: '#667eea', fontWeight: 'bold' }}>→</span>}
                              </span>
                            ))}
                          </p>
                        </div>
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

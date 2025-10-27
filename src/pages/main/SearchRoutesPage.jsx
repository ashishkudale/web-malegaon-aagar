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
                  <p>😔 No direct routes found between these stops.</p>
                  <p className="marathi">या स्टॉप दरम्यान कोणतेही थेट मार्ग आढळले नाहीत.</p>
                </div>
              ) : (
                <>
                  <p className="results-count">
                    Found {searchResults.length} route(s) from <strong>{getStopName(fromStop)}</strong> to <strong>{getStopName(toStop)}</strong>
                  </p>

                  <div className="routes-list">
                    {searchResults.map(route => (
                      <div key={route.id} className="search-result-card">
                        <div className="result-header">
                          <div className="route-badge">{route.routeNumber}</div>
                          <div>
                            <h3>{route.routeNameEnglish}</h3>
                            <p className="marathi">{route.routeNameMarathi}</p>
                          </div>
                          <div className="result-fare">₹{route.fare}</div>
                        </div>

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

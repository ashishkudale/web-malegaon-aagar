import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stopService } from '../../services/stopService';
import { routeService } from '../../services/routeService';

const CreateRoute = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allStops, setAllStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [formData, setFormData] = useState({
    routeNumber: '',
    routeNameEnglish: '',
    routeNameMarathi: '',
    routeType: 'local',
    operatorName: 'Malegaon ST',
    fare: ''
  });

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    try {
      // Use getAllStops instead of getActiveStops to avoid Firestore index requirement
      const stops = await stopService.getAllStops();
      console.log('Loaded stops:', stops);
      // Filter for active stops on the client side
      const activeStops = stops.filter(stop => stop.isActive !== false);
      setAllStops(activeStops);
    } catch (error) {
      console.error('Error loading stops:', error);
      alert('Error loading stops: ' + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddStop = (stopId) => {
    const stop = allStops.find(s => s.id === stopId);
    if (stop && !selectedStops.find(s => s.stopId === stopId)) {
      setSelectedStops(prev => [...prev, {
        stopId: stop.id,
        stopName: stop.stopNameEnglish,
        stopNameMarathi: stop.stopNameMarathi,
        distanceFromPrevious: 0,
        estimatedTimeFromPrevious: 0
      }]);
    }
  };

  const handleRemoveStop = (index) => {
    setSelectedStops(prev => prev.filter((_, i) => i !== index));
  };

  const handleStopDataChange = (index, field, value) => {
    setSelectedStops(prev => prev.map((stop, i) =>
      i === index ? { ...stop, [field]: value } : stop
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStops.length < 2) {
      alert('Add at least 2 stops');
      return;
    }

    setLoading(true);
    try {
      const routeData = {
        ...formData,
        fare: parseFloat(formData.fare),
        startStop: selectedStops[0].stopId,
        endStop: selectedStops[selectedStops.length - 1].stopId
      };

      const stops = selectedStops.map((stop, index) => ({
        stopId: stop.stopId,
        distanceFromPrevious: index === 0 ? 0 : parseFloat(stop.distanceFromPrevious) || 0,
        estimatedTimeFromPrevious: index === 0 ? 0 : parseInt(stop.estimatedTimeFromPrevious) || 0
      }));

      await routeService.createRoute(routeData, stops);
      alert('Route created!');
      navigate('/admin/routes');
    } catch (error) {
      alert('Error creating route');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Create New Route</h1>
      <p className="subtitle" style={{ marginTop: '12px' }}>नवीन मार्ग तयार करा</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Route Number *</label>
            <input
              type="text"
              name="routeNumber"
              value={formData.routeNumber}
              onChange={handleChange}
              placeholder="101"
              required
            />
          </div>

          <div className="form-group">
            <label>Route Type</label>
            <select name="routeType" value={formData.routeType} onChange={handleChange}>
              <option value="local">Local</option>
              <option value="express">Express</option>
              <option value="shuttle">Shuttle</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Route Name (English) *</label>
            <input
              type="text"
              name="routeNameEnglish"
              value={formData.routeNameEnglish}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>मार्ग नाव (मराठी) *</label>
            <input
              type="text"
              name="routeNameMarathi"
              value={formData.routeNameMarathi}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Base Fare (₹)</label>
          <input
            type="number"
            name="fare"
            value={formData.fare}
            onChange={handleChange}
            placeholder="25"
          />
        </div>

        <div className="form-section">
          <h3>Add Stops</h3>
          {allStops.length === 0 ? (
            <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: 0, color: '#856404' }}>
                ⚠️ No stops available. Please <a href="/admin/stops/add" style={{ color: '#667eea', fontWeight: 'bold' }}>add some stops</a> first before creating a route.
              </p>
            </div>
          ) : (
            <select onChange={(e) => handleAddStop(e.target.value)} value="">
              <option value="">-- Select a stop --</option>
              {allStops.map(stop => (
                <option key={stop.id} value={stop.id}>
                  {stop.stopNameEnglish} ({stop.stopNameMarathi})
                </option>
              ))}
            </select>
          )}

          {selectedStops.length > 0 && (
            <div className="selected-stops">
              {selectedStops.map((stop, index) => (
                <div key={index} className="stop-item">
                  <span className="stop-number">{index + 1}</span>
                  <div className="stop-info">
                    <p>{stop.stopName}</p>
                    <p className="marathi">{stop.stopNameMarathi}</p>
                  </div>
                  {index > 0 && (
                    <div className="stop-inputs">
                      <div style={{ marginBottom: '5px' }}>
                        <small style={{ color: '#666' }}>Distance from previous stop (km) / मागील थांब्यापासून अंतर (किमी)</small>
                      </div>
                      <input
                        type="number"
                        placeholder="e.g., 1.5"
                        value={stop.distanceFromPrevious}
                        onChange={(e) => handleStopDataChange(index, 'distanceFromPrevious', e.target.value)}
                        step="0.1"
                      />
                      <div style={{ marginBottom: '5px', marginTop: '10px' }}>
                        <small style={{ color: '#666' }}>Travel time from previous stop (min) / मागील थांब्यापासून वेळ (मिनिटे)</small>
                      </div>
                      <input
                        type="number"
                        placeholder="e.g., 5"
                        value={stop.estimatedTimeFromPrevious}
                        onChange={(e) => handleStopDataChange(index, 'estimatedTimeFromPrevious', e.target.value)}
                      />
                    </div>
                  )}
                  <button type="button" onClick={() => handleRemoveStop(index)} className="btn-remove">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/routes')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Route'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoute;

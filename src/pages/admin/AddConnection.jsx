import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stopService } from '../../services/stopService';
import { connectionService } from '../../services/connectionService';

const AddConnection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allStops, setAllStops] = useState([]);
  const [formData, setFormData] = useState({
    fromStopId: '',
    toStopId: '',
    isBidirectional: true
  });

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fromStopId || !formData.toStopId) {
      alert('Please select both stops');
      return;
    }

    if (formData.fromStopId === formData.toStopId) {
      alert('From and To stops cannot be the same');
      return;
    }

    setLoading(true);

    try {
      await connectionService.addConnection(formData);
      alert('Connection added successfully!');
      navigate('/admin/connections');
    } catch (error) {
      const fromStopName = allStops.find(s => s.id === formData.fromStopId)?.stopNameEnglish || 'selected stops';
      const toStopName = allStops.find(s => s.id === formData.toStopId)?.stopNameEnglish || 'selected stops';

      if (error.message === 'Connection already exists') {
        alert(`⚠️ Connection already exists between "${fromStopName}" and "${toStopName}"!\n\nA connection already exists between these two stops. Please check the connections list.`);
      } else {
        alert(error.message || 'Error adding connection');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStopName = (stopId) => {
    const stop = allStops.find(s => s.id === stopId);
    return stop ? `${stop.stopNameEnglish} (${stop.stopNameMarathi})` : '';
  };

  return (
    <div className="admin-page">
      <h1>Add Connection (Edge)</h1>
      <p className="subtitle" style={{ marginTop: '12px' }}>Create a connection between two stops</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="connection-visual">
          <div className="connection-node">
            <div className="node-circle">FROM</div>
            <p>{formData.fromStopId ? getStopName(formData.fromStopId) : 'Select stop'}</p>
          </div>

          <div className="connection-arrow">
            {formData.isBidirectional ? '↔️' : '→'}
          </div>

          <div className="connection-node">
            <div className="node-circle">TO</div>
            <p>{formData.toStopId ? getStopName(formData.toStopId) : 'Select stop'}</p>
          </div>
        </div>

        <div className="form-group">
          <label>From Stop (Source) *</label>
          <select
            name="fromStopId"
            value={formData.fromStopId}
            onChange={handleChange}
            required
          >
            <option value="">Select starting stop</option>
            {allStops.map(stop => (
              <option key={stop.id} value={stop.id}>
                {stop.stopNameEnglish} ({stop.stopNameMarathi})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>To Stop (Destination) *</label>
          <select
            name="toStopId"
            value={formData.toStopId}
            onChange={handleChange}
            required
          >
            <option value="">Select ending stop</option>
            {allStops.map(stop => (
              <option key={stop.id} value={stop.id}>
                {stop.stopNameEnglish} ({stop.stopNameMarathi})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isBidirectional"
              checked={formData.isBidirectional}
              onChange={handleChange}
            />
            <span>Bidirectional (can travel both ways)</span>
          </label>
          <p className="help-text">
            ✅ Checked: Buses can go from A to B AND from B to A<br/>
            ❌ Unchecked: Buses can only go from A to B (one-way)
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/connections')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Adding...' : 'Add Connection'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddConnection;

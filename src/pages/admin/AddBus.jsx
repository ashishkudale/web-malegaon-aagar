import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { busService } from '../../services/busService';
import { stopService } from '../../services/stopService';

const AddBus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState([]);
  const [formData, setFormData] = useState({
    busNumber: '',
    sourceStopId: '',
    destinationStopId: '',
    departureTime: '',
    direction: 'up',
    isActive: true
  });

  useEffect(() => {
    stopService.getActiveStops().then(setStops).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.sourceStopId === formData.destinationStopId) {
      alert('Source and destination cannot be the same stop.');
      return;
    }
    setLoading(true);
    try {
      await busService.addBus(formData);
      alert('Bus added successfully!');
      navigate('/admin/buses');
    } catch (error) {
      alert('Error adding bus');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Add New Bus</h1>
      <p className="subtitle" style={{ marginTop: '12px' }}>नवीन बस जोडा</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Bus Number *</label>
            <input
              type="text"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              placeholder="e.g., MH-15 AB 1234"
              required
            />
          </div>

          <div className="form-group">
            <label>Departure Time *</label>
            <input
              type="time"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Source Stop *</label>
            <select
              name="sourceStopId"
              value={formData.sourceStopId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Source --</option>
              {stops.map(stop => (
                <option key={stop.id} value={stop.id}>
                  {stop.stopNameEnglish}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Destination Stop *</label>
            <select
              name="destinationStopId"
              value={formData.destinationStopId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Destination --</option>
              {stops.map(stop => (
                <option key={stop.id} value={stop.id}>
                  {stop.stopNameEnglish}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Direction *</label>
          <select
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            required
          >
            <option value="up">↑ Up — Malegaon to other station</option>
            <option value="down">↓ Down — Other station to Malegaon</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Active</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/buses')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding...' : 'Add Bus'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBus;

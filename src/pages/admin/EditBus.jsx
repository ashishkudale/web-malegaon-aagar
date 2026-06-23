import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { busService } from '../../services/busService';
import { stopService } from '../../services/stopService';

const EditBus = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingBus, setFetchingBus] = useState(true);
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
    const load = async () => {
      try {
        const [bus, stopsData] = await Promise.all([
          busService.getBusById(busId),
          stopService.getActiveStops()
        ]);
        setStops(stopsData);
        setFormData({
          busNumber: bus.busNumber || '',
          sourceStopId: bus.sourceStopId || '',
          destinationStopId: bus.destinationStopId || '',
          departureTime: bus.departureTime || '',
          direction: bus.direction || 'up',
          isActive: bus.isActive !== undefined ? bus.isActive : true
        });
      } catch (error) {
        alert('Error loading bus');
        console.error(error);
        navigate('/admin/buses');
      } finally {
        setFetchingBus(false);
      }
    };
    load();
  }, [busId]);

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
      await busService.updateBus(busId, formData);
      alert('Bus updated successfully!');
      navigate('/admin/buses');
    } catch (error) {
      alert('Error updating bus');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingBus) {
    return <div className="admin-page"><div>Loading bus...</div></div>;
  }

  return (
    <div className="admin-page">
      <h1>Edit Bus</h1>
      <p className="subtitle">बस संपादित करा</p>

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
            {loading ? 'Updating...' : 'Update Bus'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBus;

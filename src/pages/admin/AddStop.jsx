import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stopService } from '../../services/stopService';

const AddStop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    stopNameEnglish: '',
    stopNameMarathi: '',
    stopCode: '',
    latitude: '',
    longitude: '',
    address: '',
    landmark: '',
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stopData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 0,
        city: 'Malegaon',
        district: 'Nashik',
        state: 'Maharashtra'
      };

      await stopService.addStop(stopData);
      alert('Stop added successfully!');
      navigate('/admin/stops');
    } catch (error) {
      alert('Error adding stop');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Add New Stop</h1>
      <p className="subtitle" style={{ marginTop: '12px' }}>नवीन स्टॉप जोडा</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Stop Name (English) *</label>
            <input
              type="text"
              name="stopNameEnglish"
              value={formData.stopNameEnglish}
              onChange={handleChange}
              placeholder="e.g., Gandhi Chowk"
              required
            />
          </div>

          <div className="form-group">
            <label>स्टॉप नाव (मराठी) *</label>
            <input
              type="text"
              name="stopNameMarathi"
              value={formData.stopNameMarathi}
              onChange={handleChange}
              placeholder="उदा. गांधी चौक"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stop Code</label>
            <input
              type="text"
              name="stopCode"
              value={formData.stopCode}
              onChange={handleChange}
              placeholder="e.g., MGN001"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude (Optional)</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="20.5579"
            />
          </div>

          <div className="form-group">
            <label>Longitude (Optional)</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="74.5287"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Landmark</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="Near City Hospital"
          />
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
          <button type="button" onClick={() => navigate('/admin/stops')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding...' : 'Add Stop'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStop;

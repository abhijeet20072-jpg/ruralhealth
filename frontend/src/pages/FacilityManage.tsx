import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const FacilityManage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', type: 'SUB_CENTRE', address: '', operatingHours: '',
    emergencyAvailability: false, diagnosticsAvailable: false, medicineStatus: 'UNKNOWN',
    services: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        services: formData.services.split(',').map(s => s.trim()).filter(s => s)
      };
      await api.post('/facilities', payload);
      navigate('/facilities');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save facility');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Register New Facility</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Facility Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full p-2 border rounded">
              <option value="SUB_CENTRE">Sub Centre</option>
              <option value="PHC">Primary Health Centre</option>
              <option value="CHC">Community Health Centre</option>
              <option value="RURAL_HOSPITAL">Rural Hospital</option>
              <option value="DISTRICT_HOSPITAL">District Hospital</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
            <input type="text" placeholder="e.g. 9 AM - 5 PM" value={formData.operatingHours} onChange={e => setFormData({...formData, operatingHours: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Services (Comma separated)</label>
            <input type="text" placeholder="Vaccination, Maternal Care" value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input type="checkbox" checked={formData.emergencyAvailability} onChange={e => setFormData({...formData, emergencyAvailability: e.target.checked})} className="mr-2" />
              24/7 Emergency
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={formData.diagnosticsAvailable} onChange={e => setFormData({...formData, diagnosticsAvailable: e.target.checked})} className="mr-2" />
              Diagnostics Unit
            </label>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Facility</button>
        </form>
      </div>
    </div>
  );
};

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
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Facility Configuration</h1>
          <p className="text-slate-500 mt-1 text-sm">Register a new healthcare facility and configure services.</p>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Facility Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow">
              <option value="SUB_CENTRE">Sub Centre</option>
              <option value="PHC">Primary Health Centre</option>
              <option value="CHC">Community Health Centre</option>
              <option value="RURAL_HOSPITAL">Rural Hospital</option>
              <option value="DISTRICT_HOSPITAL">District Hospital</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Operating Hours</label>
            <input type="text" placeholder="e.g. 9 AM - 5 PM" value={formData.operatingHours} onChange={e => setFormData({...formData, operatingHours: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Services (Comma separated)</label>
            <input type="text" placeholder="Vaccination, Maternal Care" value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
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
          <button type="submit" className="w-full py-3 bg-cyan-600 text-white rounded-md font-semibold text-lg hover:bg-cyan-700 shadow-md transition-colors mt-6">Save Facility</button>
        </form>
      </div>
    </div>
  );
};

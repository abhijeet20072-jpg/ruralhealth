import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

export const PatientManage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    abhaId: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE',
    phoneNumber: '', address: '', emergencyContactName: '', emergencyContactPhone: '',
    bloodGroup: '', allergies: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      api.get(`/patients/${id}`)
        .then(res => {
          const p = res.data.patient;
          setFormData({
            abhaId: p.abhaId || '', firstName: p.firstName, lastName: p.lastName,
            dateOfBirth: p.dateOfBirth, gender: p.gender, phoneNumber: p.phoneNumber || '',
            address: p.address || '', emergencyContactName: p.emergencyContactName || '',
            emergencyContactPhone: p.emergencyContactPhone || '', bloodGroup: p.bloodGroup || '',
            allergies: p.allergies ? p.allergies.join(', ') : ''
          });
        })
        .catch(err => setError(err.response?.data?.error || 'Failed to load patient'));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(s => s)
      };
      
      if (isEditing) {
        await api.put(`/patients/${id}`, payload);
        navigate(`/patients/${id}`);
      } else {
        const res = await api.post('/patients', payload);
        navigate(`/patients/${res.data.patientId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save patient');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow border-t-4 border-green-600">
        <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Update Patient Profile' : 'Register New Patient'}</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">DOB (YYYY-MM-DD) *</label>
              <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender *</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="mt-1 block w-full p-2 border rounded">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ABHA ID</label>
            <input type="text" placeholder="Optional" value={formData.abhaId} onChange={e => setFormData({...formData, abhaId: e.target.value})} className="mt-1 block w-full p-2 border rounded font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <input type="text" placeholder="e.g. O+" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
            <h3 className="col-span-2 font-medium text-gray-700">Emergency Contact</h3>
            <div>
              <label className="block text-xs text-gray-500">Name</label>
              <input type="text" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Phone</label>
              <input type="text" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Allergies (Comma separated)</label>
            <input type="text" placeholder="Peanuts, Penicillin" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
          </div>

          <button type="submit" className="w-full py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700">
            {isEditing ? 'Save Changes' : 'Register Securely'}
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const isCitizen = user?.role === 'ROLE_CITIZEN';

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
    
    // Frontend validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      setError('Invalid Phone Number. Must be 10 digits starting with 6, 7, 8, or 9.');
      return;
    }
    if (formData.emergencyContactPhone && !phoneRegex.test(formData.emergencyContactPhone.replace(/\s/g, ''))) {
      setError('Invalid Emergency Contact Phone Number.');
      return;
    }
    
    // Clean up data before sending
    

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
      <div className="bg-white p-8 rounded-xl shadow border-t-4 border-cyan-500">
        <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight text-slate-900">{isEditing ? 'Update Profile' : (isCitizen ? 'Complete Patient Profile' : 'Register New Patient')}</h1>
    {isCitizen && !isEditing && <p className="text-slate-500 text-sm mt-1">Please complete your health profile to access clinical services, book appointments, and track your medical history.</p>}</div>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name *</label>
              <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last Name *</label>
              <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">DOB (YYYY-MM-DD) *</label>
              <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Gender *</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="mt-1 block w-full p-2 border rounded">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Government Health ID (Optional)</label>
            <input type="text" placeholder="Optional" value={formData.abhaId} onChange={e => setFormData({...formData, abhaId: e.target.value})} className="mt-1 block w-full p-2 border rounded font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Blood Group</label>
              <input type="text" placeholder="e.g. O+" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border">
            <h3 className="col-span-2 font-medium text-slate-700">Emergency Contact</h3>
            <div>
              <label className="block text-xs text-slate-500">Name</label>
              <input type="text" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs text-slate-500">Phone</label>
              <input type="text" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Allergies (Comma separated)</label>
            <input type="text" placeholder="Peanuts, Penicillin" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
          </div>

          <button type="submit" className="w-full py-3 bg-cyan-600 text-white rounded-md font-semibold shadow-sm hover:bg-cyan-700 transition-colors">
            {isEditing ? 'Save Changes' : 'Register Securely'}
          </button>
        </form>
      </div>
    </div>
  );
};

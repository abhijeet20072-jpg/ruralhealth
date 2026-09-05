import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConnectivity } from '../context/ConnectivityContext';


const getTypeStyles = (type: string) => {
  switch(type) {
    case 'CONSULTATION': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'TRIAGE': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'PRESCRIPTION': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'DIAGNOSTIC': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'REFERRAL': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'EMERGENCY': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const MedicalRecords: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Patient ID
  const { user } = useAuth();
  const { isOnline, enqueueOperation } = useConnectivity();
  const [timeline, setTimeline] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  // Form State
  const [recordType, setRecordType] = useState('CONSULTATION');
  const [notes, setNotes] = useState('');
  
  
  const facilityId = user?.facilityId; 

  const fetchTimeline = async () => {
    try {
      const res = await api.get(`/records/patient/${id}`);
      setTimeline(res.data.timeline);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load medical records');
    }
  };

  useEffect(() => {
    if (id) fetchTimeline();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isOnline) {
        await api.post('/records', { patientId: id, facilityId, recordType, notes });
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'CREATE_MEDICAL_RECORD',
          payload: { patientId: id, recordType, notes },
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Record saved locally and queued for sync');
      }
      setNotes('');
      fetchTimeline(); // Refresh timeline
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create record');
    }
  };

  // Only clinical roles should see the 'Add Record' form
  const isClinical = user?.role !== 'ROLE_CITIZEN';

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to={`/patients/${id}`} className="text-cyan-600 hover:underline mb-6 inline-block">&larr; Back to Patient Profile</Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Longitudinal Medical Records</h1>
      
      {error && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded font-bold border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">Clinical Timeline</h2>
          {timeline.length === 0 ? (
            <p className="text-slate-500 italic">No medical records found for this patient.</p>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {timeline.map(record => (
                <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${getTypeStyles(record.recordType)}`}>
                    <span className="font-bold text-xs">{record.recordType.charAt(0)}</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-bold text-sm tracking-wide uppercase ${getTypeStyles(record.recordType).split(' ')[1]}`}>{record.recordType.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-500">{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 text-sm mb-3">{record.notes}</p>
                    <div className="text-xs text-slate-500 flex justify-between border-t pt-2">
                      <span>Dr. {record.doctorName}</span>
                      <span>{record.facilityName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isClinical && (
          <div>
            <div className="bg-slate-50 p-6 rounded-lg border shadow-sm sticky top-8">
              <h2 className="text-lg font-bold mb-4">Add Clinical Record</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Record Type</label>
                  <select value={recordType} onChange={e => setRecordType(e.target.value)} className="w-full p-2 border rounded text-sm">
                    <option value="CONSULTATION">Consultation</option>
                    <option value="DIAGNOSIS">Diagnosis</option>
                    <option value="PRESCRIPTION">Prescription</option>
                    <option value="VITALS">Vitals / Observation</option>
                    <option value="INVESTIGATION">Investigation (Lab/Scan)</option>
                    <option value="TREATMENT">Treatment / Procedure</option>
                    <option value="FOLLOW_UP">Follow-Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Notes</label>
                  <textarea required rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter detailed clinical notes..." className="w-full p-2 border rounded text-sm"></textarea>
                </div>
                <button type="submit" className="w-full py-2 bg-cyan-600 text-white rounded font-bold hover:bg-cyan-700 transition">
                  Append to EHR
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

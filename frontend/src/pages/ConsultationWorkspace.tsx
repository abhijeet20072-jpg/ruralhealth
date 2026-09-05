import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useConnectivity } from '../context/ConnectivityContext';
import { OrderDiagnosticModal } from '../components/OrderDiagnosticModal';
import { CheckMedicineAvailabilityModal } from '../components/CheckMedicineAvailabilityModal';

export const ConsultationWorkspace: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline, enqueueOperation } = useConnectivity();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [triage, setTriage] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State
  const [complaint, setComplaint] = useState('');
  const [observations, setObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [investigations, setInvestigations] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [prescriptions, setPrescriptions] = useState([{ medicine: '', dosage: '', frequency: '', duration: '' }]);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [checkMedTerm, setCheckMedTerm] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointment directly 
        // Wait, there's no GET /api/appointments/:id endpoint currently exposed to Doctor securely?
        // Let's fetch the queue and find it.
        const qRes = await api.get(`/appointments/queue?facilityId=${user?.facilityId}`);
        const apt = qRes.data.queue.find((a: any) => a.id === appointmentId);
        
        if (!apt) {
          setError('Appointment not found or not in queue for this facility.');
          setLoading(false);
          return;
        }
        setAppointment(apt);

        // Fetch Patient
        const pRes = await api.get(`/patients/${apt.patientId}`);
        setPatient(pRes.data.patient);

        // Fetch Triage
        const tRes = await api.get(`/triage/patient/${apt.patientId}`);
        // get latest triage
        if (tRes.data.assessments && tRes.data.assessments.length > 0) {
          setTriage(tRes.data.assessments[0]);
        }

      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load consultation context.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.facilityId) fetchData();
  }, [appointmentId, user]);

  const handlePrescriptionChange = (index: number, field: string, value: string) => {
    const updated = [...prescriptions];
    (updated[index] as any)[field] = value;
    setPrescriptions(updated);
  };

  const addMedicine = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const validPrescriptions = prescriptions.filter(p => p.medicine.trim() !== '');

      const payload = {
        appointmentId,
        patientId: appointment.patientId,
        facilityId: user?.facilityId,
        complaint,
        observations,
        diagnosis,
        investigations,
        followUp,
        prescription: validPrescriptions.length > 0 ? validPrescriptions : undefined
      };

      if (isOnline) {
        await api.post('/consultation/complete', payload);
        alert('Consultation completed successfully. EHR has been updated.');
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'COMPLETE_CONSULTATION',
          payload,
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Consultation saved locally and queued for sync.');
      }
      navigate('/queue');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to complete consultation.');
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Clinical Workspace...</div>;
  if (error && !patient) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Context */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-cyan-600">
          <h2 className="text-xl font-bold mb-4">Patient Summary</h2>
          {patient ? (
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-500">Name:</span> <span className="font-bold">{patient.firstName} {patient.lastName}</span></li>
              <li><span className="text-slate-500">DOB:</span> {patient.dateOfBirth}</li>
              <li><span className="text-slate-500">Gender:</span> {patient.gender}</li>
              <li><span className="text-slate-500">Blood:</span> <span className="text-red-600 font-bold">{patient.bloodGroup || 'Unknown'}</span></li>
            </ul>
          ) : <p>No patient info</p>}
          <div className="mt-4 pt-4 border-t">
            <button onClick={() => window.open(`/patients/${appointment.patientId}/records`, '_blank')} className="text-cyan-600 hover:underline text-sm font-medium">
              Open Full EHR (New Tab) &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
          <h2 className="text-xl font-bold mb-4">Triage & Vitals</h2>
          {triage ? (
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-500">Urgency:</span> <span className={`font-bold ${triage.urgencyLevel === 'EMERGENCY' ? 'text-red-600' : 'text-yellow-600'}`}>{triage.urgencyLevel}</span></li>
              <li><span className="text-slate-500">Symptoms:</span> {triage.symptoms}</li>
              <li><span className="text-slate-500">Temp:</span> {triage.temperature} °C</li>
              <li><span className="text-slate-500">BP:</span> {triage.bloodPressure}</li>
              <li><span className="text-slate-500">HR:</span> {triage.heartRate} bpm</li>
              <li><span className="text-slate-500">O2:</span> {triage.oxygenSaturation}%</li>
              {triage.warningFlags && (
                <li className="mt-2 p-2 bg-red-50 text-red-700 font-bold text-xs rounded">
                  WARNINGS: {triage.warningFlags}
                </li>
              )}
            </ul>
          ) : (
            <p className="text-slate-500 italic text-sm">No recent triage recorded for this patient.</p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Clinical Form */}
      <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h1 className="text-2xl font-bold text-slate-900">Clinical Consultation</h1>
          <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded text-sm font-bold">Token {appointment.tokenNumber}</span>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-700 font-bold rounded border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Chief Complaint *</label>
              <textarea required rows={3} className="w-full border p-3 rounded" value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="Primary reason for visit..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Clinical Observations</label>
              <textarea rows={3} className="w-full border p-3 rounded" value={observations} onChange={e => setObservations(e.target.value)} placeholder="Doctor's notes on examination..."></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Diagnosis / Assessment</label>
            <input type="text" className="w-full border p-3 rounded" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="E.g., Acute Viral Pharyngitis" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-slate-700">Prescription (Rx)</label>
              <button type="button" onClick={addMedicine} className="text-sm font-semibold bg-cyan-50 text-cyan-700 px-4 py-2 rounded-md border border-cyan-200 hover:bg-cyan-100 transition-colors">+ Add Medicine</button>
            </div>
            
            <div className="space-y-3">
              {prescriptions.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input type="text" placeholder="Medicine Name" className="w-1/3 border p-2 rounded text-sm" value={p.medicine} onChange={e => handlePrescriptionChange(idx, 'medicine', e.target.value)} />
                  <input type="text" placeholder="Dosage (e.g. 500mg)" className="w-1/6 border p-2 rounded text-sm" value={p.dosage} onChange={e => handlePrescriptionChange(idx, 'dosage', e.target.value)} />
                  <input type="text" placeholder="Frequency (e.g. 1-0-1)" className="w-1/4 border p-2 rounded text-sm" value={p.frequency} onChange={e => handlePrescriptionChange(idx, 'frequency', e.target.value)} />
                  <input type="text" placeholder="Duration (e.g. 5 Days)" className="w-1/4 border p-2 rounded text-sm" value={p.duration} onChange={e => handlePrescriptionChange(idx, 'duration', e.target.value)} />
                  {prescriptions.length > 1 && (
                    <button type="button" onClick={() => removeMedicine(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Investigations Ordered (Free Text)</label>
              <textarea rows={2} className="w-full border p-3 rounded" value={investigations} onChange={e => setInvestigations(e.target.value)} placeholder="Other manual notes..."></textarea>
              <button type="button" onClick={() => setShowDiagnosticModal(true)} className="mt-2 text-sm bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 transition-colors inline-flex items-center">
                + Order Formal Diagnostic Test
              </button>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Follow-up Instructions</label>
              <textarea rows={2} className="w-full border p-3 rounded" value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="Review after 7 days if fever persists..."></textarea>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button type="button" onClick={() => navigate('/queue')} className="px-6 py-3 border text-slate-700 rounded mr-4 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving || !complaint.trim()} className="px-8 py-3 bg-cyan-600 text-white rounded font-bold hover:bg-cyan-700 disabled:opacity-50 shadow-md">
              {saving ? 'Saving to EHR...' : 'Complete Consultation'}
            </button>
          </div>
          {!isOnline && (
            <p className="mt-4 text-yellow-600 font-bold text-sm text-right">
              You are offline. Submission will be queued securely.
            </p>
          )}
        </form>
      </div>
      {showDiagnosticModal && <OrderDiagnosticModal patientId={appointment!.patientId} onClose={() => setShowDiagnosticModal(false)} />}
      {checkMedTerm && <CheckMedicineAvailabilityModal searchTerm={checkMedTerm} onClose={() => setCheckMedTerm(null)} />}
    </div>
  );
};

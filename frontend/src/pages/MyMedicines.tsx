import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface PrescribedMedicine {
  medicine: string; // Wait, consultation stores generic text or medicineId?
  dosage: string;
  frequency: string;
  duration: string;
  prescribedAt: string;
  sourceFacilityId: string;
}

// In ConsultationWorkspace, we push: { medicine: string, dosage: string, frequency: string, duration: string }
// We can display that. Wait, if the doctor just typed text, it won't be a catalog medicine ID.
// Let's design it to show the prescription history.

export const MyMedicines: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<PrescribedMedicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We assume the URL patient ID matches the logged in citizen (backend verifies this)
    // We need to fetch the patient ID first.
    api.get('/auth/me').then(async () => {
      const pRes = await api.get('/patients'); // Citizen gets their own patient record
      if (pRes.data.patients && pRes.data.patients.length > 0) {
        const pId = pRes.data.patients[0].id;
        const res = await api.get(`/medicines/patient/${pId}`);
        setPrescriptions(res.data.prescriptions);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6">Loading medicines...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">My Prescribed Medicines</h1>
      
      {prescriptions.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl shadow border border-slate-100">
          <p className="text-slate-500 text-lg">You have no prescribed medicines.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((m, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow border border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 mb-2">{m.medicine}</h3>
              <p className="text-slate-600"><strong>Dosage:</strong> {m.dosage}</p>
              <p className="text-slate-600"><strong>Frequency:</strong> {m.frequency}</p>
              <p className="text-slate-600"><strong>Duration:</strong> {m.duration}</p>
              <p className="text-slate-400 text-xs mt-4 border-t pt-2">Prescribed: {new Date(m.prescribedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

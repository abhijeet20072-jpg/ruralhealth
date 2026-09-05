import React, { useState } from 'react';
import { api } from '../services/api';
import { useParams } from 'react-router-dom';
import { useConnectivity } from '../context/ConnectivityContext';

export const Triage: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const { isOnline, enqueueOperation } = useConnectivity();

  const [formData, setFormData] = useState({
    temperature: '', heartRate: '', spO2: '', systolicBp: '', diastolicBp: '',
    respiratoryRate: '', symptoms: '', riskFactors: ''
  });
  
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const payload = {
        patientId,
        vitals: {
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
          spO2: formData.spO2 ? parseInt(formData.spO2) : undefined,
          systolicBp: formData.systolicBp ? parseInt(formData.systolicBp) : undefined,
          diastolicBp: formData.diastolicBp ? parseInt(formData.diastolicBp) : undefined,
          respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
        },
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        riskFactors: formData.riskFactors.split(',').map(s => s.trim()).filter(s => s)
      };

      if (isOnline) {
        const res = await api.post('/triage/assess', payload);
        setResult(res.data);
      } else {
        // Enqueue the payload directly (it already has patientId)
        // Note: the backend sync endpoint accepts string symptoms not arrays, so let's format it for sync
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'CREATE_TRIAGE',
          payload: { 
            patientId,
            vitals: JSON.stringify(payload.vitals),
            symptoms: formData.symptoms,
            riskFactors: formData.riskFactors,
            urgencyLevel: 'ROUTINE', // fallback, backend overrides if CDSS applies on sync
            recommendedAction: 'To be reviewed by clinician upon sync',
            referralNeeded: false
          },
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Triage assessment saved locally and queued for remote CDSS sync');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete triage. Note: UI assumes valid patientId binding.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Digital Triage</h1>
        <p className="text-slate-500 mt-2">Structured clinical intake and CDSS emergency assessment.</p>
      </div>

      {result ? (
        <div className={`p-6 rounded-lg mb-8 text-white ${
          result.result.urgencyLevel === 'EMERGENCY' ? 'bg-rose-600 shadow-md' :
          result.result.urgencyLevel === 'URGENT' ? 'bg-amber-600 shadow-md' : 'bg-emerald-600 shadow-md'
        }`}>
          <h2 className="text-2xl font-bold mb-2">Result: {result.result.urgencyLevel}</h2>
          <p className="font-medium text-lg mb-4">{result.result.recommendedAction}</p>
          <div className="bg-white/20 p-4 rounded-md text-sm font-medium border-l-4 border-white/50 backdrop-blur-sm">
            {result.disclaimer}
          </div>
          <button onClick={() => setResult(null)} className="mt-6 px-4 py-2 bg-white text-slate-900 font-bold rounded-md shadow hover:bg-slate-50 transition-colors">
            Start New Assessment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow space-y-6 border-t-4 border-cyan-500 rounded-xl shadow-sm border-slate-200">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          
          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Vitals (Optional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500">Temp (°C)</label>
                <input type="number" step="0.1" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Heart Rate (bpm)</label>
                <input type="number" value={formData.heartRate} onChange={e => setFormData({...formData, heartRate: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">SpO2 (%)</label>
                <input type="number" value={formData.spO2} onChange={e => setFormData({...formData, spO2: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Systolic BP</label>
                <input type="number" value={formData.systolicBp} onChange={e => setFormData({...formData, systolicBp: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Diastolic BP</label>
                <input type="number" value={formData.diastolicBp} onChange={e => setFormData({...formData, diastolicBp: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Resp Rate</label>
                <input type="number" value={formData.respiratoryRate} onChange={e => setFormData({...formData, respiratoryRate: e.target.value})} className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Clinical Intake</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Reported Symptoms (Comma separated)</label>
                <input type="text" required placeholder="e.g. chest pain, fever, cough" value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} className="mt-1 block w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Risk Factors (Comma separated)</label>
                <input type="text" placeholder="e.g. smoking, diabetes, pregnancy" value={formData.riskFactors} onChange={e => setFormData({...formData, riskFactors: e.target.value})} className="mt-1 block w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-cyan-600 text-white rounded font-bold text-lg hover:bg-cyan-700 shadow-md">
            Run CDSS Triage
          </button>
        </form>
      )}
    </div>
  );
};

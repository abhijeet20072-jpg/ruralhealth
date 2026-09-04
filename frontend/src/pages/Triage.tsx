import React, { useState } from 'react';
import { api } from '../services/api';

export const Triage: React.FC = () => {
  const patientId = 'demo-patient-id'; // Mocked for UI scaffolding

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

      const res = await api.post('/triage/assess', payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete triage. Note: UI assumes valid patientId binding.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Digital Triage & Assessment</h1>
      <p className="text-gray-600 mb-8">Structured intake for healthcare workers.</p>

      {result ? (
        <div className={`p-6 rounded-lg mb-8 text-white ${
          result.result.urgencyLevel === 'EMERGENCY' ? 'bg-red-600' :
          result.result.urgencyLevel === 'URGENT' ? 'bg-orange-500' : 'bg-green-600'
        }`}>
          <h2 className="text-2xl font-bold mb-2">Result: {result.result.urgencyLevel}</h2>
          <p className="font-medium text-lg mb-4">{result.result.recommendedAction}</p>
          <div className="bg-black/20 p-4 rounded text-sm italic border-l-4 border-black/40">
            {result.disclaimer}
          </div>
          <button onClick={() => setResult(null)} className="mt-6 px-4 py-2 bg-white text-black font-bold rounded shadow hover:bg-gray-100">
            Start New Assessment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow space-y-6 border-t-4 border-indigo-600">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Vitals (Optional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500">Temp (°C)</label>
                <input type="number" step="0.1" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Heart Rate (bpm)</label>
                <input type="number" value={formData.heartRate} onChange={e => setFormData({...formData, heartRate: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">SpO2 (%)</label>
                <input type="number" value={formData.spO2} onChange={e => setFormData({...formData, spO2: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Systolic BP</label>
                <input type="number" value={formData.systolicBp} onChange={e => setFormData({...formData, systolicBp: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Diastolic BP</label>
                <input type="number" value={formData.diastolicBp} onChange={e => setFormData({...formData, diastolicBp: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Resp Rate</label>
                <input type="number" value={formData.respiratoryRate} onChange={e => setFormData({...formData, respiratoryRate: e.target.value})} className="mt-1 block w-full p-2 border rounded" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Clinical Intake</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reported Symptoms (Comma separated)</label>
                <input type="text" required placeholder="e.g. chest pain, fever, cough" value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} className="mt-1 block w-full p-3 border rounded border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Risk Factors (Comma separated)</label>
                <input type="text" placeholder="e.g. smoking, diabetes, pregnancy" value={formData.riskFactors} onChange={e => setFormData({...formData, riskFactors: e.target.value})} className="mt-1 block w-full p-3 border rounded border-gray-300" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded font-bold text-lg hover:bg-indigo-700 shadow-md">
            Run CDSS Triage
          </button>
        </form>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface CatalogItem {
  testCode: string;
  testName: string;
  category: string;
}

interface Facility {
  id: string;
  name: string;
}

interface Props {
  patientId: string;
  onClose: () => void;
}

export const OrderDiagnosticModal: React.FC<Props> = ({ patientId, onClose }) => {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [clinicalReason, setClinicalReason] = useState('');
  const [priority, setPriority] = useState('ROUTINE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/diagnostics/catalog').then((res: any) => {
      setCatalog(res.data.catalog);
    });
  }, []);

  useEffect(() => {
    if (selectedTest) {
      setFacilities([]);
      setSelectedFacility('');
      api.get(`/diagnostics/facilities?testCode=${selectedTest}`).then((res: any) => {
        setFacilities(res.data.facilities);
      });
    }
  }, [selectedTest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest || !selectedFacility || !clinicalReason) return alert('Fill all fields');
    
    setLoading(true);
    try {
      await api.post('/diagnostics/orders', {
        patientId,
        testCode: selectedTest,
        diagnosticFacilityId: selectedFacility,
        clinicalReason,
        priority
      });
      alert('Diagnostic Test Ordered successfully.');
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to order test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Order Diagnostic Test</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Select Test</label>
            <select className="w-full border p-2 rounded" value={selectedTest} onChange={e => setSelectedTest(e.target.value)}>
              <option value="">-- Choose Test --</option>
              {catalog.map(c => (
                <option key={c.testCode} value={c.testCode}>{c.testName} ({c.category})</option>
              ))}
            </select>
          </div>

          {selectedTest && (
            <div>
              <label className="block text-sm font-bold mb-1">Select Capable Facility</label>
              <select className="w-full border p-2 rounded" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}>
                <option value="">-- Choose Facility --</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {facilities.length === 0 && <p className="text-red-500 text-sm mt-1">No facilities offer this test currently.</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1">Clinical Reason</label>
            <input type="text" className="w-full border p-2 rounded" value={clinicalReason} onChange={e => setClinicalReason(e.target.value)} placeholder="e.g. Rule out anemia" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Priority</label>
            <select className="w-full border p-2 rounded" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="ROUTINE">Routine</option>
              <option value="URGENT">Urgent</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="bg-cyan-600 text-white px-4 py-2 rounded">
              {loading ? 'Ordering...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

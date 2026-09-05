import React, { useState, useEffect } from 'react';
import { api } from '../services/api';


interface Order {
  id: string;
  patientId: string;
  testCode: string;
  testName: string;
  category: string;
  firstName: string;
  lastName: string;
  referringFacilityName: string;
  clinicalReason: string;
  priority: string;
  status: string;
  createdAt: string;
}

export const DiagnosticOrders: React.FC = () => {
  // const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [resultQualitative, setResultQualitative] = useState('');
  const [resultInterpretation, setResultInterpretation] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/diagnostics/orders');
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/diagnostics/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const submitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await api.post(`/diagnostics/orders/${selectedOrder.id}/result`, {
        resultValue,
        resultQualitative,
        resultInterpretation
      });
      alert('Result recorded successfully');
      setSelectedOrder(null);
      setResultValue('');
      setResultQualitative('');
      setResultInterpretation('');
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record result');
    }
  };

  if (loading) return <div className="p-6">Loading diagnostics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Diagnostic Orders ({orders.length})</h1>
      
      <div className="grid gap-4">
        {orders.length === 0 && <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
          <svg className="w-12 h-12 text-slate-300 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No orders pending</h3>
          <p className="text-slate-500">There are no diagnostic orders requiring attention.</p>
        </div>}
        {orders.map(o => (
          <div key={o.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between hover:shadow-md transition-shadow">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{o.testName} <span className="text-slate-500 text-sm">({o.testCode})</span></h3>
                <span className={`px-2 py-1 text-xs rounded-full font-bold
                  ${o.priority === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 
                    o.priority === 'URGENT' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                  {o.priority}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200 tracking-wide uppercase">
                  {o.status}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-1"><strong>Patient:</strong> {o.firstName} {o.lastName}</p>
              <p className="text-slate-600 text-sm mb-1"><strong>From:</strong> {o.referringFacilityName}</p>
              <p className="text-slate-600 text-sm mb-1"><strong>Reason:</strong> {o.clinicalReason}</p>
              <p className="text-slate-400 text-xs mt-2">Ordered: {new Date(o.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex flex-col gap-2 min-w-[200px]">
              {o.status === 'ORDERED' && (
                <>
                  <button onClick={() => updateStatus(o.id, 'ACCEPTED')} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-colors w-full">Accept Order</button>
                  <button onClick={() => updateStatus(o.id, 'REJECTED')} className="bg-white text-red-700 px-4 py-2 rounded-md text-sm font-semibold border border-red-200 hover:bg-red-50 transition-colors w-full">Reject</button>
                </>
              )}
              {o.status === 'ACCEPTED' && (
                <button onClick={() => updateStatus(o.id, 'SAMPLE_COLLECTED')} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-colors w-full">Mark Sample Collected</button>
              )}
              {o.status === 'SAMPLE_COLLECTED' && (
                <button onClick={() => updateStatus(o.id, 'IN_PROGRESS')} className="bg-purple-600 text-white px-3 py-2 rounded text-sm font-bold">Start Processing</button>
              )}
              {o.status === 'IN_PROGRESS' && (
                <button onClick={() => setSelectedOrder(o)} className="bg-green-600 text-white px-3 py-2 rounded text-sm font-bold">Record Results</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Record Result: {selectedOrder.testName}</h2>
            <form onSubmit={submitResult} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Quantitative Value</label>
                <input type="text" className="w-full border p-2 rounded" value={resultValue} onChange={e => setResultValue(e.target.value)} placeholder="e.g. 14.5 g/dL" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Qualitative / Descriptive</label>
                <input type="text" className="w-full border p-2 rounded" value={resultQualitative} onChange={e => setResultQualitative(e.target.value)} placeholder="e.g. Normal, Positive..." />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Lab Interpretation / Note</label>
                <textarea rows={3} className="w-full border p-2 rounded" value={resultInterpretation} onChange={e => setResultInterpretation(e.target.value)}></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 text-slate-600 border rounded">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold">Save & Mark Ready</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface DiagnosticOrder {
  id: string;
  testName: string;
  category: string;
  diagnosticFacilityName: string;
  referringFacilityName: string;
  status: string;
  createdAt: string;
  resultValue?: string;
  resultQualitative?: string;
  resultInterpretation?: string;
}

export const MyDiagnostics: React.FC = () => {
  const [orders, setOrders] = useState<DiagnosticOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/diagnostics/orders').then((res: any) => {
      setOrders(res.data.orders);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading diagnostics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">My Diagnostics</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl shadow border border-slate-100">
          <p className="text-slate-500 text-lg">You have no diagnostic test orders.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white p-5 rounded-xl shadow border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{o.testName}</h3>
                  <p className="text-sm text-slate-500">{o.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border
                  ${o.status === 'COMPLETED' || o.status === 'REVIEWED' ? 'bg-green-50 text-green-700 border-green-200' :
                    o.status === 'RESULT_READY' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                  {o.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 mb-4">
                <p><strong>Processing Lab:</strong> {o.diagnosticFacilityName}</p>
                <p><strong>Ordered By:</strong> {o.referringFacilityName}</p>
                <p><strong>Ordered On:</strong> {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>

              {(o.status === 'RESULT_READY' || o.status === 'COMPLETED' || o.status === 'REVIEWED') && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2">Test Results</h4>
                  {o.resultValue && <p className="mb-1"><span className="text-slate-600">Value:</span> <strong>{o.resultValue}</strong></p>}
                  {o.resultQualitative && <p className="mb-1"><span className="text-slate-600">Qualitative:</span> <strong>{o.resultQualitative}</strong></p>}
                  {o.resultInterpretation && <p className="mt-2 text-slate-600 italic">Note: {o.resultInterpretation}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

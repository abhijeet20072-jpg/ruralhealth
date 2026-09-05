import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface InventoryItem {
  medicineId: string;
  genericName: string;
  displayName: string;
  dosageForm: string;
  strength: string;
  category: string;
  quantity: number;
  threshold: number;
  unit: string;
  status: string;
  updatedAt: string;
}

interface CatalogItem {
  medicineId: string;
  genericName: string;
  displayName: string;
}

export const FacilityMedicines: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editMed, setEditMed] = useState<string | null>(null);
  const [qty, setQty] = useState(0);
  const [thresh, setThresh] = useState(0);

  // Add State
  const [showAdd, setShowAdd] = useState(false);
  const [addMedId, setAddMedId] = useState('');
  const [addQty, setAddQty] = useState(0);
  const [addThresh, setAddThresh] = useState(0);

  const fetchData = async () => {
    try {
      const invRes = await api.get('/medicines/inventory');
      setInventory(invRes.data.inventory);
      const catRes = await api.get('/medicines/catalog');
      setCatalog(catRes.data.catalog);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (medId: string, quantity: number, threshold: number) => {
    try {
      await api.put('/medicines/inventory', { medicineId: medId, quantity, threshold });
      fetchData();
      setEditMed(null);
      setShowAdd(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update stock');
    }
  };

  if (loading) return <div className="p-6">Loading inventory...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medicine Inventory</h1>
          <p className="text-slate-500 mt-2">Manage facility pharmaceutical stock levels and low-stock alerts.</p>
        </div>
        {['ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'].includes(user?.role || '') && (
          <button onClick={() => setShowAdd(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-md font-semibold shadow-sm transition-colors">
            + Add Medicine
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow border border-slate-100 text-center">
          <p className="text-slate-500 font-bold">Total Configured</p>
          <p className="text-2xl font-black">{inventory.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow border border-green-100 text-center">
          <p className="text-green-700 font-bold">In Stock</p>
          <p className="text-2xl font-black text-green-800">{inventory.filter(i => i.status === 'AVAILABLE').length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow border border-yellow-100 text-center">
          <p className="text-yellow-700 font-bold">Low Stock</p>
          <p className="text-2xl font-black text-yellow-800">{inventory.filter(i => i.status === 'LOW_STOCK').length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded shadow border border-red-100 text-center">
          <p className="text-red-700 font-bold">Out of Stock</p>
          <p className="text-2xl font-black text-red-800">{inventory.filter(i => i.status === 'OUT_OF_STOCK').length}</p>
        </div>
      </div>

      {showAdd && (
        <div className="bg-slate-50 p-6 rounded border mb-6">
          <h2 className="font-bold mb-4">Add Medicine to Inventory</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Medicine</label>
              <select className="w-full border p-2 rounded" value={addMedId} onChange={e => setAddMedId(e.target.value)}>
                <option value="">-- Select Medicine --</option>
                {catalog.filter(c => !inventory.find(i => i.medicineId === c.medicineId)).map(c => (
                  <option key={c.medicineId} value={c.medicineId}>{c.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Initial Qty</label>
              <input type="number" min="0" className="w-24 border p-2 rounded" value={addQty} onChange={e => setAddQty(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Low Thresh</label>
              <input type="number" min="0" className="w-24 border p-2 rounded" value={addThresh} onChange={e => setAddThresh(Number(e.target.value))} />
            </div>
            <button onClick={() => handleUpdate(addMedId, addQty, addThresh)} className="bg-green-600 text-white px-4 py-2 rounded font-bold">Save</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Medicine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {inventory.map(item => (
              <tr key={item.medicineId}>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-900">{item.displayName}</div>
                  <div className="text-sm text-slate-500">{item.genericName} • {item.dosageForm}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{item.category}</td>
                <td className="px-6 py-4 text-sm font-black text-slate-900">
                  {editMed === item.medicineId ? (
                    <div className="flex flex-col gap-1 w-24">
                      <input type="number" className="border p-1 rounded" value={qty} onChange={e => setQty(Number(e.target.value))} title="Quantity" />
                      <input type="number" className="border p-1 rounded bg-yellow-50" value={thresh} onChange={e => setThresh(Number(e.target.value))} title="Threshold" />
                    </div>
                  ) : (
                    <span>{item.quantity} {item.unit} <br/><span className="text-xs text-slate-400 font-normal">Thresh: {item.threshold}</span></span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${item.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                      item.status === 'LOW_STOCK' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                      'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {['ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'].includes(user?.role || '') && (
                    <>
                      {editMed === item.medicineId ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdate(item.medicineId, qty, thresh)} className="text-green-600 hover:text-green-900 font-bold">Save</button>
                          <button onClick={() => setEditMed(null)} className="text-slate-600 hover:text-slate-900">Cancel</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setEditMed(item.medicineId); setQty(item.quantity); setThresh(item.threshold); }} 
                          className="text-cyan-600 hover:text-cyan-900 font-bold"
                        >
                          Update Stock
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && <div className="p-8 text-center text-slate-500">No medicines configured yet.</div>}
      </div>
      </div>
    </div>
  );
};

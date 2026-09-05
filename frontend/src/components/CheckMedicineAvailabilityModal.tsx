import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Facility {
  id: string;
  name: string;
  status: string;
}

interface CatalogItem {
  medicineId: string;
  genericName: string;
  displayName: string;
  category: string;
}

interface Props {
  searchTerm: string;
  onClose: () => void;
}

export const CheckMedicineAvailabilityModal: React.FC<Props> = ({ searchTerm, onClose }) => {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [selectedMed, setSelectedMed] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial search based on doctor's typed text
    api.get(`/medicines/catalog?q=${encodeURIComponent(searchTerm)}`).then(res => {
      setCatalogItems(res.data.catalog);
      if (res.data.catalog.length === 1) {
        handleSelectMed(res.data.catalog[0].medicineId);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [searchTerm]);

  const handleSelectMed = async (medId: string) => {
    setSelectedMed(medId);
    setLoading(true);
    try {
      const res = await api.get(`/medicines/availability?medicineId=${medId}`);
      setFacilities(res.data.facilities);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Medicine Availability</h2>
        
        {loading ? <p>Loading...</p> : (
          <>
            {!selectedMed ? (
              <div>
                <p className="mb-2 text-sm text-slate-600">Matched catalog items for "{searchTerm}":</p>
                {catalogItems.length === 0 ? <p className="text-red-500">No matching medicines found in catalog.</p> : (
                  <ul className="space-y-2">
                    {catalogItems.map(c => (
                      <li key={c.medicineId}>
                        <button onClick={() => handleSelectMed(c.medicineId)} className="text-left w-full p-2 border rounded hover:bg-slate-50 flex justify-between">
                          <span className="font-bold">{c.displayName}</span>
                          <span className="text-sm text-slate-500">{c.category}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                <p className="font-bold mb-4 border-b pb-2 text-lg">
                  {catalogItems.find(c => c.medicineId === selectedMed)?.displayName}
                </p>
                
                <h4 className="font-bold text-sm text-slate-700 mb-2">Available at:</h4>
                {facilities.length === 0 ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                    <p className="font-bold">OUT OF STOCK EVERYWHERE</p>
                    <p className="text-sm mt-1">No configured facilities report availability for this medicine.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {facilities.map(f => (
                      <li key={f.id} className="p-3 border rounded bg-slate-50 flex justify-between items-center">
                        <span className="font-bold">{f.name}</span>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          f.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{f.status.replace('_', ' ')}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                <button onClick={() => { setSelectedMed(null); setFacilities([]); }} className="text-cyan-600 text-sm mt-4 font-bold hover:underline">
                  &larr; Back to catalog search
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded font-bold">Close</button>
        </div>
      </div>
    </div>
  );
};

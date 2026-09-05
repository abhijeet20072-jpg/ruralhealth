import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TeleconsultationsList() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await api.get('/api/teleconsultations');
      setConsultations(res.data.consultations || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      SCHEDULED: 'bg-cyan-100 text-cyan-800',
      READY: 'bg-cyan-100 text-cyan-800',
      IN_PROGRESS: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-slate-100 text-slate-800',
      CANCELLED: 'bg-red-100 text-red-800',
      FAILED: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-slate-100'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Teleconsultations</h1>
        {user?.role !== 'ROLE_CITIZEN' && (
          <Link
            to="/teleconsultations/new"
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
          >
            New Request
          </Link>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {consultations.length === 0 ? (
            <li className="px-6 py-4 text-center text-sm text-slate-500">No teleconsultations found.</li>
          ) : (
            consultations.map((tc: any) => (
              <li key={tc.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-cyan-600 truncate">
                      Consultation #{tc.id.substring(0, 8)}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={getStatusBadge(tc.status)}>{tc.status}</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-500">
                        {tc.consultationType} • {tc.priority}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                      <p>
                        Created on {new Date(tc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/teleconsultations/${tc.id}`}
                      className="text-cyan-600 hover:text-cyan-900 text-sm font-medium"
                    >
                      Enter Room &rarr;
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

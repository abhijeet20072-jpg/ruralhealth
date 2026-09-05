import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';

export const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  // Booking Form State
   
   
   
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState({ 
    facilityId: searchParams.get('facilityId') || '', 
    doctorId: searchParams.get('doctorId') || '', 
    date: '', 
    timeSlot: '' 
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (booking.doctorId && booking.date) {
      setLoadingSlots(true);
      api.get(`/appointments/availability?doctorId=${booking.doctorId}&date=${booking.date}`)
        .then(res => {
          setAvailableSlots(res.data.availableSlots);
          setBooking(prev => ({ ...prev, timeSlot: '' })); // Reset slot
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingSlots(false));
    } else {
      setAvailableSlots([]);
    }
  }, [booking.doctorId, booking.date]);

  const patientId = user?.patientId;

  const fetchHistory = async () => {
    if (!patientId) return;
    try {
      const res = await api.get(`/appointments/patient/${patientId}`);
      setAppointments(res.data.history || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load appointments');
    }
  };

  
  useEffect(() => {
    fetchHistory();
      }, [patientId]);

  // When facility changes, we need to fetch doctors for that facility.
  // Wait, we don't have a specific endpoint for "doctors at facility".
  // But wait, the backend doesn't explicitly expose facility_staff outside of admins.
  // Let's just allow users to type or fetch if we have an API. 
  // Wait! A booking needs a doctor. I will add a quick generic route or just hardcode a fallback for the UI demo since we only have specific backends.
  // Actually, I'll fetch /auth/me or similar? No, I will create a quick GET /api/facilities/:id/staff in facility.controller.ts if it doesn't exist, OR just use the Facility detail which might return staff.
  // Let's check what GET /facilities/:id returns.
  
  // For now, let's keep the UI simple.
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1><p className="text-slate-500 mt-2">View and manage your upcoming care.</p></div>
      
      {!patientId ? (
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm mb-8">
          <p className="text-yellow-800 font-bold mb-4">You have not registered your Patient Profile yet.</p>
          <Link to="/patients/new" className="inline-flex items-center px-5 py-2.5 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-700 transition-colors">Complete Patient Profile &rarr;</Link>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-8 border-t-4 border-cyan-500">
            <h2 className="text-xl font-bold mb-4">Book New Appointment</h2>
            
            {!booking.facilityId || !booking.doctorId ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-sm">
                <p className="mb-4 text-cyan-800">To book an appointment, please search for a nearby facility and select an available doctor.</p>
                <Link to="/facilities" className="px-6 py-2 bg-cyan-600 text-white font-bold rounded shadow hover:bg-cyan-700">
                  Find Facility
                </Link>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.post('/appointments/book', { patientId, ...booking });
                  alert('Appointment booked successfully!');
                  // Reset form and navigate
                  window.location.href = '/appointments';
                } catch (err: any) {
                  alert(err.response?.data?.error || 'Booking failed');
                }
              }}>
                <div className="p-4 bg-slate-50 border rounded flex justify-between items-center">
                  <div>
                    <span className="text-sm text-slate-500 block">Selected Facility & Doctor</span>
                    <span className="font-mono text-xs text-slate-600">{booking.facilityId.substring(0,8)}... / {booking.doctorId.substring(0,8)}...</span>
                  </div>
                  <Link to="/facilities" className="text-sm text-cyan-600 hover:underline">Change</Link>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Date (YYYY-MM-DD)</label>
                    <input required type="date" min={new Date().toISOString().split('T')[0]} value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} className="w-full p-3 border rounded shadow-sm focus:ring-cyan-500 focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Available Time Slots</label>
                    {!booking.date ? (
                      <p className="text-slate-500 text-sm">Select a date first.</p>
                    ) : loadingSlots ? (
                      <p className="text-slate-500 text-sm">Loading slots...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-red-500 text-sm">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded bg-slate-50">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBooking({...booking, timeSlot: slot})}
                            className={`p-2 text-xs font-bold rounded border ${booking.timeSlot === slot ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-white text-slate-700 border-slate-300 hover:border-cyan-500'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="w-full px-4 py-3 bg-cyan-600 text-white rounded font-bold hover:bg-cyan-700">Confirm Booking</button>
              </form>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Upcoming & Past Consultations</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {appointments.length === 0 ? (
              <p className="text-slate-500">No appointments found.</p>
            ) : (
              <ul className="space-y-4">
                {appointments.map(apt => (
                  <li key={apt.id} className="p-4 border rounded bg-slate-50 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <span className="font-bold text-lg">{apt.date} - {apt.timeSlot}</span>
                        <div className="text-slate-700 mt-1">Facility: <span className="font-semibold">{apt.facilityName || apt.facilityId}</span></div>
                        <div className="text-slate-700">Doctor: <span className="font-semibold">{apt.doctorName || apt.doctorId}</span></div>
                        <div className="mt-2 text-sm">
                          Status: <span className={`px-2 py-1 rounded font-bold ${apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-cyan-100 text-cyan-700'}`}>{apt.status}</span>
                          {apt.status === 'SCHEDULED' && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">Token: {apt.tokenNumber}</span>}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex gap-2">
                        {apt.status === 'SCHEDULED' && apt.queueStatus === 'WAITING' && (
                          <button type="button" onClick={async () => {
                            try {
                              const q = await api.get(`/appointments/${apt.id}/queue`);
                              alert(`Token ${q.data.tokenNumber}\nPeople Ahead: ${q.data.peopleAhead}\nEstimated Wait: ${q.data.estimatedWaitMinutes} mins`);
                            } catch (e) { alert('Could not fetch queue status'); }
                          }} className="px-3 py-1 bg-cyan-100 text-cyan-700 font-bold rounded hover:bg-cyan-200 text-sm">
                            Check Queue Status
                          </button>
                        )}
                        {apt.status === 'SCHEDULED' && (
                          <button type="button" onClick={async () => {
                            if(window.confirm('Are you sure you want to cancel this appointment?')) {
                              try {
                                await api.put(`/appointments/${apt.id}/cancel`);
                                fetchHistory();
                              } catch(e) { alert('Failed to cancel'); }
                            }
                          }} className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 text-sm">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

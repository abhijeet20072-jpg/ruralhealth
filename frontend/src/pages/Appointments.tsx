import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  // Booking Form State
   
   
   
  const [booking, setBooking] = useState({ facilityId: '', doctorId: '', date: '', timeSlot: '' });

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
      
      {!patientId ? (
        <div className="bg-yellow-50 p-6 rounded border border-yellow-200 mb-8">
          <p className="text-yellow-800 font-bold mb-4">You have not registered your Patient Profile yet.</p>
          <Link to="/patients/new" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Register ABHA / Profile Now</Link>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Book New Appointment</h2>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.post('/appointments/book', { patientId, ...booking });
                alert('Appointment booked successfully!');
                setBooking({ facilityId: '', doctorId: '', date: '', timeSlot: '' });
                fetchHistory();
              } catch (err: any) {
                alert(err.response?.data?.error || 'Booking failed');
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Facility ID</label>
                  <input required type="text" value={booking.facilityId} onChange={e => setBooking({...booking, facilityId: e.target.value})} className="w-full p-2 border rounded" placeholder="UUID of Facility" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Doctor ID</label>
                  <input required type="text" value={booking.doctorId} onChange={e => setBooking({...booking, doctorId: e.target.value})} className="w-full p-2 border rounded" placeholder="UUID of Doctor" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Date (YYYY-MM-DD)</label>
                  <input required type="date" value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Time Slot (HH:MM)</label>
                  <input required type="time" step="900" value={booking.timeSlot} onChange={e => setBooking({...booking, timeSlot: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">Book Appointment</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Upcoming & Past Consultations</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments found.</p>
            ) : (
              <ul className="space-y-4">
                {appointments.map(apt => (
                  <li key={apt.id} className="p-4 border rounded bg-gray-50">
                    <div className="flex justify-between">
                      <span className="font-bold">{apt.date} - {apt.timeSlot}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{apt.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Facility: {apt.facilityName}</p>
                      <p>Doctor: {apt.doctorName}</p>
                      <p>Token: {apt.tokenNumber}</p>
                      <p>Queue Status: {apt.queueStatus}</p>
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

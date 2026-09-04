import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  // Minimal static data for patient ID in this sandbox mock
  // In a real app, the patient profile is linked to the citizen's user account.
  // We'll simulate fetching history for a hardcoded/prompted patient ID for demonstration.
  const patientId = 'demo-patient-id'; // Ideally retrieved from citizen's linked ABHA/Patient profile

  useEffect(() => {
    // In actual implementation, we'd fetch the user's linked patient profile first
    // For this UI scaffolding, we are just mocking the view wrapper.
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Book New Appointment</h2>
        <p className="text-gray-500">To book an appointment, please search for a facility in the directory and select 'Book Consultation'.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Upcoming & Past Consultations</h2>
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
                  <p>Token: {apt.tokenNumber}</p>
                  <p>Queue Status: {apt.queueStatus}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

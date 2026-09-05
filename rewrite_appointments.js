const fs = require('fs');
const path = 'frontend/src/pages/Appointments.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldForm = `<div className="bg-white p-6 rounded-lg shadow mb-8">
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
          </div>`;

const newForm = `<div className="bg-white p-6 rounded-lg shadow mb-8 border-t-4 border-indigo-600">
            <h2 className="text-xl font-bold mb-4">Book New Appointment</h2>
            
            {!booking.facilityId || !booking.doctorId ? (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded text-center">
                <p className="mb-4 text-blue-800">To book an appointment, please search for a nearby facility and select an available doctor.</p>
                <Link to="/facilities" className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700">
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
                <div className="p-4 bg-gray-50 border rounded flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500 block">Selected Facility & Doctor</span>
                    <span className="font-mono text-xs text-gray-600">{booking.facilityId.substring(0,8)}... / {booking.doctorId.substring(0,8)}...</span>
                  </div>
                  <Link to="/facilities" className="text-sm text-indigo-600 hover:underline">Change</Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Date (YYYY-MM-DD)</label>
                    <input required type="date" min={new Date().toISOString().split('T')[0]} value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} className="w-full p-3 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Time Slot (HH:MM)</label>
                    <input required type="time" step="900" value={booking.timeSlot} onChange={e => setBooking({...booking, timeSlot: e.target.value})} className="w-full p-3 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
                <button type="submit" className="w-full px-4 py-3 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">Confirm Booking</button>
              </form>
            )}
          </div>`;

code = code.replace(oldForm, newForm);
fs.writeFileSync(path, code);

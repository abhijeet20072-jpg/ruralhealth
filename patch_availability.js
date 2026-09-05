const fs = require('fs');
const path = 'frontend/src/pages/Appointments.tsx';
let code = fs.readFileSync(path, 'utf8');

const stateFind = `  const [booking, setBooking] = useState({ 
    facilityId: searchParams.get('facilityId') || '', 
    doctorId: searchParams.get('doctorId') || '', 
    date: '', 
    timeSlot: '' 
  });`;

const stateReplace = `  const [booking, setBooking] = useState({ 
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
      api.get(\`/appointments/availability?doctorId=\${booking.doctorId}&date=\${booking.date}\`)
        .then(res => {
          setAvailableSlots(res.data.availableSlots);
          setBooking(prev => ({ ...prev, timeSlot: '' })); // Reset slot
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingSlots(false));
    } else {
      setAvailableSlots([]);
    }
  }, [booking.doctorId, booking.date]);`;

code = code.replace(stateFind, stateReplace);

const formFind = `<div>
                    <label className="block text-sm font-medium">Time Slot (HH:MM)</label>
                    <input required type="time" step="900" value={booking.timeSlot} onChange={e => setBooking({...booking, timeSlot: e.target.value})} className="w-full p-3 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>`;

const formReplace = `<div>
                    <label className="block text-sm font-medium mb-2">Available Time Slots</label>
                    {!booking.date ? (
                      <p className="text-gray-500 text-sm">Select a date first.</p>
                    ) : loadingSlots ? (
                      <p className="text-gray-500 text-sm">Loading slots...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-red-500 text-sm">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded bg-gray-50">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBooking({...booking, timeSlot: slot})}
                            className={\`p-2 text-xs font-bold rounded border \${booking.timeSlot === slot ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'}\`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>`;

code = code.replace(formFind, formReplace);

// We should also remove the grid-cols-2 for Date & TimeSlot so the time slot grid has full width.
code = code.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-4">', '<div className="space-y-4">');

fs.writeFileSync(path, code);

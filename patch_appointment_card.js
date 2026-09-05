const fs = require('fs');
const path = 'frontend/src/pages/Appointments.tsx';
let code = fs.readFileSync(path, 'utf8');

const ulStart = code.indexOf('<ul className="space-y-4">');
const ulEnd = code.indexOf('</ul>', ulStart) + 5;

if (ulStart > -1 && ulEnd > -1) {
  const newUl = `<ul className="space-y-4">
                {appointments.map(apt => (
                  <li key={apt.id} className="p-4 border rounded bg-gray-50 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <span className="font-bold text-lg">{apt.date} - {apt.timeSlot}</span>
                        <div className="text-gray-700 mt-1">Facility: <span className="font-semibold">{apt.facilityName || apt.facilityId}</span></div>
                        <div className="text-gray-700">Doctor: <span className="font-semibold">{apt.doctorName || apt.doctorId}</span></div>
                        <div className="mt-2 text-sm">
                          Status: <span className={\`px-2 py-1 rounded font-bold \${apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}\`}>{apt.status}</span>
                          {apt.status === 'SCHEDULED' && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">Token: {apt.tokenNumber}</span>}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex gap-2">
                        {apt.status === 'SCHEDULED' && apt.queueStatus === 'WAITING' && (
                          <button type="button" onClick={async () => {
                            try {
                              const q = await api.get(\`/appointments/\${apt.id}/queue\`);
                              alert(\`Token \${q.data.tokenNumber}\\nPeople Ahead: \${q.data.peopleAhead}\\nEstimated Wait: \${q.data.estimatedWaitMinutes} mins\`);
                            } catch (e) { alert('Could not fetch queue status'); }
                          }} className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded hover:bg-indigo-200 text-sm">
                            Check Queue Status
                          </button>
                        )}
                        {apt.status === 'SCHEDULED' && (
                          <button type="button" onClick={async () => {
                            if(window.confirm('Are you sure you want to cancel this appointment?')) {
                              try {
                                await api.put(\`/appointments/\${apt.id}/cancel\`);
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
              </ul>`;
  code = code.substring(0, ulStart) + newUl + code.substring(ulEnd);
  fs.writeFileSync(path, code);
  console.log("Patched list");
} else {
  console.log("Failed to find ul");
}

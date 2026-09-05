const fs = require('fs');
let path = 'frontend/src/pages/Triage.tsx';
let code = fs.readFileSync(path, 'utf8');

const stateFind = `const [assessment, setAssessment] = useState<any>(null);`;
const stateReplace = stateFind + `
  const [emergencyDeclared, setEmergencyDeclared] = useState(false);`;
if(!code.includes('emergencyDeclared')) code = code.replace(stateFind, stateReplace);

const uiFind = `<button onClick={() => navigate(\`/patients/\${id}\`)} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded hover:bg-indigo-700 transition">
              Return to Patient Profile
            </button>`;
const uiReplace = uiFind + `
            
            {assessment.result.urgencyLevel === 'EMERGENCY' && !emergencyDeclared && (
              <button onClick={async () => {
                if(window.confirm('Are you sure you want to declare a facility-wide emergency?')) {
                  try {
                    await api.post('/emergencies', { patientId: id, triageId: assessment.assessmentId, notes: 'Emergency declared from triage assessment' });
                    setEmergencyDeclared(true);
                    alert('Emergency case created and escalated!');
                  } catch(e) { alert('Failed to declare emergency.'); }
                }
              }} className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700 transition ml-4 animate-pulse">
                DECLARE EMERGENCY
              </button>
            )}
            
            {emergencyDeclared && (
              <span className="ml-4 font-bold text-red-600 border border-red-600 px-4 py-2 rounded">Emergency Escalated</span>
            )}`;

if(!code.includes('DECLARE EMERGENCY')) code = code.replace(uiFind, uiReplace);

fs.writeFileSync(path, code);

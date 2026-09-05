const fs = require('fs');
const path = 'frontend/src/pages/ConsultationWorkspace.tsx';
let code = fs.readFileSync(path, 'utf8');

if(!code.includes('useConnectivity')) {
  code = code.replace("import { useAuth } from '../context/AuthContext';", "import { useAuth } from '../context/AuthContext';\nimport { useConnectivity } from '../context/ConnectivityContext';");
  code = code.replace("const { user } = useAuth();", "const { user } = useAuth();\n  const { isOnline, enqueueOperation } = useConnectivity();");
}

const payloadFind = `await api.post('/consultation/complete', {
        appointmentId,
        patientId: appointment.patientId,
        facilityId: user?.facilityId,
        complaint,
        observations,
        diagnosis,
        investigations,
        followUp,
        prescription: validPrescriptions.length > 0 ? validPrescriptions : undefined
      });

      alert('Consultation completed successfully. EHR has been updated.');`;

const payloadReplace = `const payload = {
        appointmentId,
        patientId: appointment.patientId,
        facilityId: user?.facilityId,
        complaint,
        observations,
        diagnosis,
        investigations,
        followUp,
        prescription: validPrescriptions.length > 0 ? validPrescriptions : undefined
      };

      if (isOnline) {
        await api.post('/consultation/complete', payload);
        alert('Consultation completed successfully. EHR has been updated.');
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'COMPLETE_CONSULTATION',
          payload,
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Consultation saved locally and queued for sync.');
      }`;

code = code.replace(payloadFind, payloadReplace);

// Also render a small offline warning next to the submit button
const buttonFind = `</button>
          </div>
        </form>`;
const buttonReplace = `</button>
          </div>
          {!isOnline && (
            <p className="mt-4 text-yellow-600 font-bold text-sm text-right">
              You are offline. Submission will be queued securely.
            </p>
          )}
        </form>`;
code = code.replace(buttonFind, buttonReplace);

fs.writeFileSync(path, code);

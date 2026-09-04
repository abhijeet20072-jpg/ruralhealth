const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/TeleconsultationRoom.tsx', 'utf8');

if (!code.includes('useConnectivity')) {
  code = code.replace(
    'import { useAuth } from \'../context/AuthContext\';',
    `import { useAuth } from '../context/AuthContext';\nimport { useConnectivity } from '../context/ConnectivityContext';`
  );

  code = code.replace(
    'const { user } = useAuth();',
    `const { user } = useAuth();\n  const { isOnline, enqueueOperation } = useConnectivity();`
  );

  code = code.replace(
    /const setupWebRTC = async \(\) => {/,
    `const setupWebRTC = async () => {\n    if (!isOnline) {\n      alert('Cannot initiate live WebRTC while offline. Please use Store-and-Forward clinical notes below.');\n      return;\n    }`
  );

  code = code.replace(
    /await api\.put\(\`\/api\/teleconsultations\/\$\{id\}\/status\`, {[\s\S]*?}\);/m,
    `if (isOnline) {
        await api.put(\`/api/teleconsultations/\${id}/status\`, { 
          status: 'COMPLETED',
          clinicalNotes: notes
        });
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'UPDATE_TELECONSULTATION_STATUS',
          payload: { tcId: id, status: 'COMPLETED', clinicalNotes: notes },
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Clinical notes saved locally for async sync.');
      }`
  );

  // Safely write code
  code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync('frontend/src/pages/TeleconsultationRoom.tsx', code);
}

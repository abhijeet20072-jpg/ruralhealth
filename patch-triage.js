const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Triage.tsx', 'utf8');

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
    /await api\.post\('\/api\/triage', payload\);[\s\S]*?alert\('Triage assessment submitted'\);/m,
    `if (isOnline) {
        await api.post('/api/triage', payload);
        alert('Triage assessment submitted');
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'CREATE_TRIAGE',
          payload: { patientId: id, ...payload },
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Triage assessment saved locally and queued for sync');
      }`
  );
  
  fs.writeFileSync('frontend/src/pages/Triage.tsx', code);
}

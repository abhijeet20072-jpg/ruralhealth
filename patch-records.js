const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/MedicalRecords.tsx', 'utf8');

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
    /await api\.post\(`\/api\/patients\/\${id}\/records`, payload\);[\s\S]*?fetchRecords\(\);/m,
    `if (isOnline) {
        await api.post(\`/api/patients/\${id}/records\`, payload);
        alert('Record added successfully');
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'CREATE_MEDICAL_RECORD',
          payload: { patientId: id, ...payload },
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Clinical draft saved locally and queued for sync');
      }
      fetchRecords();`
  );
  
  fs.writeFileSync('frontend/src/pages/MedicalRecords.tsx', code);
}

const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Triage.tsx', 'utf8');

if (!code.includes('useConnectivity')) {
  code = code.replace(
    'import { useAuth } from \'../context/AuthContext\';',
    `import { useAuth } from '../context/AuthContext';\nimport { useConnectivity } from '../context/ConnectivityContext';`
  );
  
  code = code.replace(
    'const { id: patientId } = useParams<{ id: string }>();',
    `const { id: patientId } = useParams<{ id: string }>();\n  const { isOnline, enqueueOperation } = useConnectivity();`
  );

  code = code.replace(
    /const res = await api\.post\('\/triage\/assess', payload\);\n      setResult\(res\.data\);/,
    `if (isOnline) {
        const res = await api.post('/triage/assess', payload);
        setResult(res.data);
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'CREATE_TRIAGE',
          payload: { patientId, ...payload },
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Triage assessment saved locally and queued for remote CDSS sync');
      }`
  );
  
  fs.writeFileSync('frontend/src/pages/Triage.tsx', code);
}

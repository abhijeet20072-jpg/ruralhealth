const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/MedicalRecords.tsx', 'utf8');

code = code.replace(
  /await api\.post\('\/records', \{\s*patientId: id,\s*facilityId,\s*recordType,\s*notes\s*\}\);/,
  `if (isOnline) {
        await api.post('/records', { patientId: id, facilityId, recordType, notes });
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'CREATE_MEDICAL_RECORD',
          payload: { patientId: id, recordType, notes },
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Record saved locally and queued for sync');
      }`
);

fs.writeFileSync('frontend/src/pages/MedicalRecords.tsx', code);

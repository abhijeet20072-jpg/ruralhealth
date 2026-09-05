const fs = require('fs');
const path = require('path');

const applyPatch = (file, patch) => {
  let content = fs.readFileSync(file, 'utf8');
  // First inject the import if not present
  if (!content.includes('hasLegitimateCareRelationship')) {
    content = content.replace("import { db } from './db';", "import { db } from './db';\nimport { hasLegitimateCareRelationship } from './auth.utils';");
  }

  // Find the role citizen check and replace it with the unified check
  content = content.replace(patch.target, patch.replacement);
  fs.writeFileSync(file, content);
};

// 1. patch record.controller.ts
applyPatch(path.join(__dirname, 'backend', 'src', 'record.controller.ts'), {
  target: `    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to view this timeline' });
        return;
      }
    }`,
  replacement: `    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to view this timeline' });
        return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship with this patient at your facility' });
        return;
      }
    }`
});

// 2. patch triage.controller.ts
applyPatch(path.join(__dirname, 'backend', 'src', 'triage.controller.ts'), {
  target: `    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to access this triage data' });
        return;
      }
    }`,
  replacement: `    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to access this triage data' });
        return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship with this patient at your facility' });
        return;
      }
    }`
});

// 3. patch appointment.controller.ts (getPatientHistory)
applyPatch(path.join(__dirname, 'backend', 'src', 'appointment.controller.ts'), {
  target: `    if (req.user.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to access this patient history' });
        return;
      }
    }`,
  replacement: `    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to access this patient history' });
        return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship with this patient at your facility' });
        return;
      }
    }`
});


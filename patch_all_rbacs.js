const fs = require('fs');
const path = require('path');

const patchFile = (filename, targetRegexStr, replacement) => {
  const file = path.join(__dirname, 'backend', 'src', filename);
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('hasLegitimateCareRelationship')) {
    content = content.replace("import { db } from './db';", "import { db } from './db';\nimport { hasLegitimateCareRelationship } from './auth.utils';");
  }
  
  const regex = new RegExp(targetRegexStr);
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Patched', filename);
};

// diagnostic.controller.ts (getPatientOrders)
patchFile('diagnostic.controller.ts',
  `    if \\(req\\.user!\\.role === 'ROLE_CITIZEN'\\) \\{\\s*const p = db\\.prepare\\('SELECT id FROM patients WHERE userId = \\?'\\)\\.get\\(req\\.user!\\.id\\);\\s*if \\(!p \\|\\| \\(p as any\\)\\.id !== patientId\\) \\{\\s*res\\.status\\(403\\)\\.json\\(\\{ error: 'Unauthorized' \\}\\); return;\\s*\\}\\s*\\}`,
  `    if (req.user!.role === 'ROLE_CITIZEN') {
       const p: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
       if (!p || p.id !== patientId) {
         res.status(403).json({ error: 'Unauthorized' }); return;
       }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }`
);

// medicine.controller.ts (getPatientMedicines)
patchFile('medicine.controller.ts',
  `    if \\(req\\.user!\\.role === 'ROLE_CITIZEN'\\) \\{\\s*const p = db\\.prepare\\('SELECT id FROM patients WHERE userId = \\?'\\)\\.get\\(req\\.user!\\.id\\);\\s*if \\(!p \\|\\| \\(p as any\\)\\.id !== patientId\\) \\{\\s*res\\.status\\(403\\)\\.json\\(\\{ error: 'Unauthorized' \\}\\); return;\\s*\\}\\s*\\}`,
  `    if (req.user!.role === 'ROLE_CITIZEN') {
       const p: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
       if (!p || p.id !== patientId) {
         res.status(403).json({ error: 'Unauthorized' }); return;
       }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }`
);

// care_management.controller.ts (getPatientCarePlans)
patchFile('care_management.controller.ts',
  `    if \\(req\\.user!\\.role === 'ROLE_CITIZEN'\\) \\{\\s*const citizenRecord = db\\.prepare\\('SELECT id FROM patients WHERE userId = \\?'\\)\\.get\\(req\\.user!\\.id\\) as any;\\s*if \\(!citizenRecord \\|\\| citizenRecord\\.id !== patientId\\) \\{\\s*res\\.status\\(403\\)\\.json\\(\\{ error: 'Unauthorized to view these care plans' \\}\\); return;\\s*\\}\\s*\\}`,
  `    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenRecord || citizenRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to view these care plans' }); return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }`
);

// referral.controller.ts (getPatientReferrals)
patchFile('referral.controller.ts',
  `    if \\(req\\.user!\\.role === 'ROLE_CITIZEN'\\) \\{\\s*const citizenPatientRecord = db\\.prepare\\('SELECT id FROM patients WHERE userId = \\?'\\)\\.get\\(userId\\);\\s*if \\(!citizenPatientRecord \\|\\| citizenPatientRecord\\.id !== patientId\\) \\{\\s*res\\.status\\(403\\)\\.json\\(\\{ error: 'Unauthorized to view these referrals' \\}\\);\\s*return;\\s*\\}\\s*\\}`,
  `    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(userId);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to view these referrals' }); return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }`
);

// emergency.controller.ts (getPatientEmergencies)
patchFile('emergency.controller.ts',
  `    if \\(req\\.user!\\.role === 'ROLE_CITIZEN'\\) \\{\\s*const citizenPatientRecord = db\\.prepare\\('SELECT id FROM patients WHERE userId = \\?'\\)\\.get\\(req\\.user!\\.id\\) as any;\\s*if \\(!citizenPatientRecord \\|\\| citizenPatientRecord\\.id !== patientId\\) \\{\\s*res\\.status\\(403\\)\\.json\\(\\{ error: 'Unauthorized to access this patient history' \\}\\);\\s*return;\\s*\\}\\s*\\}`,
  `    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to access this patient history' }); return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }`
);


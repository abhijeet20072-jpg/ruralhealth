const fs = require('fs');

// Patch record.routes.ts
let record = fs.readFileSync('backend/src/record.routes.ts', 'utf8');
record = record.replace("authorizeRoles(...clinicalStaff), getPatientTimeline", "getPatientTimeline"); 
fs.writeFileSync('backend/src/record.routes.ts', record);

// Patch appointment.routes.ts
let appt = fs.readFileSync('backend/src/appointment.routes.ts', 'utf8');
appt = appt.replace("router.get('/patient/:patientId', authenticate, authorizeRoles('ROLE_CITIZEN', ...clinicalStaff), getPatientHistory);", "router.get('/patient/:patientId', authenticate, getPatientHistory);");
if (appt.indexOf("authorizeRoles('ROLE_CITIZEN'") === -1) {
    appt = appt.replace("router.get('/patient/:patientId', authenticate, authorizeRoles(...clinicalStaff), getPatientHistory);", "router.get('/patient/:patientId', authenticate, getPatientHistory);");
}
fs.writeFileSync('backend/src/appointment.routes.ts', appt);

// Patch triage.routes.ts
let triage = fs.readFileSync('backend/src/triage.routes.ts', 'utf8');
triage = triage.replace("router.get('/patient/:patientId', authenticate, authorizeRoles(...clinicalStaff), getPatientAssessments);", "router.get('/patient/:patientId', authenticate, getPatientAssessments);");
fs.writeFileSync('backend/src/triage.routes.ts', triage);

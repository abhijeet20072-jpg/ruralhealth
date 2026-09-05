const fs = require('fs');

const authStr = "authorizeRoles('ROLE_CITIZEN', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST')";

// Patch record.routes.ts
let record = fs.readFileSync('backend/src/record.routes.ts', 'utf8');
record = record.replace("authenticate, getPatientTimeline", `authenticate, ${authStr}, getPatientTimeline`); 
fs.writeFileSync('backend/src/record.routes.ts', record);

// Patch appointment.routes.ts
let appt = fs.readFileSync('backend/src/appointment.routes.ts', 'utf8');
appt = appt.replace("authenticate, getPatientHistory", `authenticate, ${authStr}, getPatientHistory`);
fs.writeFileSync('backend/src/appointment.routes.ts', appt);

// Patch triage.routes.ts
let triage = fs.readFileSync('backend/src/triage.routes.ts', 'utf8');
triage = triage.replace("authenticate, getPatientAssessments", `authenticate, ${authStr}, getPatientAssessments`);
fs.writeFileSync('backend/src/triage.routes.ts', triage);

console.log("Fixed routes");

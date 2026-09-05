const fs = require('fs');
const path = 'frontend/src/services/db.ts';
let code = fs.readFileSync(path, 'utf8');

const typeFind = `'CREATE_TRIAGE' | 'CREATE_MEDICAL_RECORD' | 'UPDATE_APPOINTMENT_STATUS' | 'CREATE_REFERRAL' | 'UPDATE_TELECONSULTATION_STATUS'`;
const typeReplace = `'CREATE_TRIAGE' | 'CREATE_MEDICAL_RECORD' | 'UPDATE_APPOINTMENT_STATUS' | 'CREATE_REFERRAL' | 'UPDATE_TELECONSULTATION_STATUS' | 'COMPLETE_CONSULTATION'`;

code = code.replace(typeFind, typeReplace);
fs.writeFileSync(path, code);

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'docs', 'FULL_SYSTEM_AUDIT.md');
let content = fs.readFileSync(file, 'utf8');

const target = `### [RBAC-01] Universal Patient Access for Clinical Staff`;
const replacement = `### [RBAC-01] Universal Patient Access for Clinical Staff (✅ FIXED)
* **Status**: FIXED
* **Fix Implementation**: Server-side cross-facility isolation added across patient record endpoints (\`getPatientTimeline\`, \`getPatientHistory\`, \`getPatientAssessments\`). Clinical staff without a legitimate active care relationship (e.g. Appointment, Record, Referral, Emergency, Triage, Care Plan) are blocked with \`403 Forbidden\`. Valid access pathways via referrals and emergencies are fully preserved. District Admin operations remain unrestricted as per existing policy.`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);

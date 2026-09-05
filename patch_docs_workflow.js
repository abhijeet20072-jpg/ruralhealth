const fs = require('fs');
const path = require('path');

// 1. FULL_SYSTEM_AUDIT.md
const auditFile = path.join(__dirname, 'docs', 'FULL_SYSTEM_AUDIT.md');
let auditContent = fs.readFileSync(auditFile, 'utf8');

const targetAudit = `### [UX-01] Citizen Registration & Patient Profile Disconnect
* **Status**: CONFIRMED
* **Description**: When citizens register, they do not automatically get a patient profile. When they navigate to "My Appointments", they are prompted to "Register ABHA / Profile Now". However, this button redirects to \`/patients/new\`, which is blocked for citizens by a frontend \`RoleRoute\` expecting staff roles, throwing an "Access Restricted" error.
* **Risk**: Broken primary user journey. Citizens cannot use any healthcare features.`;

const replacementAudit = `### [UX-01] Citizen Registration & Patient Profile Disconnect (✅ FIXED)
* **Status**: FIXED
* **Description**: When citizens register, they do not automatically get a patient profile. When they navigate to "My Appointments", they are prompted to "Complete Patient Profile". They can now successfully create their own profile.
* **Fix Implementation**: Frontend routes for profile creation (\`/patients/new\`) were unlocked for authenticated citizens. The backend enforces strict ownership (forcing the patient's \`userId\` to the authenticated citizen's ID) and prevents creating multiple profiles (409 Conflict). Staff creation workflows remain unchanged.`;

auditContent = auditContent.replace(targetAudit, replacementAudit);
fs.writeFileSync(auditFile, auditContent);

// 2. PROJECT_STATE.md
const stateFile = path.join(__dirname, 'docs', 'PROJECT_STATE.md');
let stateContent = fs.readFileSync(stateFile, 'utf8');

stateContent = stateContent.replace(
  "**Status:** CRITICAL IDOR-01 & HIGH RBAC-01 FIXED (Development Paused for Remaining Audit Findings)",
  "**Status:** CRITICAL IDOR-01, HIGH RBAC-01 & UX-01 FIXED (Development Paused for Remaining Audit Findings)"
);
stateContent = stateContent.replace(
  "* **UX/ROUTING**: Missing frontend navigation guards for incomplete Patient Profiles. The \"Register ABHA\" link is blocked by staff-only route guards, preventing Citizens from actually creating their profiles.",
  "* **UX/ROUTING**: ✅ FIXED - Citizens can now complete their patient profile securely. The frontend allows access, and the backend guarantees ownership linkage and prevents duplicates."
);

fs.writeFileSync(stateFile, stateContent);

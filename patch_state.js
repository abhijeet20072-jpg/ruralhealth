const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'docs', 'PROJECT_STATE.md');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "**Status:** CRITICAL IDOR-01 FIXED (Development Paused for Remaining Audit Findings)",
  "**Status:** CRITICAL IDOR-01 & HIGH RBAC-01 FIXED (Development Paused for Remaining Audit Findings)"
);

content = content.replace(
  "* **HIGH POLICY/ARCHITECTURE**: Doctors are currently allowed unrestricted view access to any patient's EHR and triage history globally (`// Cross-facility lookup intentionally supported`). This lacks explicit patient consent or break-glass auditing.",
  "* **HIGH POLICY/ARCHITECTURE**: ✅ FIXED - Doctors are strictly restricted to patients with whom they have an active care relationship (appointments, referrals, emergencies, etc)."
);

fs.writeFileSync(file, content);

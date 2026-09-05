const fs = require('fs');
const path = require('path');

const statePath = path.join(__dirname, 'docs', 'PROJECT_STATE.md');
let stateContent = fs.readFileSync(statePath, 'utf8');

const uiStateUpdate = `
### UI/UX Phase 1: Global Design & Citizen Experience (COMPLETE)
* Established global design system utilizing a modern, professional, trust-inspiring aesthetic (Navy/Slate foundation with Teal/Cyan healthcare accents).
* Implemented Arogya Connect branding universally. Removed outdated references, placeholders, and misleading ABHA integration text.
* Overhauled the Citizen Dashboard to include personalized routing cards: 'My Appointments', 'Health Information', and 'Discover Care'.
* Cleaned the Citizen Profile flow and emphasized completion requirements for booking.
* Updated standard list views (Appointments, Referrals, Diagnostics, Medicines, Teleconsultation) with clean layouts and robust typography.
* Integrated responsive, mobile-friendly navigation (Hamburger menu overlay on smaller screens).
* Tests status: 171/171 backend tests passed, frontend builds cleanly.
`;

// Append to the document
stateContent = stateContent + "\n" + uiStateUpdate;

fs.writeFileSync(statePath, stateContent);

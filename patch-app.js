const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.tsx', 'utf8');

if (!code.includes('TeleconsultationsList')) {
  code = code.replace(
    'import MedicalRecords from "./pages/MedicalRecords";',
    'import MedicalRecords from "./pages/MedicalRecords";\nimport TeleconsultationsList from "./pages/TeleconsultationsList";\nimport TeleconsultationRoom from "./pages/TeleconsultationRoom";'
  );
  
  code = code.replace(
    '<Route path="/referrals" element={<ReferralDashboard />} />',
    '<Route path="/referrals" element={<ReferralDashboard />} />\n                <Route path="/teleconsultations" element={<TeleconsultationsList />} />\n                <Route path="/teleconsultations/:id" element={<TeleconsultationRoom />} />'
  );

  fs.writeFileSync('frontend/src/App.tsx', code);
}

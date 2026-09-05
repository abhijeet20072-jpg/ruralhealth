const fs = require('fs');
let path = 'backend/src/db.ts';
let code = fs.readFileSync(path, 'utf8');

const newTable = `
  CREATE TABLE IF NOT EXISTS care_plans (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    assignedClinicianId TEXT,
    condition TEXT NOT NULL,
    riskLevel TEXT NOT NULL DEFAULT 'LOW',
    goals TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    dischargedAt DATETIME,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedClinicianId) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_care_plans_patient ON care_plans(patientId);
  CREATE INDEX IF NOT EXISTS idx_care_plans_facility ON care_plans(facilityId);
`;

const insertIndex = code.indexOf("CREATE TABLE IF NOT EXISTS triage_assessments");
code = code.substring(0, insertIndex) + newTable + code.substring(insertIndex);

fs.writeFileSync(path, code);

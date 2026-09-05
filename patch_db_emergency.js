const fs = require('fs');
const path = 'backend/src/db.ts';
let code = fs.readFileSync(path, 'utf8');

const newTables = `
  CREATE TABLE IF NOT EXISTS emergency_cases (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    triageId TEXT,
    referralId TEXT,
    status TEXT NOT NULL DEFAULT 'DETECTED',
    detectedByUserId TEXT NOT NULL,
    acknowledgedByUserId TEXT,
    resolvedByUserId TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolvedAt DATETIME,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (triageId) REFERENCES triage(id) ON DELETE SET NULL,
    FOREIGN KEY (referralId) REFERENCES referrals(id) ON DELETE SET NULL,
    FOREIGN KEY (detectedByUserId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (acknowledgedByUserId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolvedByUserId) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_emergency_patient ON emergency_cases(patientId);
  CREATE INDEX IF NOT EXISTS idx_emergency_facility ON emergency_cases(facilityId);
  CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_cases(status);
`;

const insertIndex = code.indexOf("CREATE TABLE IF NOT EXISTS notifications");
code = code.substring(0, insertIndex) + newTables + code.substring(insertIndex);

fs.writeFileSync(path, code);

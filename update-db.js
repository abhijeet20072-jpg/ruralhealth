const fs = require('fs');
let code = fs.readFileSync('backend/src/db.ts', 'utf8');

const tableDef = `
  CREATE TABLE IF NOT EXISTS teleconsultations (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    doctorId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    appointmentId TEXT,
    status TEXT NOT NULL DEFAULT 'REQUESTED',
    consultationType TEXT NOT NULL DEFAULT 'LIVE',
    scheduledAt DATETIME,
    startedAt DATETIME,
    endedAt DATETIME,
    reason TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'ROUTINE',
    clinicalNotes TEXT,
    consentGranted BOOLEAN DEFAULT 0,
    cancellationReason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL
  );
`;

if (!code.includes('CREATE TABLE IF NOT EXISTS teleconsultations')) {
  code = code.replace(');', `);\n${tableDef}`);
  fs.writeFileSync('backend/src/db.ts', code);
}

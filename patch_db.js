const fs = require('fs');
const path = 'backend/src/db.ts';
let code = fs.readFileSync(path, 'utf8');

const newTables = `
  CREATE TABLE IF NOT EXISTS diagnostic_catalog (
    id TEXT PRIMARY KEY,
    testCode TEXT UNIQUE NOT NULL,
    testName TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    referenceRange TEXT,
    unit TEXT
  );

  CREATE TABLE IF NOT EXISTS facility_diagnostics (
    facilityId TEXT NOT NULL,
    testCode TEXT NOT NULL,
    isAvailable BOOLEAN DEFAULT 1,
    PRIMARY KEY (facilityId, testCode),
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (testCode) REFERENCES diagnostic_catalog(testCode) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS diagnostic_orders (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    orderingDoctorId TEXT NOT NULL,
    referringFacilityId TEXT NOT NULL,
    diagnosticFacilityId TEXT NOT NULL,
    testCode TEXT NOT NULL,
    clinicalReason TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'ROUTINE',
    status TEXT NOT NULL DEFAULT 'ORDERED',
    appointmentId TEXT,
    resultValue TEXT,
    resultQualitative TEXT,
    resultInterpretation TEXT,
    resultRecordedBy TEXT,
    resultRecordedAt DATETIME,
    resultVerifiedAt DATETIME,
    doctorReviewedAt DATETIME,
    cancellationReason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (orderingDoctorId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referringFacilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (diagnosticFacilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (testCode) REFERENCES diagnostic_catalog(testCode) ON DELETE RESTRICT,
    FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (resultRecordedBy) REFERENCES users(id) ON DELETE SET NULL
  );
`;

const insertIndex = code.indexOf("CREATE TABLE IF NOT EXISTS teleconsultations");
code = code.substring(0, insertIndex) + newTables + code.substring(insertIndex);

// Seed diagnostic catalog
const seedDiagnostics = `
// Seed Diagnostic Catalog
const catalogCount = db.prepare('SELECT count(*) as count FROM diagnostic_catalog').get().count;
if (catalogCount === 0) {
  const tests = [
    { code: 'CBC', name: 'Complete Blood Count', cat: 'HEMATOLOGY', desc: 'Evaluates overall health and detects a wide range of disorders.', unit: '', range: '' },
    { code: 'GLU_FAST', name: 'Blood Glucose (Fasting)', cat: 'BIOCHEMISTRY', desc: 'Measures blood sugar after fasting.', unit: 'mg/dL', range: '70-99' },
    { code: 'HBA1C', name: 'HbA1c', cat: 'BIOCHEMISTRY', desc: 'Average blood sugar over past 3 months.', unit: '%', range: '< 5.7' },
    { code: 'LIPID', name: 'Lipid Profile', cat: 'BIOCHEMISTRY', desc: 'Cholesterol and triglycerides.', unit: 'mg/dL', range: '' },
    { code: 'URINE_R_M', name: 'Urinalysis (R/M)', cat: 'CLINICAL_PATHOLOGY', desc: 'Routine and microscopic examination of urine.', unit: '', range: '' },
    { code: 'XRAY_CHEST', name: 'X-Ray Chest PA View', cat: 'IMAGING', desc: 'Chest X-Ray', unit: '', range: '' },
    { code: 'ECG', name: 'Electrocardiogram', cat: 'CARDIOLOGY', desc: 'Records the electrical signal from the heart.', unit: '', range: '' }
  ];
  const stmt = db.prepare('INSERT INTO diagnostic_catalog (id, testCode, testName, category, description, unit, referenceRange) VALUES (?, ?, ?, ?, ?, ?, ?)');
  tests.forEach(t => stmt.run(crypto.randomUUID(), t.code, t.name, t.cat, t.desc, t.unit, t.range));
}
`;
if (!code.includes('import crypto')) {
  code = "import crypto from 'crypto';\n" + code;
}
code = code + "\n" + seedDiagnostics;

fs.writeFileSync(path, code);

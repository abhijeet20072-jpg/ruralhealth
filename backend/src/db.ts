import crypto from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'test' 
  ? path.resolve(__dirname, '../test.db')
  : path.resolve(__dirname, '../dev.db');

  

export const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ROLE_CITIZEN',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    operatingHours TEXT,
    emergencyAvailability BOOLEAN DEFAULT 0,
    services TEXT,
    diagnosticsAvailable BOOLEAN DEFAULT 0,
    medicineStatus TEXT DEFAULT 'UNKNOWN',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS facility_staff (
    facilityId TEXT NOT NULL,
    userId TEXT NOT NULL,
    PRIMARY KEY (facilityId, userId),
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE,
    abhaId TEXT UNIQUE,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    dateOfBirth DATE NOT NULL,
    gender TEXT NOT NULL,
    phoneNumber TEXT,
    address TEXT,
    emergencyContactName TEXT,
    emergencyContactPhone TEXT,
    bloodGroup TEXT,
    allergies TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS processed_operations (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    entityType TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    action TEXT NOT NULL,
    resourceId TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    doctorId TEXT NOT NULL,
    date DATE NOT NULL,
    timeSlot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED', 
    queueStatus TEXT NOT NULL DEFAULT 'WAITING',
    tokenNumber INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_doc_slot 
  ON appointments(doctorId, date, timeSlot) WHERE status != 'CANCELLED';

  CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_patient_date 
  ON appointments(patientId, date) WHERE status != 'CANCELLED';

  
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
CREATE TABLE IF NOT EXISTS triage_assessments (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    assessedBy TEXT NOT NULL,
    vitals TEXT,
    symptoms TEXT,
    riskFactors TEXT,
    urgencyLevel TEXT NOT NULL,
    recommendedAction TEXT NOT NULL,
    referralNeeded BOOLEAN DEFAULT 0,
    disclaimer TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (assessedBy) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    doctorId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    recordType TEXT NOT NULL,
    notes TEXT NOT NULL,
    data TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    referringFacilityId TEXT NOT NULL,
    receivingFacilityId TEXT NOT NULL,
    referringDoctorId TEXT NOT NULL,
    reason TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CREATED',
    supportingInfo TEXT,
    appointmentId TEXT,
    followUpNotes TEXT,
    dueDate DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (referringFacilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (receivingFacilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (referringDoctorId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL
  );
`);
db.exec(`
  
  
  
  
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
    FOREIGN KEY (triageId) REFERENCES triage_assessments(id) ON DELETE SET NULL,
    FOREIGN KEY (referralId) REFERENCES referrals(id) ON DELETE SET NULL,
    FOREIGN KEY (detectedByUserId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (acknowledgedByUserId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolvedByUserId) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_emergency_patient ON emergency_cases(patientId);
  CREATE INDEX IF NOT EXISTS idx_emergency_facility ON emergency_cases(facilityId);
  CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_cases(status);
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipientUserId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    relatedEntityType TEXT,
    relatedEntityId TEXT,
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    readAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipientUserId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS follow_ups (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    createdByUserId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    relatedEntityType TEXT,
    relatedEntityId TEXT,
    reason TEXT NOT NULL,
    dueDate DATETIME NOT NULL,
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    status TEXT NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    completedAt DATETIME,
    completedByUserId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (createdByUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (completedByUserId) REFERENCES users(id) ON DELETE SET NULL
  );
  
  CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipientUserId);
  CREATE INDEX IF NOT EXISTS idx_followups_patient ON follow_ups(patientId);
  CREATE INDEX IF NOT EXISTS idx_followups_facility ON follow_ups(facilityId);
  CREATE INDEX IF NOT EXISTS idx_followups_status ON follow_ups(status);
CREATE TABLE IF NOT EXISTS medicine_catalog (
    id TEXT PRIMARY KEY,
    medicineId TEXT UNIQUE NOT NULL,
    genericName TEXT NOT NULL,
    displayName TEXT NOT NULL,
    dosageForm TEXT NOT NULL,
    strength TEXT NOT NULL,
    category TEXT,
    isActive BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS facility_inventory (
    facilityId TEXT NOT NULL,
    medicineId TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    threshold INTEGER NOT NULL DEFAULT 0 CHECK (threshold >= 0),
    unit TEXT NOT NULL DEFAULT 'units',
    status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (facilityId, medicineId),
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (medicineId) REFERENCES medicine_catalog(medicineId) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS inventory_audit_logs (
    id TEXT PRIMARY KEY,
    facilityId TEXT NOT NULL,
    medicineId TEXT NOT NULL,
    oldQuantity INTEGER NOT NULL,
    newQuantity INTEGER NOT NULL,
    actorId TEXT NOT NULL,
    operationType TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (medicineId) REFERENCES medicine_catalog(medicineId) ON DELETE CASCADE,
    FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE CASCADE
  );
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
`);


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


// Seed Medicine Catalog
const medCount = db.prepare('SELECT count(*) as count FROM medicine_catalog').get().count;
if (medCount === 0) {
  const meds = [
    { code: 'MED_PARA_500', generic: 'Paracetamol', display: 'Paracetamol 500mg', form: 'Tablet', strength: '500mg', category: 'Analgesic' },
    { code: 'MED_AMOX_500', generic: 'Amoxicillin', display: 'Amoxicillin 500mg', form: 'Capsule', strength: '500mg', category: 'Antibiotic' },
    { code: 'MED_ORS', generic: 'Oral Rehydration Salts', display: 'ORS Sachet', form: 'Powder', strength: '21.8g', category: 'Electrolytes' },
    { code: 'MED_METF_500', generic: 'Metformin', display: 'Metformin 500mg', form: 'Tablet', strength: '500mg', category: 'Antidiabetic' },
    { code: 'MED_AMLO_5', generic: 'Amlodipine', display: 'Amlodipine 5mg', form: 'Tablet', strength: '5mg', category: 'Antihypertensive' },
    { code: 'MED_IFA', generic: 'Iron and Folic Acid', display: 'IFA Tablet', form: 'Tablet', strength: '100mg/500mcg', category: 'Supplement' }
  ];
  const stmt = db.prepare('INSERT INTO medicine_catalog (id, medicineId, genericName, displayName, dosageForm, strength, category) VALUES (?, ?, ?, ?, ?, ?, ?)');
  meds.forEach(m => stmt.run(crypto.randomUUID(), m.code, m.generic, m.display, m.form, m.strength, m.category));
}

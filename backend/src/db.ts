import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'test' 
  ? path.resolve(__dirname, '../test.db')
  : path.resolve(__dirname, '../dev.db');

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
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
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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

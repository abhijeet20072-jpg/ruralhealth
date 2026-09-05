const fs = require('fs');
const path = 'backend/src/db.ts';
let code = fs.readFileSync(path, 'utf8');

const newTables = `
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
`;

const insertIndex = code.indexOf("CREATE TABLE IF NOT EXISTS diagnostic_catalog");
code = code.substring(0, insertIndex) + newTables + code.substring(insertIndex);

const seedMedicines = `
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
`;

code = code + "\n" + seedMedicines;

fs.writeFileSync(path, code);

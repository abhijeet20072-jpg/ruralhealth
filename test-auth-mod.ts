import { db } from './backend/src/db';

try {
  // Let's check if userId is in patients
  const patientCols = db.prepare('PRAGMA table_info(patients)').all();
  console.log(patientCols);
} catch (e) {
  console.error(e);
}

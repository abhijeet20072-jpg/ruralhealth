import { db } from './db';

export function hasLegitimateCareRelationship(patientId: string, facilityId: string): boolean {
  // Check appointments
  if (db.prepare('SELECT 1 FROM appointments WHERE patientId = ? AND facilityId = ? LIMIT 1').get(patientId, facilityId)) return true;

  // Check medical records
  if (db.prepare('SELECT 1 FROM medical_records WHERE patientId = ? AND facilityId = ? LIMIT 1').get(patientId, facilityId)) return true;

  // Check referrals (either referring or receiving)
  if (db.prepare('SELECT 1 FROM referrals WHERE patientId = ? AND (referringFacilityId = ? OR receivingFacilityId = ?) LIMIT 1').get(patientId, facilityId, facilityId)) return true;

  // Check emergency cases
  if (db.prepare('SELECT 1 FROM emergency_cases WHERE patientId = ? AND facilityId = ? LIMIT 1').get(patientId, facilityId)) return true;

  // Check diagnostic orders
  if (db.prepare('SELECT 1 FROM diagnostic_orders WHERE patientId = ? AND (referringFacilityId = ? OR diagnosticFacilityId = ?) LIMIT 1').get(patientId, facilityId, facilityId)) return true;

  // Check care plans
  if (db.prepare('SELECT 1 FROM care_plans WHERE patientId = ? AND facilityId = ? LIMIT 1').get(patientId, facilityId)) return true;

  // Check triage assessments
  if (db.prepare(`
    SELECT 1 FROM triage_assessments t
    JOIN facility_staff fs ON t.assessedBy = fs.userId
    WHERE t.patientId = ? AND fs.facilityId = ? LIMIT 1
  `).get(patientId, facilityId)) return true;

  return false;
}

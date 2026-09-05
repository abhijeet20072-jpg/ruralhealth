import { Router } from 'express';
import { 
  createEmergency, 
  updateEmergencyStatus, 
  getFacilityEmergencies, 
  getPatientEmergencies 
} from './emergency.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

const clinicalStaff = ['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN'];

// Create an emergency (Clinician only)
router.post('/', authenticate, authorizeRoles(...clinicalStaff), createEmergency);

// Update status (Clinician / Admin only)
router.put('/:id/status', authenticate, authorizeRoles(...clinicalStaff, 'ROLE_DISTRICT_ADMIN'), updateEmergencyStatus);

// Get facility emergencies
router.get('/facility', authenticate, authorizeRoles(...clinicalStaff), getFacilityEmergencies);

// Get patient emergencies (Citizen or authorized staff)
router.get('/patient/:patientId', authenticate, getPatientEmergencies);

export default router;

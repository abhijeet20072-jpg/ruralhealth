import { Router } from 'express';
import { 
  createMedicalRecord, getPatientTimeline
} from './record.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

const clinicalStaff = ['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST'];

// Strict clinical requirements for writing to the EHR
router.post('/', authenticate, authorizeRoles(...clinicalStaff), createMedicalRecord);

// Reading the longitudinal timeline
router.get('/patient/:patientId', authenticate, authorizeRoles(...clinicalStaff), getPatientTimeline);

export default router;

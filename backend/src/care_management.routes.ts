import { Router } from 'express';
import { 
  enrollPatient, 
  updateCarePlanStatus, 
  getFacilityCarePlans, 
  getPatientCarePlans 
} from './care_management.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();
const clinicalStaff = ['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN'];

router.post('/enroll', authenticate, authorizeRoles(...clinicalStaff), enrollPatient);
router.put('/:id', authenticate, authorizeRoles(...clinicalStaff, 'ROLE_DISTRICT_ADMIN'), updateCarePlanStatus);
router.get('/facility', authenticate, authorizeRoles(...clinicalStaff), getFacilityCarePlans);
router.get('/patient/:patientId', authenticate, getPatientCarePlans);

export default router;

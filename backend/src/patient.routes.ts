import { Router } from 'express';
import { 
  registerPatient, updatePatient, searchPatients, getPatientDetails 
} from './patient.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

const clinicalStaff = ['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'];

router.get('/search', authenticate, authorizeRoles(...clinicalStaff), searchPatients);
router.post('/', authenticate, authorizeRoles('ROLE_CITIZEN', ...clinicalStaff), registerPatient);
router.get('/:id', authenticate, authorizeRoles('ROLE_CITIZEN', ...clinicalStaff), getPatientDetails);
router.put('/:id', authenticate, authorizeRoles('ROLE_CITIZEN', ...clinicalStaff), updatePatient);

export default router;

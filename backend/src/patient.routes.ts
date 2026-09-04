import { Router } from 'express';
import { 
  registerPatient, updatePatient, searchPatients, getPatientDetails 
} from './patient.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

// Only specific roles can interact with patient data
const clinicalAuth = [
  authenticate, 
  authorizeRoles('ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN')
];

router.get('/search', clinicalAuth, searchPatients);
router.post('/', clinicalAuth, registerPatient);
router.get('/:id', clinicalAuth, getPatientDetails);
router.put('/:id', clinicalAuth, updatePatient);

export default router;

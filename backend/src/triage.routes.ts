import { Router } from 'express';
import { 
  createAssessment, getPatientAssessments
} from './triage.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

const clinicalStaff = ['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST'];

router.post('/assess', authenticate, authorizeRoles(...clinicalStaff), createAssessment);
router.get('/patient/:patientId', authenticate, authorizeRoles(...clinicalStaff), getPatientAssessments);

export default router;

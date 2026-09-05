import { Router } from 'express';
import { completeConsultation } from './consultation.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();
const clinicalStaff = ['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_CHO'];

router.post('/complete', authenticate, authorizeRoles(...clinicalStaff), completeConsultation);

export default router;

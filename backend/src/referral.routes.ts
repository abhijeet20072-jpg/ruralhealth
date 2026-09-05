import { Router } from 'express';
import { 
  createReferral, updateReferralStatus, getDashboard, getOverdueReferrals, getPatientReferrals
} from './referral.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();
const clinicalStaff = ['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'];

router.post('/', authenticate, authorizeRoles(...clinicalStaff), createReferral);
router.put('/:id/status', authenticate, authorizeRoles(...clinicalStaff), updateReferralStatus);
router.get('/dashboard', authenticate, authorizeRoles(...clinicalStaff), getDashboard);
router.get('/overdue', authenticate, authorizeRoles('ROLE_DISTRICT_ADMIN'), getOverdueReferrals);


router.get('/patient/:patientId', authenticate, authorizeRoles('ROLE_CITIZEN', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST'), getPatientReferrals);

export default router;


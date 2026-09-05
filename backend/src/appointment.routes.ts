import { Router } from 'express';
import { 
  bookAppointment, cancelAppointment, updateQueueStatus, 
  getDoctorAvailability, getFacilityQueue, getPatientHistory, getQueuePosition 
} from './appointment.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

const clinicalStaff = ['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN'];

// Public / Patient accessible
router.get('/availability', getDoctorAvailability);
router.post('/book', authenticate, bookAppointment);
router.put('/:id/cancel', authenticate, cancelAppointment);
router.get('/patient/:patientId', authenticate, authorizeRoles('ROLE_CITIZEN', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST'), getPatientHistory);
router.get('/:id/queue-status', authenticate, getQueuePosition);

// Staff / Admin accessible
router.get('/queue', authenticate, authorizeRoles(...clinicalStaff), getFacilityQueue);
router.put('/:id/queue-status', authenticate, authorizeRoles(...clinicalStaff), updateQueueStatus);

export default router;

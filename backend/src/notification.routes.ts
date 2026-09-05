import { Router } from 'express';
import { 
  getUserNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  createFollowUp,
  getFacilityFollowUps,
  getPatientFollowUps,
  updateFollowUpStatus,
  reconcileFollowUps
} from './notification.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

const clinicalRoles = ['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_CHO', 'ROLE_ANM', 'ROLE_ASHA'];
const adminRoles = ['ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'];

// Notifications
router.get('/', authenticate, getUserNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/read-all', authenticate, markAllAsRead);
router.put('/:id/read', authenticate, markAsRead);

// Follow-Ups
router.post('/follow-ups', authenticate, authorizeRoles(...clinicalRoles), createFollowUp);
router.get('/follow-ups/facility', authenticate, authorizeRoles(...adminRoles, ...clinicalRoles), getFacilityFollowUps);
router.get('/follow-ups/patient/:patientId', authenticate, getPatientFollowUps);
router.put('/follow-ups/:id/status', authenticate, authorizeRoles(...clinicalRoles, ...adminRoles), updateFollowUpStatus);

// Admin/System Job
router.post('/reconcile', authenticate, authorizeRoles('ROLE_DISTRICT_ADMIN'), reconcileFollowUps);

export default router;

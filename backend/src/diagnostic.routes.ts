import { Router } from 'express';
import { 
  getCatalog, 
  getCapableFacilities, 
  manageFacilityDiagnostics, 
  getFacilityDiagnostics,
  orderDiagnostic,
  getOrders,
  getPatientOrders,
  updateStatus,
  recordResult,
  reviewResult
} from './diagnostic.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

const clinicalRoles = ['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_CHO', 'ROLE_ANM', 'ROLE_ASHA'];
const diagnosticRoles = ['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_HEALTH_WORKER'];
const adminRoles = ['ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'];

// Catalog and capabilities
router.get('/catalog', authenticate, getCatalog);
router.get('/facilities', authenticate, getCapableFacilities);
router.get('/facility', authenticate, authorizeRoles(...adminRoles, ...diagnosticRoles), getFacilityDiagnostics);
router.put('/facility', authenticate, authorizeRoles(...adminRoles), manageFacilityDiagnostics);

// Workflow
router.post('/orders', authenticate, authorizeRoles(...clinicalRoles), orderDiagnostic);
router.get('/orders', authenticate, getOrders);
router.get('/patient/:patientId', authenticate, getPatientOrders);
router.put('/orders/:id/status', authenticate, authorizeRoles(...diagnosticRoles), updateStatus);
router.post('/orders/:id/result', authenticate, authorizeRoles(...diagnosticRoles), recordResult);
router.post('/orders/:id/review', authenticate, authorizeRoles(...clinicalRoles), reviewResult);

export default router;

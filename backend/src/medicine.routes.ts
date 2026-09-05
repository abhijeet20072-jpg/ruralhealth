import { Router } from 'express';
import { 
  getCatalog, 
  getFacilityInventory,
  updateInventory,
  getMedicineAvailability,
  getPatientMedicines
} from './medicine.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

const clinicalRoles = ['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_CHO', 'ROLE_ANM', 'ROLE_ASHA'];
const adminRoles = ['ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'];

// Everyone authenticated can view catalog and search availability
router.get('/catalog', authenticate, getCatalog);
router.get('/availability', authenticate, getMedicineAvailability);

// Only Admins and clinical staff can view their own facility's inventory
router.get('/inventory', authenticate, authorizeRoles(...adminRoles, ...clinicalRoles), getFacilityInventory);

// Only Admins can modify inventory
router.put('/inventory', authenticate, authorizeRoles(...adminRoles), updateInventory);

// Patients view their prescribed medicines (and doctors can view their patients')
router.get('/patient/:patientId', authenticate, getPatientMedicines);

export default router;

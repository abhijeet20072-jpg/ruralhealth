import { Router } from 'express';
import { 
  registerFacility, updateFacility, searchFacilities, getFacilityDetails, assignStaff 
} from './facility.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

// Public / Authenticated discovery routes
router.get('/search', authenticate, searchFacilities);
router.get('/:id', authenticate, getFacilityDetails);

// Admin / Officer only routes
const adminAuth = [authenticate, authorizeRoles('ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN')];

router.post('/', adminAuth, registerFacility);
router.put('/:id', adminAuth, updateFacility);
router.post('/assign-staff', adminAuth, assignStaff);

export default router;

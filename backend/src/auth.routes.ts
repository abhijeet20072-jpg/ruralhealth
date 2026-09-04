import { Router } from 'express';
import { register, login, me, logout } from './auth.controller';
import { authenticate, authorizeRoles } from './auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, me);

// RBAC test route
router.get('/admin', authenticate, authorizeRoles('ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'), (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard' });
});

export default router;

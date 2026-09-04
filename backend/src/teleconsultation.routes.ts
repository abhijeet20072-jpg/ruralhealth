import { Router } from 'express';
import { 
  requestConsultation, 
  getConsultations, 
  getConsultationById, 
  updateStatus, 
  joinSignaling, 
  postSignaling,
  generateSignalingTicket
} from './teleconsultation.controller';
import { authenticate } from './auth.middleware';

const router = Router();

router.post('/', authenticate, requestConsultation);
router.get('/', authenticate, getConsultations);
router.get('/:id', authenticate, getConsultationById);
router.put('/:id/status', authenticate, updateStatus);
router.post('/:id/ticket', authenticate, generateSignalingTicket);
router.get('/:id/signaling', joinSignaling); // Ticket verification happens inside
router.post('/:id/signaling', authenticate, postSignaling);

export default router;

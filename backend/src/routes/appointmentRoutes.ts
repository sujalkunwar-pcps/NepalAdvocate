import { Router } from 'express';
import { createAppointment, getMyAppointments } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createAppointment);
router.get('/', authenticateToken, getMyAppointments);

export default router;

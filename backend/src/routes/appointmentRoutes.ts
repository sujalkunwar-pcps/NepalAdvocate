import { Router } from 'express';
import { createAppointment, getMyAppointments, updateAppointmentStatus } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createAppointment);
router.get('/', authenticateToken, getMyAppointments);
router.patch('/:id/status', authenticateToken, updateAppointmentStatus);
router.patch('/:id', authenticateToken, updateAppointmentStatus);

export default router;


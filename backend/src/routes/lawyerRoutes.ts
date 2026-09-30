import { Router } from 'express';
import { getLawyers, getLawyerById } from '../controllers/lawyerController';

const router = Router();

router.get('/', getLawyers);
router.get('/:id', getLawyerById);

export default router;

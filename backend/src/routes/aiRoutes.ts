import { Router } from 'express';
import { askLegalAi } from '../controllers/aiController';

const router = Router();

router.post('/query', askLegalAi);

export default router;

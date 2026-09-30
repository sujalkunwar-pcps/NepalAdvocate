import { Router } from 'express';
import { getMyDocuments, createDocument } from '../controllers/documentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getMyDocuments);
router.post('/', authenticateToken, createDocument);

export default router;

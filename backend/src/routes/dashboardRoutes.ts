import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Allow optional token or public mock fallback
router.get('/', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, getDashboardData);

export default router;

import { Router } from 'express';
import { login, register, me, refreshToken } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/v1/auth/register - Register new user
router.post('/register', register);

// POST /api/v1/auth/login - Login
router.post('/login', login);

// GET /api/v1/auth/me - Get current user
router.get('/me', authenticate, me);

// POST /api/v1/auth/refresh - Refresh token
router.post('/refresh', refreshToken);

export default router;

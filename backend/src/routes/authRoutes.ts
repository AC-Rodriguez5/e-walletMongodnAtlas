import { Router } from 'express';
import { signup, verifySignupOTP, login, verifyLoginOTP, getProfile, updateProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/verify-signup', verifySignupOTP);
router.post('/login', login);
router.post('/verify-login', verifyLoginOTP);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;

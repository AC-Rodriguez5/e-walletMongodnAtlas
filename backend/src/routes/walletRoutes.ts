import express from 'express';
import { getWallet, getWalletStats, addMoney, withdrawMoney, sendMoney, transferMoney } from '../controllers/walletController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.get('/', authMiddleware, getWallet);
router.get('/stats', authMiddleware, getWalletStats);
router.post('/add', authMiddleware, addMoney);
router.post('/withdraw', authMiddleware, withdrawMoney);
router.post('/send', authMiddleware, sendMoney);
router.post('/transfer', authMiddleware, transferMoney);

export default router;

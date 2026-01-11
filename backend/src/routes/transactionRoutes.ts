import { Router } from 'express';
import { createTransaction, getTransactions, getWalletBalance, addMoney } from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create', authMiddleware, createTransaction);
router.get('/', authMiddleware, getTransactions);
router.get('/balance', authMiddleware, getWalletBalance);
router.post('/add-money', authMiddleware, addMoney);

export default router;

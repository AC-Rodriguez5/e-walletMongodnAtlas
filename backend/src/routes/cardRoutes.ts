import { Router } from 'express';
import { addCard, getCards, removeCard, setDefaultCard, addMoneyToCard } from '../controllers/cardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/add', authMiddleware, addCard);
router.get('/', authMiddleware, getCards);
router.delete('/:cardId', authMiddleware, removeCard);
router.put('/:cardId/default', authMiddleware, setDefaultCard);
router.post('/:cardId/add-money', authMiddleware, addMoneyToCard);

export default router;

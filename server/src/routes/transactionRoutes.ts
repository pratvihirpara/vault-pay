import { Router } from 'express';
import { getSummary, getTransactions, createTransaction, updateTransaction } from '../controllers/transactionController';
import { validateTransaction } from '../middleware/validation';

const router = Router();

router.get('/summary', getSummary);
router.get('/transactions', getTransactions);
router.post('/transactions', validateTransaction, createTransaction);
router.put('/transactions/:id', updateTransaction);

export default router;

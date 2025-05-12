import express from 'express';
import {
  createLoan,
  getAllLoans,
  getLoan,
  returnLoan,
  getUserLoans,
  extendLoan,
  getOverdueLoans,
} from '../controllers/loanController.js';

const router = express.Router();

router.get('/overdue', getOverdueLoans); // New route for overdue loans
router.post('/', createLoan);
router.get('/', getAllLoans);
router.get('/:id', getLoan);
router.put('/:id/return', returnLoan);
router.get('/user/:user_id', getUserLoans);
router.put('/:id/extend', extendLoan);

export default router;
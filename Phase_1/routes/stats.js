import express from 'express';
import {
  getPopularBooks,
  getActiveUsers,
  getOverviewStats,
} from '../controllers/statController.js';

const router = express.Router();

router.get('/books/popular', getPopularBooks);
router.get('/users/active', getActiveUsers);
router.get('/overview', getOverviewStats);

export default router; // Default export
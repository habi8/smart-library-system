import express from 'express';
import {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);

export default router; // This is a default export
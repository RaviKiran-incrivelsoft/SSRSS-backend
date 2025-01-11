import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
	registerUser,
	loginUser,
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, getAllUsers); // Protect: only logged-in users or admins can access
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

export default router;

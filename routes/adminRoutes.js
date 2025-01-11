import express from 'express';
import {
	registerAdmin,
	loginAdmin,
	getAdminProfile,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new admin
router.post('/register', registerAdmin);

// Admin login
router.post('/login', loginAdmin);

// Get admin profile (protected route)
router.get('/profile', protect, getAdminProfile);

export default router;
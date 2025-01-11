import express from 'express';
import {
	createBlog,
	getAllBlogs,
	getBlogById,
	updateBlogById,
	deleteBlogById,
	toggleLikeBlog,
} from '../controllers/blogController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { configureFileUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs); // Get all blogs
router.get('/:id', getBlogById); // Get a single blog by ID

// User-protected routes
router.post('/:id/like', protect, toggleLikeBlog); // Like or unlike a blog

// Admin-only routes
router.post('/', protect, admin, configureFileUpload(true, 'image'), createBlog); // Create a new blog
router.put('/:id', protect, admin, updateBlogById); // Update a blog by ID
router.delete('/:id', protect, admin, deleteBlogById); // Delete a blog by ID

export default router;

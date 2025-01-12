import Blog from '../models/Blog.js';
import cloudinary from '../config/cloudinary.js';
import jwt from 'jsonwebtoken';

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Admin
export const createBlog = async (req, res) => {
	try {
		// Ensure the admin is authenticated
		console.log(req.admin);

		const adminId = req.admin.id;

		// Handle image upload to Cloudinary
		const imageFile = req.file;
		let imageUrl = null;

		if (imageFile) {
			// Upload the image to Cloudinary
			const uploadResponse = await cloudinary.uploader.upload(imageFile.path, {
				folder: 'blogs',
			});
			imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
		}

		// Get blog data from request body
		const { data, category } = req.body;

		// Validate required fields
		if (!data || !category) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// Create a new blog document, including the admin's ObjectId
		const newBlog = new Blog({
			data: JSON.parse(data),  // Parse the JSON string from the client side
			category: JSON.parse(category),
			adminId: adminId,  // Use the admin's ObjectId from req.user
			image: imageUrl,  // Store the Cloudinary image URL
		});

		// Save the blog to the database
		await newBlog.save();

		res.status(201).json({ message: 'Blog created successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error creating blog', error: error.message });
	}
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		let loggedInUser = null;
		if (authHeader) {
			const token = authHeader.split(' ')[1];
			try {
				loggedInUser = jwt.verify(token, process.env.JWT_SECRET);
			} catch (error) {
				console.error('Token verification failed:', error.message);
			}
		}

		const blogs = await Blog.find().select('-admin').sort({ createdAt: -1 });

		const blogsWithLikesCount = blogs.map(blog => {
			const blogObj = blog.toObject();
			blogObj.likesCount = blog.likes.length;
			blogObj.isLiked = loggedInUser ? blog.likes.includes(loggedInUser.userId) : false;
			delete blogObj.likes;
			return blogObj;
		});

		res.status(200).json(blogsWithLikesCount);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching blogs', error: error.message });
	}
};

// @desc    Get a blog by ID and increment views
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id).select("-adminId");
		if (!blog) {
			return res.status(404).json({ message: 'Blog not found' });
		}

		// Increment views count
		blog.views += 1;
		await blog.save();

		res.status(200).json(blog);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Toggle like on a blog
// @route   POST /api/blogs/:id/like
// @access  Protected
export const toggleLikeBlog = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		const blog = await Blog.findById(id);

		if (!blog) {
			return res.status(404).json({ message: 'Blog not found' });
		}

		// Check if the user already liked the blog
		const alreadyLiked = blog.likes.includes(userId);

		if (alreadyLiked) {
			// Remove the user's like
			blog.likes = blog.likes.filter((id) => id.toString() !== userId);
		} else {
			// Add the user's like
			blog.likes.push(userId);
		}

		await blog.save();

		res.status(200).json({
			message: alreadyLiked ? 'Like removed' : 'Blog liked',
			likesCount: blog.likes.length,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error toggling like', error: error.message });
	}
};

// @desc    Update a blog by ID
// @route   PUT /api/blogs/:id
// @access  Admin
export const updateBlogById = async (req, res) => {
	try {
		const { id } = req.params;

		// Find and update the blog
		const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!updatedBlog) {
			return res.status(404).json({ message: 'Blog not found' });
		}

		res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });
	} catch (error) {
		res.status(500).json({ message: 'Error updating blog', error: error.message });
	}
};

// @desc    Delete a blog by ID
// @route   DELETE /api/blogs/:id
// @access  Admin
export const deleteBlogById = async (req, res) => {
	try {
		const { id } = req.params;

		const blog = await Blog.findById(id);
		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}

		if (blog.adminId?.toString() !== req.admin?._id.toString()) {
			return res.status(403).json({ message: "Access denied. can't delete the Blog." });
		}

		await blog.deleteOne();
		res.status(200).json({ message: 'Blog deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Error deleting blog', error: error.message });
	}
};

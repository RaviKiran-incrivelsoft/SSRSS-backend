import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user
export const registerUser = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Check if the email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'Email already exists' });
		}

		// Create a new user
		const newUser = new User({ name, email, password });
		await newUser.save();

		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Login user
export const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		
		
		const user = await User.findOne({ email }).select('+password');
		if (!user) {
			return res.status(400).json({ message: 'Invalid email or password' });
		}
		
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid email or password' });
		}
		const token = jwt.sign(
			{ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' }
		);

		res.status(200).json({ message: 'Login successful', token, userName: user.name});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get all users
export const getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select('-password');
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get user by ID
export const getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Update user
export const updateUser = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Find user by ID
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Update fields
		if (name) user.name = name;
		if (email) user.email = email;
		if (password) {
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
		}

		await user.save();

		res.status(200).json({ message: 'User updated successfully', user });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Delete user
export const deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

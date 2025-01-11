import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT
const generateToken = (id) => {
	return jwt.sign({ adminId: id }, process.env.JWT_SECRET, { expiresIn: '3h' });
};

// POST /admin/register
export const registerAdmin = async (req, res) => {
	const { name, email, password } = req.body;

	try {
		const existingAdmin = await Admin.findOne({ email });
		if (existingAdmin) {
			return res.status(400).json({ message: 'Admin already exists' });
		}

		const admin = await Admin.create({ name, email, password });
		if (admin) {
			res.status(201).json({ message: 'Admin registered successfully' });
		} else {
			res.status(400).json({ message: 'Invalid admin data' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// POST /admin/login
export const loginAdmin = async (req, res) => {
	const { email, password } = req.body;

	try {
		const admin = await Admin.findOne({ email });

		if (admin && (await bcrypt.compare(password, admin.password))) {
			res.status(200).json({ message: 'Logged in as Admin', adminToken: generateToken(admin.id)});
		} else {
			res.status(401).json({ message: 'Invalid email or password' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// GET /admin/profile
export const getAdminProfile = async (req, res) => {
	try {
		const admin = await Admin.findById(req.admin.id).select('-password'); // Use req.admin from middleware

		if (admin) {
			res.status(200).json(admin);
		} else {
			res.status(404).json({ message: 'Admin not found' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// GET /admin/all
export const getAllAdmins = async (req, res) => {
	try {
		const admins = await Admin.find().select('-password');
		res.status(200).json(admins);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// GET /admin/:id
export const getAdminById = async (req, res) => {
	const { id } = req.params;

	try {
		const admin = await Admin.findById(id).select('-password');

		if (admin) {
			res.status(200).json(admin);
		} else {
			res.status(404).json({ message: 'Admin not found' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// PUT /admin/:id
export const updateAdmin = async (req, res) => {
	const { id } = req.params;
	const { name, email, password } = req.body;

	try {
		const admin = await Admin.findById(id);

		if (!admin) {
			return res.status(404).json({ message: 'Admin not found' });
		}

		admin.name = name || admin.name;
		admin.email = email || admin.email;

		if (password) {
			const salt = await bcrypt.genSalt(10);
			admin.password = await bcrypt.hash(password, salt);
		}

		const updatedAdmin = await admin.save();

		res.status(200).json({
			_id: updatedAdmin.id,
			name: updatedAdmin.name,
			email: updatedAdmin.email,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// DELETE /admin/:id
export const deleteAdmin = async (req, res) => {
	const { id } = req.params;

	try {
		const admin = await Admin.findById(id);

		if (!admin) {
			return res.status(404).json({ message: 'Admin not found' });
		}

		await admin.remove();
		res.status(200).json({ message: 'Admin deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Middleware to protect routes
export const protect = async (req, res, next) => {
	let token;
	
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1];
			
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			
			const user = await User.findById(decoded.userId).select('-password');
			const admin = await Admin.findById(decoded.adminId).select('-password');
			
			if (admin) {
				req.admin = admin;
				req.user = null;
			} else if (user) {
				req.user = user;
				req.admin = null;
			} else {
				return res.status(403).json({ message: 'Not authorized' });
			}

			next();
		} catch (error) {
			res.status(401).json({ message: 'Not authorized, invalid token' });
		}
	}

	if (!token) {
		res.status(401).json({ message: 'Not authorized, no token provided' });
	}
};

// Middleware to allow only Admin access
export const admin = (req, res, next) => {
	if (req.admin) {
		next();
	} else {
		res.status(403).json({ message: 'Access denied, Admins only' });
	}
};

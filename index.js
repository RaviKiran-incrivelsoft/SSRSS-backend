import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import blogRoutes from './routes/blogRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import Admin from "./models/Admin.js";

dotenv.config();
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// routes
app.use('/admin', adminRoutes)
app.use('/blog', blogRoutes)
app.use('/user', userRoutes)

// server
const port = process.env.DB_PORT || 3000;
app.listen(port, async () => {
	console.log(`Server Started on port ${port}`);
	await connectDB();
	
	const defaultAdmin = {
		name: 'Super Admin',
		email: 'admin@ssrss.com',
		password: 'Admin123',
	};

	const existingAdmin = await Admin.findOne({ email: defaultAdmin.email });
	if (!existingAdmin) {
		const admin = new Admin(defaultAdmin);
		await admin.save();
		console.log('Default admin user created:', defaultAdmin.email);
	} else {
		console.log('Default admin user already exists.');
	}
});

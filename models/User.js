import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				'Please provide a valid email address',
			],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			select: false, // Ensures password is not returned in queries
		},
	},
	{ timestamps: true }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
	// Only hash the password if it has been modified
	if (!this.isModified('password')) return next();

	const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
	this.password = await bcrypt.hash(this.password, salt); // Hash the password
	next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

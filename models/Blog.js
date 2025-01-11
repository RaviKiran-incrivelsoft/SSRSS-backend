import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User', // Link to the User model
			required: true,
		},
		comment: {
			type: String,
			required: [true, 'Comment is required'],
			trim: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

const blogSchema = new mongoose.Schema(
	{
		data: [
			{
				type: {
					type: String,
					enum: ['title', 'paragraph'],
				},
				value: {
					type: String,
					required: [true, 'Content value is required'],
					trim: true,
					minlength: 1,
					maxlength: 1000,
				},
			},
		],
		image: {
			type: String,
			required: [true, 'Image is required'],
			default: 'https://default.image/url.png',
		},
		category: [
			{
				type: String,
				enum: [
					'Welfare',
					'Environment',
					'Empowerment',
					'Youth',
					'Education',
					'Culture',
					'Harmony',
					'Spirituality',
					'Infrastructure',
					'Events',
				],
				required: [true, 'At least one category is required'],
			},
		],
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		comments: [commentSchema],
		views: {
			type: Number,
			default: 0,
		},
		adminId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Admin',
			default: null,
		},
	},
	{ timestamps: true }
);

blogSchema.index({ likes: 1 }, { unique: true }); // Ensure unique likes per user

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;

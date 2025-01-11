import multer from "multer";
import path from "path";
import fs from "fs";

export const configureFileUpload = (isSingle = false, fieldName = "") => {
	// Ensure 'uploads' directory exists
	if (!fs.existsSync("uploads")) {
		fs.mkdirSync("uploads");
	}

	// Configure multer storage
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, "uploads/"); // Save files in the 'uploads' folder
		},
		filename: (req, file, cb) => {
			const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
			const ext = path.extname(file.originalname); // Extract file extension
			cb(null, file.fieldname + "-" + uniqueSuffix + ext); // Generate unique filename
		},
	});

	// Define allowed file types
	const allowedTypes = [
		"image/jpeg",
		"image/png",
		"image/webp",
	];

	// Configure multer instance with file validation
	const upload = multer({
		storage,
		fileFilter: (req, file, cb) => {

			if (allowedTypes.includes(file.mimetype)) {
				cb(null, true);
			} else {
				cb(new Error("Unsupported file type"), false);
			}
		},
		limits: {
		  fileSize: 5 * 1024 * 1024, // 5 MB limit
		},
	});

	// Return appropriate middleware based on upload type (single or multiple)
	if (isSingle) {
		if (!fieldName) {
			throw new Error("Field name must be provided for single file upload.");
		}
		return upload.single(fieldName); // Middleware for single file upload
	} else {
		// Define fields for multiple files
		return upload.fields([
			{ name: "image", maxCount: 1 },
		]);
	}
};

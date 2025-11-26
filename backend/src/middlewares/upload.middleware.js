/**
 * Upload Middleware
 * Xử lý upload file (ảnh đại diện, documents...)
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ApiError } from './errorHandler.middleware.js';
import { HTTP_STATUS } from '../config/app.constants.js';
import {
  UPLOAD_CONFIG,
  ERROR_MESSAGES,
} from '../modules/user/profile.constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(
  __dirname,
  '../../public',
  UPLOAD_CONFIG.UPLOAD_DIR
);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const userId = req.user?.id || 'guest';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${userId}_${timestamp}_${sanitizedName}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_FILE_TYPE),
      false
    );
  }
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
  },
});

// Error handler for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.FILE_TOO_LARGE,
      });
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  next(err);
};

// Export upload middleware
export const uploadAvatar = upload.single('avatar');

export default upload;

import express from 'express';
import adminUserController from './admin.user.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Admin User Routes
 * All routes protected by admin auth middleware
 */

// Middleware to check admin role
const checkAdminRole = (req, res, next) => {
  const userRole = req.user.vai_tro || req.user.role;
  
  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ quản trị viên mới có quyền truy cập',
    });
  }
  next();
};

// Apply auth + admin check to all routes
router.use(authenticateToken, checkAdminRole);

// Create new user
router.post('/', adminUserController.createUser);

// Get all users (with filter)
router.get('/', adminUserController.getUsers);

// Get user statistics
router.get('/stats', adminUserController.getStats);

// Get user detail
router.get('/:id', adminUserController.getUserDetail);

// Update user information
router.patch('/:id', adminUserController.updateUser);

// Update user status
router.patch('/:id/status', adminUserController.updateUserStatus);

// Change user role
router.patch('/:id/role', adminUserController.changeUserRole);

// Reset user password
router.post('/:id/reset-password', adminUserController.resetUserPassword);

// Delete user
router.delete('/:id', adminUserController.deleteUser);

export default router;

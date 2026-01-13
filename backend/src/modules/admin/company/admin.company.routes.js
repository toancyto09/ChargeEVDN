import express from 'express';
import companyController from '../../company/company.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';
import { auditLog } from '../../../middlewares/auditLog.middleware.js';

const router = express.Router();

/**
 * Admin Company Routes
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

// Get company statistics
router.get('/stats', companyController.getStats);

// Get all companies (with filter)
router.get('/', companyController.getAllCompanies);

// Get company detail
router.get('/:id', companyController.getCompanyById);

// Create new company
router.post('/', auditLog.businessCreate, companyController.createCompany);

// Update company
router.put('/:id', auditLog.businessUpdate, companyController.updateCompany);

// Approve company
router.post('/:id/approve', auditLog.businessApprove, companyController.approveCompany);

// Reject company
router.post('/:id/reject', auditLog.businessReject, companyController.rejectCompany);

// Delete company
router.delete('/:id', companyController.deleteCompany);

export default router;

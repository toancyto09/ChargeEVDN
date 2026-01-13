import express from 'express';
import companyController from '../../company/company.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Owner Company Routes
 * Routes for station owners to manage their company profile
 */

// Middleware to check owner role
const checkOwnerRole = (req, res, next) => {
  const userRole = req.user.vai_tro || req.user.role;
  
  if (userRole !== 'owner' && userRole !== 'chu_tram') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ chủ trạm mới có quyền truy cập',
    });
  }
  next();
};

// Apply auth + owner check to all routes
router.use(authenticateToken, checkOwnerRole);

// Get owner's company
router.get('/', companyController.getOwnerCompany);

// Update owner's company (will set status to pending review)
router.put('/', companyController.updateOwnerCompany);

export default router;

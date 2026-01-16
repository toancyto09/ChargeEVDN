import express from 'express';
import ownerStationController from './owner.station.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Owner Station Routes
 * All routes require authentication and owner role
 */

// Middleware to check owner role
const checkOwnerRole = (req, res, next) => {
  if (req.user.vai_tro !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ chủ sở hữu trạm mới có quyền truy cập',
    });
  }
  next();
};

// Apply auth + owner check to all routes
router.use(authenticateToken, checkOwnerRole);

// Get all owner's stations
router.get('/stations', ownerStationController.getStations);

// Get single station
router.get('/stations/:id', ownerStationController.getStation);

// Get QR code for station (deprecated)
router.get('/stations/:id/qr', ownerStationController.getStationQR);

// Get QR code for specific connector (RECOMMENDED)
router.get('/connectors/:connectorId/qr', ownerStationController.getConnectorQR);

// Create new station
router.post('/stations', ownerStationController.createStation);

// Update station
router.put('/stations/:id', ownerStationController.updateStation);

// Delete station
router.delete('/stations/:id', ownerStationController.deleteStation);

export default router;

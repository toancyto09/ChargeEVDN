import express from 'express';
import ownerConnectorController from './owner.connector.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';
import { checkOwnerRole } from '../owner.middleware.js'; // Shared middleware

const router = express.Router();

/**
 * Owner Connector Routes
 * All routes require authentication and owner role
 */

// Apply auth + owner check to all routes
router.use(authenticateToken, checkOwnerRole);

// Get available connector types (for dropdown)
router.get('/connector-types', ownerConnectorController.getConnectorTypes);

// Get all connectors for a station
router.get(
  '/stations/:stationId/connectors',
  ownerConnectorController.getConnectors
);

// Create new connector for a station
router.post(
  '/stations/:stationId/connectors',
  ownerConnectorController.createConnector
);

// Update connector
router.put('/connectors/:id', ownerConnectorController.updateConnector);

// Delete connector
router.delete('/connectors/:id', ownerConnectorController.deleteConnector);

// Change connector status
router.patch('/connectors/:id/status', ownerConnectorController.changeStatus);

export default router;

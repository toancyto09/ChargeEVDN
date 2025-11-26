/**
 * Vehicle Routes
 * API routes cho quản lý phương tiện
 */

import express from 'express';
import * as vehicleController from './vehicle.controller.js';
import * as vehicleValidator from './vehicle.validator.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Tất cả routes đều require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/vehicles/connectors/types
 * @desc    Lấy danh sách loại cổng sạc
 * @access  Private
 */
router.get('/connectors/types', vehicleController.getConnectorTypes);

/**
 * @route   GET /api/vehicles
 * @desc    Lấy danh sách phương tiện của user
 * @access  Private
 */
router.get('/', vehicleController.getVehicles);

/**
 * @route   POST /api/vehicles
 * @desc    Thêm phương tiện mới
 * @access  Private
 */
router.post(
  '/',
  vehicleValidator.validateCreateVehicle,
  vehicleController.createVehicle
);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Lấy chi tiết 1 phương tiện
 * @access  Private
 */
router.get(
  '/:id',
  vehicleValidator.validateVehicleId,
  vehicleController.getVehicleById
);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Cập nhật phương tiện
 * @access  Private
 */
router.put(
  '/:id',
  vehicleValidator.validateUpdateVehicle,
  vehicleController.updateVehicle
);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Xóa phương tiện
 * @access  Private
 */
router.delete(
  '/:id',
  vehicleValidator.validateVehicleId,
  vehicleController.deleteVehicle
);

/**
 * @route   PUT /api/vehicles/:id/soc
 * @desc    Cập nhật SOC (State of Charge)
 * @access  Private
 */
router.put(
  '/:id/soc',
  vehicleValidator.validateUpdateSOC,
  vehicleController.updateSOC
);

/**
 * @route   PUT /api/vehicles/:id/set-main
 * @desc    Đặt xe làm xe chính
 * @access  Private
 */
router.put(
  '/:id/set-main',
  vehicleValidator.validateVehicleId,
  vehicleController.setMainVehicle
);

export default router;


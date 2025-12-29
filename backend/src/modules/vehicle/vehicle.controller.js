/**
 * Vehicle Controller
 * Xử lý các request liên quan đến quản lý phương tiện
 */

import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import { SUCCESS_MESSAGES } from './vehicle.constants.js';
import * as vehicleService from './vehicle.service.js';

/**
 * @route   GET /api/vehicles
 * @desc    Lấy danh sách phương tiện của user
 * @access  Private
 */
export const getVehicles = asyncHandler(async (req, res) => {
  const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;

  const vehicles = await vehicleService.getUserVehicles(userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Lấy danh sách phương tiện thành công',
    data: vehicles,
  });
});

/**
 * @route   GET /api/vehicles/:id
 * @desc    Lấy chi tiết 1 phương tiện
 * @access  Private
 */
export const getVehicleById = asyncHandler(async (req, res) => {
  const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
  const vehicleId = req.params.id;

  const vehicle = await vehicleService.getVehicleById(vehicleId, userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Lấy thông tin phương tiện thành công',
    data: vehicle,
  });
});

/**
 * @route   POST /api/vehicles
 * @desc    Thêm phương tiện mới
 * @access  Private
 */
export const createVehicle = asyncHandler(async (req, res) => {
  const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
  const vehicleData = req.body;

  const newVehicle = await vehicleService.createVehicle(userId, vehicleData);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.VEHICLE_CREATED,
    data: newVehicle,
  });
});

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Cập nhật phương tiện
 * @access  Private
 */
export const updateVehicle = asyncHandler(async (req, res) => {
  const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
  const vehicleId = req.params.id;
  const updateData = req.body;

  const updatedVehicle = await vehicleService.updateVehicle(vehicleId, userId, updateData);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.VEHICLE_UPDATED,
    data: updatedVehicle,
  });
});

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Xóa phương tiện
 * @access  Private
 */
export const deleteVehicle = asyncHandler(async (req, res) => {
  const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
  const vehicleId = req.params.id;

  await vehicleService.deleteVehicle(vehicleId, userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.VEHICLE_DELETED,
  });
});

/**
 * @route   PUT /api/vehicles/:id/soc
 * @desc    Cập nhật SOC (State of Charge)
 * @access  Private
 */
export const updateSOC = asyncHandler(async (req, res) => {
  const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
  const vehicleId = req.params.id;
  const { soc } = req.body;

  const updatedVehicle = await vehicleService.updateSOC(vehicleId, userId, soc);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.SOC_UPDATED,
    data: updatedVehicle,
  });
});

/**
 * @route   PUT /api/vehicles/:id/set-main
 * @desc    Đặt xe làm xe chính
 * @access  Private
 */
export const setMainVehicle = asyncHandler(async (req, res) => {
  const userId = req.user.id_nguoi_dung || req.user.userId || req.user.id;
  const vehicleId = req.params.id;

  const updatedVehicle = await vehicleService.setMainVehicle(vehicleId, userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.MAIN_VEHICLE_SET,
    data: updatedVehicle,
  });
});

/**
 * @route   GET /api/vehicles/connectors/types
 * @desc    Lấy danh sách loại cổng sạc
 * @access  Private
 */
export const getConnectorTypes = asyncHandler(async (req, res) => {
  const connectorTypes = await vehicleService.getConnectorTypes();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Lấy danh sách loại cổng sạc thành công',
    data: connectorTypes,
  });
});


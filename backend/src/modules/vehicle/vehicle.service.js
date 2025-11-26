/**
 * Vehicle Service
 * Business logic cho quản lý phương tiện
 */

import { pool } from '../../config/db.js';
import { ApiError } from '../../middlewares/errorHandler.middleware.js';
import { HTTP_STATUS } from '../../config/app.constants.js';
import {
  ERROR_MESSAGES,
  VEHICLE_STATUS,
} from './vehicle.constants.js';
import logger from '../../utils/logger.js';

/**
 * Lấy danh sách phương tiện của user
 */
export const getUserVehicles = async (userId) => {
  try {
    const query = `
      SELECT 
        pv.id_phuong_tien,
        pv.hang_xe,
        pv.dong_xe,
        pv.bien_so,
        pv.mau_xe,
        pv.nam_san_xuat,
        pv.dung_luong_pin_kwh,
        pv.cong_suat_sac_toi_da,
        pv.soc_hien_tai,
        pv.cap_nhat_soc,
        pv.la_xe_chinh,
        pv.trang_thai,
        pv.ngay_tao,
        lc.id_loai_cong,
        lc.ma_cong,
        lc.mo_ta AS mo_ta_cong
      FROM phuong_tien pv
      LEFT JOIN loai_cong_sac lc ON pv.id_loai_cong = lc.id_loai_cong
      WHERE pv.id_nguoi_dung = $1 AND pv.trang_thai = $2
      ORDER BY pv.la_xe_chinh DESC, pv.ngay_tao DESC
    `;

    const result = await pool.query(query, [userId, VEHICLE_STATUS.ACTIVE]);
    return result.rows;
  } catch (error) {
    logger.error('Error in getUserVehicles service:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết 1 phương tiện
 */
export const getVehicleById = async (vehicleId, userId) => {
  try {
    const query = `
      SELECT 
        pv.*,
        lc.ma_cong,
        lc.mo_ta AS mo_ta_cong
      FROM phuong_tien pv
      LEFT JOIN loai_cong_sac lc ON pv.id_loai_cong = lc.id_loai_cong
      WHERE pv.id_phuong_tien = $1 AND pv.id_nguoi_dung = $2 AND pv.trang_thai = $3
    `;

    const result = await pool.query(query, [vehicleId, userId, VEHICLE_STATUS.ACTIVE]);

    if (result.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error in getVehicleById service:', error);
    throw error;
  }
};

/**
 * Thêm phương tiện mới
 */
export const createVehicle = async (userId, vehicleData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      id_loai_cong,
      hang_xe,
      dong_xe,
      bien_so,
      mau_xe,
      nam_san_xuat,
      dung_luong_pin_kwh,
      cong_suat_sac_toi_da,
      soc_hien_tai = 100,
      la_xe_chinh = false,
    } = vehicleData;

    // Validate connector type exists
    const connectorCheck = await client.query(
      'SELECT id_loai_cong FROM loai_cong_sac WHERE id_loai_cong = $1',
      [id_loai_cong]
    );

    if (connectorCheck.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_CONNECTOR_TYPE);
    }

    // If setting as main vehicle, unset other main vehicles
    if (la_xe_chinh) {
      await client.query(
        'UPDATE phuong_tien SET la_xe_chinh = FALSE WHERE id_nguoi_dung = $1',
        [userId]
      );
    }

    // Insert new vehicle
    const insertQuery = `
      INSERT INTO phuong_tien (
        id_nguoi_dung,
        id_loai_cong,
        hang_xe,
        dong_xe,
        bien_so,
        mau_xe,
        nam_san_xuat,
        dung_luong_pin_kwh,
        cong_suat_sac_toi_da,
        soc_hien_tai,
        la_xe_chinh,
        trang_thai
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      userId,
      id_loai_cong,
      hang_xe,
      dong_xe || null,
      bien_so || null,
      mau_xe || null,
      nam_san_xuat || null,
      dung_luong_pin_kwh || null,
      cong_suat_sac_toi_da || null,
      soc_hien_tai,
      la_xe_chinh,
      VEHICLE_STATUS.ACTIVE,
    ]);

    await client.query('COMMIT');

    logger.info(`Vehicle created for user ${userId}`);
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error in createVehicle service:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Cập nhật phương tiện
 */
export const updateVehicle = async (vehicleId, userId, updateData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check ownership
    const checkQuery = 'SELECT * FROM phuong_tien WHERE id_phuong_tien = $1 AND id_nguoi_dung = $2 AND trang_thai = $3';
    const checkResult = await client.query(checkQuery, [vehicleId, userId, VEHICLE_STATUS.ACTIVE]);

    if (checkResult.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    const {
      id_loai_cong,
      hang_xe,
      dong_xe,
      bien_so,
      mau_xe,
      nam_san_xuat,
      dung_luong_pin_kwh,
      cong_suat_sac_toi_da,
      la_xe_chinh,
    } = updateData;

    // Validate connector type if provided
    if (id_loai_cong) {
      const connectorCheck = await client.query(
        'SELECT id_loai_cong FROM loai_cong_sac WHERE id_loai_cong = $1',
        [id_loai_cong]
      );

      if (connectorCheck.rows.length === 0) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_CONNECTOR_TYPE);
      }
    }

    // If setting as main vehicle, unset other main vehicles
    if (la_xe_chinh === true) {
      await client.query(
        'UPDATE phuong_tien SET la_xe_chinh = FALSE WHERE id_nguoi_dung = $1 AND id_phuong_tien != $2',
        [userId, vehicleId]
      );
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (id_loai_cong !== undefined) {
      updates.push(`id_loai_cong = $${paramCount++}`);
      values.push(id_loai_cong);
    }
    if (hang_xe !== undefined) {
      updates.push(`hang_xe = $${paramCount++}`);
      values.push(hang_xe);
    }
    if (dong_xe !== undefined) {
      updates.push(`dong_xe = $${paramCount++}`);
      values.push(dong_xe);
    }
    if (bien_so !== undefined) {
      updates.push(`bien_so = $${paramCount++}`);
      values.push(bien_so);
    }
    if (mau_xe !== undefined) {
      updates.push(`mau_xe = $${paramCount++}`);
      values.push(mau_xe);
    }
    if (nam_san_xuat !== undefined) {
      updates.push(`nam_san_xuat = $${paramCount++}`);
      values.push(nam_san_xuat);
    }
    if (dung_luong_pin_kwh !== undefined) {
      updates.push(`dung_luong_pin_kwh = $${paramCount++}`);
      values.push(dung_luong_pin_kwh);
    }
    if (cong_suat_sac_toi_da !== undefined) {
      updates.push(`cong_suat_sac_toi_da = $${paramCount++}`);
      values.push(cong_suat_sac_toi_da);
    }
    if (la_xe_chinh !== undefined) {
      updates.push(`la_xe_chinh = $${paramCount++}`);
      values.push(la_xe_chinh);
    }

    updates.push(`ngay_cap_nhat = NOW()`);

    values.push(vehicleId, userId);

    const updateQuery = `
      UPDATE phuong_tien
      SET ${updates.join(', ')}
      WHERE id_phuong_tien = $${paramCount++} AND id_nguoi_dung = $${paramCount++}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    await client.query('COMMIT');

    logger.info(`Vehicle ${vehicleId} updated by user ${userId}`);
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error in updateVehicle service:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Xóa phương tiện (soft delete)
 */
export const deleteVehicle = async (vehicleId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check ownership and if it's main vehicle
    const checkQuery = 'SELECT la_xe_chinh FROM phuong_tien WHERE id_phuong_tien = $1 AND id_nguoi_dung = $2 AND trang_thai = $3';
    const checkResult = await client.query(checkQuery, [vehicleId, userId, VEHICLE_STATUS.ACTIVE]);

    if (checkResult.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    if (checkResult.rows[0].la_xe_chinh) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.CANNOT_DELETE_MAIN_VEHICLE);
    }

    // Soft delete
    const deleteQuery = `
      UPDATE phuong_tien
      SET trang_thai = $1, ngay_cap_nhat = NOW()
      WHERE id_phuong_tien = $2 AND id_nguoi_dung = $3
      RETURNING id_phuong_tien
    `;

    await client.query(deleteQuery, [VEHICLE_STATUS.INACTIVE, vehicleId, userId]);

    await client.query('COMMIT');

    logger.info(`Vehicle ${vehicleId} deleted by user ${userId}`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error in deleteVehicle service:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Cập nhật SOC (State of Charge)
 */
export const updateSOC = async (vehicleId, userId, soc) => {
  try {
    // Check ownership
    const checkQuery = 'SELECT id_phuong_tien FROM phuong_tien WHERE id_phuong_tien = $1 AND id_nguoi_dung = $2 AND trang_thai = $3';
    const checkResult = await pool.query(checkQuery, [vehicleId, userId, VEHICLE_STATUS.ACTIVE]);

    if (checkResult.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    // Update SOC
    const updateQuery = `
      UPDATE phuong_tien
      SET soc_hien_tai = $1, cap_nhat_soc = NOW()
      WHERE id_phuong_tien = $2 AND id_nguoi_dung = $3
      RETURNING id_phuong_tien, soc_hien_tai, cap_nhat_soc
    `;

    const result = await pool.query(updateQuery, [soc, vehicleId, userId]);

    logger.info(`SOC updated for vehicle ${vehicleId}: ${soc}%`);
    return result.rows[0];
  } catch (error) {
    logger.error('Error in updateSOC service:', error);
    throw error;
  }
};

/**
 * Đặt xe làm xe chính
 */
export const setMainVehicle = async (vehicleId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check ownership
    const checkQuery = 'SELECT id_phuong_tien FROM phuong_tien WHERE id_phuong_tien = $1 AND id_nguoi_dung = $2 AND trang_thai = $3';
    const checkResult = await client.query(checkQuery, [vehicleId, userId, VEHICLE_STATUS.ACTIVE]);

    if (checkResult.rows.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VEHICLE_NOT_FOUND);
    }

    // Unset all main vehicles for this user
    await client.query(
      'UPDATE phuong_tien SET la_xe_chinh = FALSE WHERE id_nguoi_dung = $1',
      [userId]
    );

    // Set this vehicle as main
    const updateQuery = `
      UPDATE phuong_tien
      SET la_xe_chinh = TRUE, ngay_cap_nhat = NOW()
      WHERE id_phuong_tien = $1 AND id_nguoi_dung = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, [vehicleId, userId]);

    await client.query('COMMIT');

    logger.info(`Vehicle ${vehicleId} set as main for user ${userId}`);
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error in setMainVehicle service:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Lấy danh sách loại cổng sạc
 */
export const getConnectorTypes = async () => {
  try {
    const query = 'SELECT * FROM loai_cong_sac ORDER BY ma_cong';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    logger.error('Error in getConnectorTypes service:', error);
    throw error;
  }
};


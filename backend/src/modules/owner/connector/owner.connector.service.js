import { pool } from '../../../config/db.js';
import logger from '../../../utils/logger.js';

/**
 * Owner Connector Service
 * Handles connector (cổng sạc) management for station owners
 */

/**
 * Get all connectors for a station (with ownership check)
 * @param {number} userId - Owner user ID
 * @param {number} stationId - Station ID
 * @returns {Array} List of connectors
 */
export async function getStationConnectors(userId, stationId) {
  try {
    // First verify ownership
    const ownershipCheck = `
      SELECT ts.id_tram
      FROM tram_sac ts
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ts.id_tram = $1 AND dn.id_chu_so_huu = $2
    `;

    const ownerResult = await pool.query(ownershipCheck, [stationId, userId]);

    if (ownerResult.rows.length === 0) {
      throw new Error('Không có quyền truy cập trạm này');
    }

    // Get connectors
    const query = `
      SELECT 
        cs.id_cong_sac,
        cs.ma_cong_tram,
        cs.id_loai_cong,
        cs.cong_suat_kwh,
        cs.trang_thai,
        cs.ngay_tao,
        lcs.ma_cong,
        lcs.mo_ta as mo_ta_loai_cong
      FROM cong_sac cs
      JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      WHERE cs.id_tram = $1
      ORDER BY cs.ngay_tao DESC
    `;

    const result = await pool.query(query, [stationId]);
    return result.rows;
  } catch (error) {
    logger.error('Get station connectors error:', error);
    throw error;
  }
}

/**
 * Get available connector types (loai_cong_sac)
 * @returns {Array} List of connector types
 */
export async function getConnectorTypes() {
  try {
    const query = `
      SELECT id_loai_cong, ma_cong, mo_ta
      FROM loai_cong_sac
      ORDER BY ma_cong
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    logger.error('Get connector types error:', error);
    throw error;
  }
}

/**
 * Create new connector
 * @param {number} userId - Owner user ID
 * @param {number} stationId - Station ID
 * @param {Object} connectorData - Connector data
 * @returns {Object} Created connector
 */
export async function createConnector(userId, stationId, connectorData) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify ownership
    const ownershipCheck = `
      SELECT ts.id_tram, ts.ten_tram
      FROM tram_sac ts
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ts.id_tram = $1 AND dn.id_chu_so_huu = $2
    `;

    const ownerResult = await client.query(ownershipCheck, [stationId, userId]);

    if (ownerResult.rows.length === 0) {
      throw new Error('Không có quyền thêm cổng sạc cho trạm này');
    }

    const station = ownerResult.rows[0];

    // Check if ma_cong_tram already exists for this station
    const checkDuplicate = `
      SELECT id_cong_sac
      FROM cong_sac
      WHERE id_tram = $1 AND ma_cong_tram = $2
    `;

    const duplicateResult = await client.query(checkDuplicate, [
      stationId,
      connectorData.ma_cong_tram,
    ]);

    if (duplicateResult.rows.length > 0) {
      throw new Error(
        `Mã cổng "${connectorData.ma_cong_tram}" đã tồn tại tại trạm này`
      );
    }

    // Insert connector
    const insertQuery = `
      INSERT INTO cong_sac (
        id_tram,
        ma_cong_tram,
        id_loai_cong,
        cong_suat_kwh,
        trang_thai
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const {
      ma_cong_tram,
      id_loai_cong,
      cong_suat_kwh,
      trang_thai = 'trong',
    } = connectorData;

    const result = await client.query(insertQuery, [
      stationId,
      ma_cong_tram,
      id_loai_cong,
      parseFloat(cong_suat_kwh),
      trang_thai,
    ]);

    await client.query('COMMIT');

    logger.info(
      `Connector created: ${result.rows[0].id_cong_sac} for station ${station.ten_tram}`
    );

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create connector error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update connector
 * @param {number} userId - Owner user ID
 * @param {number} connectorId - Connector ID
 * @param {Object} connectorData - Updated data
 * @returns {Object} Updated connector
 */
export async function updateConnector(userId, connectorId, connectorData) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify ownership
    const ownershipCheck = `
      SELECT cs.id_cong_sac, ts.id_tram
      FROM cong_sac cs
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE cs.id_cong_sac = $1 AND dn.id_chu_so_huu = $2
    `;

    const ownerResult = await client.query(ownershipCheck, [
      connectorId,
      userId,
    ]);

    if (ownerResult.rows.length === 0) {
      throw new Error('Không có quyền chỉnh sửa cổng sạc này');
    }

    const stationId = ownerResult.rows[0].id_tram;

    // Check for duplicate ma_cong_tram (if being updated)
    if (connectorData.ma_cong_tram) {
      const checkDuplicate = `
        SELECT id_cong_sac
        FROM cong_sac
        WHERE id_tram = $1 AND ma_cong_tram = $2 AND id_cong_sac != $3
      `;

      const duplicateResult = await client.query(checkDuplicate, [
        stationId,
        connectorData.ma_cong_tram,
        connectorId,
      ]);

      if (duplicateResult.rows.length > 0) {
        throw new Error(
          `Mã cổng "${connectorData.ma_cong_tram}" đã tồn tại tại trạm này`
        );
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (connectorData.ma_cong_tram !== undefined) {
      updates.push(`ma_cong_tram = $${paramIndex++}`);
      values.push(connectorData.ma_cong_tram);
    }

    if (connectorData.id_loai_cong !== undefined) {
      updates.push(`id_loai_cong = $${paramIndex++}`);
      values.push(connectorData.id_loai_cong);
    }

    if (connectorData.cong_suat_kwh !== undefined) {
      updates.push(`cong_suat_kwh = $${paramIndex++}`);
      values.push(parseFloat(connectorData.cong_suat_kwh));
    }

    if (connectorData.trang_thai !== undefined) {
      updates.push(`trang_thai = $${paramIndex++}`);
      values.push(connectorData.trang_thai);
    }

    if (updates.length === 0) {
      throw new Error('Không có dữ liệu để cập nhật');
    }

    values.push(connectorId);

    const updateQuery = `
      UPDATE cong_sac
      SET ${updates.join(', ')}
      WHERE id_cong_sac = $${paramIndex}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    await client.query('COMMIT');

    logger.info(`Connector updated: ${connectorId}`);

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update connector error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete connector
 * @param {number} userId - Owner user ID
 * @param {number} connectorId - Connector ID
 * @returns {boolean} Success
 */
export async function deleteConnector(userId, connectorId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify ownership
    const ownershipCheck = `
      SELECT cs.id_cong_sac, cs.trang_thai
      FROM cong_sac cs
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE cs.id_cong_sac = $1 AND dn.id_chu_so_huu = $2
    `;

    const ownerResult = await client.query(ownershipCheck, [
      connectorId,
      userId,
    ]);

    if (ownerResult.rows.length === 0) {
      throw new Error('Không có quyền xóa cổng sạc này');
    }

    const connector = ownerResult.rows[0];

    // Check if connector is currently in use
    if (connector.trang_thai === 'dang_su_dung') {
      throw new Error('Không thể xóa cổng đang được sử dụng');
    }

    // Check for active bookings
    const activeBookingsCheck = `
      SELECT COUNT(*) as count
      FROM dat_cho
      WHERE id_cong_sac = $1 
        AND trang_thai IN ('cho_xac_nhan', 'da_xac_nhan')
    `;

    const bookingsResult = await client.query(activeBookingsCheck, [
      connectorId,
    ]);

    if (parseInt(bookingsResult.rows[0].count) > 0) {
      throw new Error('Không thể xóa cổng có đặt chỗ đang hoạt động');
    }

    // Delete connector
    const deleteQuery = `
      DELETE FROM cong_sac
      WHERE id_cong_sac = $1
    `;

    await client.query(deleteQuery, [connectorId]);

    await client.query('COMMIT');

    logger.info(`Connector deleted: ${connectorId}`);

    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Delete connector error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Change connector status
 * @param {number} userId - Owner user ID
 * @param {number} connectorId - Connector ID
 * @param {string} status - New status (trong/dang_su_dung/bao_tri)
 * @returns {Object} Updated connector
 */
export async function changeConnectorStatus(userId, connectorId, status) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify ownership
    const ownershipCheck = `
      SELECT cs.id_cong_sac, cs.trang_thai
      FROM cong_sac cs
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE cs.id_cong_sac = $1 AND dn.id_chu_so_huu = $2
    `;

    const ownerResult = await client.query(ownershipCheck, [
      connectorId,
      userId,
    ]);

    if (ownerResult.rows.length === 0) {
      throw new Error('Không có quyền thay đổi trạng thái cổng sạc này');
    }

    // Validate status
    const validStatuses = ['trong', 'dang_su_dung', 'bao_tri'];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`
      );
    }

    // Update status
    const updateQuery = `
      UPDATE cong_sac
      SET trang_thai = $1
      WHERE id_cong_sac = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, [status, connectorId]);

    await client.query('COMMIT');

    logger.info(`Connector status changed: ${connectorId} -> ${status}`);

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Change connector status error:', error);
    throw error;
  } finally {
    client.release();
  }
}

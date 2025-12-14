import { pool } from '../../../config/db.js';

/**
 * Owner Station Service
 * Handles station management for business owners
 */

/**
 * Get all stations owned by this business owner
 * @param {number} userId - Owner user ID
 * @returns {Array} List of stations
 */
export async function getOwnerStations(userId) {
  try {
    const query = `
      SELECT 
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi,
        ts.kinh_do,
        ts.vi_do,
        ts.trang_thai_duyet,
        ts.ly_do_tu_choi,
        ts.ngay_tao,
        ts.ngay_duyet,
        dn.ten_doanh_nghiep,
        dn.id_doanh_nghiep,
        -- Current price
        COALESCE(lsg.gia_kwh, 0) as gia_kwh,
        COALESCE(lsg.phi_cho_phut, 0) as phi_cho_phut,
        -- Stats
        COUNT(cs.id_cong_sac) as tong_cong,
        COUNT(CASE WHEN cs.trang_thai = 'trong' THEN 1 END) as cong_trong,
        COUNT(CASE WHEN cs.trang_thai = 'dang_su_dung' THEN 1 END) as cong_dang_dung,
        COUNT(CASE WHEN cs.trang_thai = 'bao_tri' THEN 1 END) as cong_bao_tri,
        -- Ratings
        COALESCE(AVG(dg.diem_so), 0) as diem_trung_binh,
        COUNT(DISTINCT dg.id_danh_gia) as so_danh_gia
      FROM tram_sac ts
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
      LEFT JOIN lich_su_gia_tram lsg 
        ON lsg.id_tram = ts.id_tram
        AND lsg.trang_thai = 'active'
        AND NOW() BETWEEN lsg.hieu_luc_tu AND COALESCE(lsg.hieu_luc_den, '9999-12-31')
      LEFT JOIN danh_gia dg ON dg.id_tram = ts.id_tram
      WHERE dn.id_chu_so_huu = $1
      GROUP BY 
        ts.id_tram, 
        dn.ten_doanh_nghiep, 
        dn.id_doanh_nghiep, 
        lsg.gia_kwh, 
        lsg.phi_cho_phut
      ORDER BY ts.ngay_tao DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Get owner stations error:', error);
    throw error;
  }
}

/**
 * Get single station detail for owner
 * @param {number} stationId - Station ID
 * @param {number} userId - Owner user ID
 * @returns {Object|null} Station details with stats
 */
export async function getOwnerStation(stationId, userId) {
  try {
    // Main station info
    const stationQuery = `
      SELECT 
        ts.*,
        dn.ten_doanh_nghiep,
        dn.id_doanh_nghiep,
        COALESCE(lsg.gia_kwh, 0) as gia_kwh,
        COALESCE(lsg.phi_cho_phut, 0) as phi_cho_phut,
        lsg.hieu_luc_tu as gia_hieu_luc_tu,
        lsg.hieu_luc_den as gia_hieu_luc_den,
        u.ho_ten as nguoi_duyet_ten
      FROM tram_sac ts
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      LEFT JOIN lich_su_gia_tram lsg 
        ON lsg.id_tram = ts.id_tram
        AND lsg.trang_thai = 'active'
        AND NOW() BETWEEN lsg.hieu_luc_tu AND COALESCE(lsg.hieu_luc_den, '9999-12-31')
      LEFT JOIN nguoi_dung u ON u.id_nguoi_dung = ts.id_nguoi_duyet
      WHERE ts.id_tram = $1 AND dn.id_chu_so_huu = $2
    `;
    
    const stationResult = await pool.query(stationQuery, [stationId, userId]);
    
    if (stationResult.rows.length === 0) {
      return null;
    }

    const station = stationResult.rows[0];

    // Get connector stats
    const connectorStatsQuery = `
      SELECT 
        COUNT(*) as tong_cong,
        COUNT(CASE WHEN cs.trang_thai = 'trong' THEN 1 END) as cong_trong,
        COUNT(CASE WHEN cs.trang_thai = 'dang_su_dung' THEN 1 END) as cong_dang_dung,
        COUNT(CASE WHEN cs.trang_thai = 'bao_tri' THEN 1 END) as cong_bao_tri
      FROM cong_sac cs
      WHERE cs.id_tram = $1
    `;
    const connectorStats = await pool.query(connectorStatsQuery, [stationId]);

    // Get booking stats (last 30 days)
    const bookingStatsQuery = `
      SELECT 
        COUNT(*) as tong_dat_cho,
        COUNT(CASE WHEN dc.trang_thai = 'cho_xac_nhan' THEN 1 END) as cho_xac_nhan,
        COUNT(CASE WHEN dc.trang_thai = 'da_xac_nhan' THEN 1 END) as da_xac_nhan,
        COUNT(CASE WHEN dc.trang_thai = 'hoan_thanh' THEN 1 END) as hoan_thanh,
        COUNT(CASE WHEN dc.trang_thai = 'huy' THEN 1 END) as da_huy
      FROM dat_cho dc
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      WHERE cs.id_tram = $1
        AND dc.ngay_tao >= NOW() - INTERVAL '30 days'
    `;
    const bookingStats = await pool.query(bookingStatsQuery, [stationId]);

    // Get session stats (last 30 days)
    const sessionStatsQuery = `
      SELECT 
        COUNT(*) as tong_phien,
        COUNT(CASE WHEN ps.trang_thai = 'dang_sac' THEN 1 END) as dang_sac,
        COALESCE(SUM(ps.dien_nang_kwh), 0) as tong_dien_tieu_thu
      FROM phien_sac ps
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      WHERE cs.id_tram = $1
        AND ps.thoi_gian_bat_dau >= NOW() - INTERVAL '30 days'
    `;
    const sessionStats = await pool.query(sessionStatsQuery, [stationId]);

    // Get revenue stats (last 30 days)
    const revenueStatsQuery = `
      SELECT 
        COALESCE(SUM(so_tien), 0) as doanh_thu_30_ngay,
        COUNT(*) as so_giao_dich
      FROM thanh_toan tt
      JOIN phien_sac ps ON ps.id_phien_sac = tt.id_phien_sac
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      WHERE cs.id_tram = $1
        AND tt.trang_thai = 'success'
        AND tt.ngay_thanh_toan >= NOW() - INTERVAL '30 days'
    `;
    const revenueStats = await pool.query(revenueStatsQuery, [stationId]);

    // Get ratings
    const ratingStatsQuery = `
      SELECT 
        COALESCE(AVG(diem_so), 0) as diem_trung_binh,
        COUNT(*) as so_danh_gia,
        COUNT(CASE WHEN diem_so = 5 THEN 1 END) as sao_5,
        COUNT(CASE WHEN diem_so = 4 THEN 1 END) as sao_4,
        COUNT(CASE WHEN diem_so = 3 THEN 1 END) as sao_3,
        COUNT(CASE WHEN diem_so = 2 THEN 1 END) as sao_2,
        COUNT(CASE WHEN diem_so = 1 THEN 1 END) as sao_1
      FROM danh_gia
      WHERE id_tram = $1
    `;
    const ratingStats = await pool.query(ratingStatsQuery, [stationId]);

    // Combine all data
    return {
      ...station,
      stats: {
        connectors: connectorStats.rows[0],
        bookings: bookingStats.rows[0],
        sessions: sessionStats.rows[0],
        revenue: revenueStats.rows[0],
        ratings: ratingStats.rows[0]
      }
    };
  } catch (error) {
    console.error('Get owner station error:', error);
    throw error;
  }
}

/**
 * Create new station
 * @param {number} userId - Owner user ID
 * @param {Object} stationData - Station data
 * @returns {Object} Created station
 */
export async function createStation(userId, stationData) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get or create business for this owner
    const businessQuery = `
      SELECT id_doanh_nghiep 
      FROM doanh_nghiep 
      WHERE id_chu_so_huu = $1
      LIMIT 1
    `;
    let businessResult = await client.query(businessQuery, [userId]);

    let businessId;
    if (businessResult.rows.length === 0) {
      // Create default business
      const createBusinessQuery = `
        INSERT INTO doanh_nghiep (id_chu_so_huu, ten_doanh_nghiep, trang_thai)
        VALUES ($1, $2, 'active')
        RETURNING id_doanh_nghiep
      `;
      const newBusiness = await client.query(createBusinessQuery, [
        userId,
        stationData.ten_doanh_nghiep || 'Doanh nghiệp mới',
      ]);
      businessId = newBusiness.rows[0].id_doanh_nghiep;
    } else {
      businessId = businessResult.rows[0].id_doanh_nghiep;
    }

    // Create station
    const { ten_tram, dia_chi, kinh_do, vi_do, phut_den_tre = 5 } = stationData;

    const insertStationQuery = `
      INSERT INTO tram_sac (
        id_doanh_nghiep,
        ten_tram,
        dia_chi,
        kinh_do,
        vi_do,
        phut_den_tre,
        trang_thai_duyet
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `;

    const stationResult = await client.query(insertStationQuery, [
      businessId,
      ten_tram,
      dia_chi,
      parseFloat(kinh_do),
      parseFloat(vi_do),
      phut_den_tre,
    ]);

    const station = stationResult.rows[0];

    // Create initial price if provided
    if (stationData.gia_kwh) {
      const priceQuery = `
        INSERT INTO lich_su_gia_tram (
          id_tram,
          gia_kwh,
          phi_cho_phut,
          hieu_luc_tu,
          trang_thai
        ) VALUES ($1, $2, $3, NOW(), 'active')
      `;
      await client.query(priceQuery, [
        station.id_tram,
        parseFloat(stationData.gia_kwh),
        parseFloat(stationData.phi_cho_phut || 0),
      ]);
    }

    await client.query('COMMIT');

    console.log(`✅ Station created: #${station.id_tram}`);
    return station;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create station error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update station
 * @param {number} stationId - Station ID
 * @param {number} userId - Owner user ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated station
 */
export async function updateStation(stationId, userId, updates) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify ownership
    const ownershipCheck = `
      SELECT ts.id_tram 
      FROM tram_sac ts
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ts.id_tram = $1 AND dn.id_chu_so_huu = $2
    `;
    const ownershipResult = await client.query(ownershipCheck, [
      stationId,
      userId,
    ]);

    if (ownershipResult.rows.length === 0) {
      throw new Error('Không có quyền chỉnh sửa trạm này');
    }

    // Build update query dynamically
    const allowedFields = [
      'ten_tram',
      'dia_chi',
      'kinh_do',
      'vi_do',
      'phut_den_tre',
    ];
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex++}`);
        values.push(updates[field]);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('Không có trường nào để cập nhật');
    }

    values.push(stationId);

    const updateQuery = `
      UPDATE tram_sac 
      SET ${updateFields.join(', ')}
      WHERE id_tram = $${paramIndex}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    // Update price if provided
    if (updates.gia_kwh !== undefined || updates.phi_cho_phut !== undefined) {
      // Expire old price
      await client.query(
        `UPDATE lich_su_gia_tram 
         SET hieu_luc_den = NOW(), trang_thai = 'inactive'
         WHERE id_tram = $1 AND trang_thai = 'active'`,
        [stationId]
      );

      // Insert new price
      await client.query(
        `INSERT INTO lich_su_gia_tram (id_tram, gia_kwh, phi_cho_phut, hieu_luc_tu, trang_thai)
         VALUES ($1, $2, $3, NOW(), 'active')`,
        [
          stationId,
          parseFloat(updates.gia_kwh || 0),
          parseFloat(updates.phi_cho_phut || 0),
        ]
      );
    }

    await client.query('COMMIT');

    console.log(`✅ Station updated: #${stationId}`);
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update station error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete station (soft delete - set to rejected status)
 * @param {number} stationId - Station ID
 * @param {number} userId - Owner user ID
 * @returns {boolean} Success
 */
export async function deleteStation(stationId, userId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify ownership
    const ownershipCheck = `
      SELECT ts.id_tram 
      FROM tram_sac ts
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ts.id_tram = $1 AND dn.id_chu_so_huu = $2
    `;
    const ownershipResult = await client.query(ownershipCheck, [
      stationId,
      userId,
    ]);

    if (ownershipResult.rows.length === 0) {
      throw new Error('Không có quyền xóa trạm này');
    }

    // Check for active bookings
    const bookingCheck = `
      SELECT COUNT(*) as count
      FROM dat_cho dc
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      WHERE cs.id_tram = $1 
        AND dc.trang_thai IN ('cho_xac_nhan', 'da_xac_nhan', 'dang_su_dung')
    `;
    const bookingResult = await client.query(bookingCheck, [stationId]);

    if (parseInt(bookingResult.rows[0].count) > 0) {
      throw new Error('Không thể xóa trạm có đặt chỗ đang hoạt động');
    }

    // Soft delete: Set status to rejected
    await client.query(
      `UPDATE tram_sac 
       SET trang_thai_duyet = 'rejected',
           ly_do_tu_choi = 'Đã xóa bởi chủ sở hữu'
       WHERE id_tram = $1`,
      [stationId]
    );

    // Set all connectors to maintenance
    await client.query(
      `UPDATE cong_sac 
       SET trang_thai = 'bao_tri'
       WHERE id_tram = $1`,
      [stationId]
    );

    await client.query('COMMIT');

    console.log(`✅ Station deleted: #${stationId}`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete station error:', error);
    throw error;
  } finally {
    client.release();
  }
}

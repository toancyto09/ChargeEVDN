import { pool } from '../../../config/db.js';

/**
 * Admin Station Service
 * Manage station approval/rejection
 */
class AdminStationService {
  /**
   * Get all stations for admin review
   * @param {object} filters - Filter options (status, limit, offset)
   * @returns {Promise<object>} Stations list with pagination
   */
  async getStations(filters = {}) {
    const { 
      status = 'all', // 'all', 'pending', 'approved', 'rejected'
      limit = 50, 
      offset = 0 
    } = filters;

    // Build WHERE conditions
    let whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (status !== 'all') {
      whereConditions.push(`ts.trang_thai_duyet = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get stations with business info
    const query = `
      SELECT 
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi,
        ts.kinh_do,
        ts.vi_do,
        ts.trang_thai_duyet,
        ts.id_nguoi_duyet,
        ts.ly_do_tu_choi,
        ts.ngay_duyet,
        ts.phut_den_tre,
        ts.ngay_tao,
        -- Business info
        dn.id_doanh_nghiep,
        dn.ten_doanh_nghiep,
        dn.email_lien_he,
        dn.so_dien_thoai,
        -- Owner info
        nd.ho_ten as ten_chu_so_huu,
        nd.email as email_chu_so_huu,
        -- Connector count
        COUNT(DISTINCT cs.id_cong_sac) as so_cong_sac,
        -- Current price
        COALESCE(lsg.gia_kwh, 0) as gia_kwh
        
      FROM tram_sac ts
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = dn.id_chu_so_huu
      LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
      LEFT JOIN lich_su_gia_tram lsg 
        ON lsg.id_tram = ts.id_tram
        AND lsg.trang_thai = 'active'
        AND NOW() BETWEEN lsg.hieu_luc_tu AND COALESCE(lsg.hieu_luc_den, '9999-12-31')
      
      ${whereClause}
      GROUP BY 
        ts.id_tram,
        dn.id_doanh_nghiep,
        dn.ten_doanh_nghiep,
        dn.email_lien_he,
        dn.so_dien_thoai,
        nd.ho_ten,
        nd.email,
        lsg.gia_kwh
      ORDER BY 
        CASE ts.trang_thai_duyet
          WHEN 'pending' THEN 1
          WHEN 'rejected' THEN 2
          WHEN 'approved' THEN 3
        END,
        ts.ngay_tao DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(ts.id_tram) as total
      FROM tram_sac ts
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params.slice(0, paramIndex - 1));

    return {
      stations: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    };
  }

  /**
   * Get station statistics for admin
   * @returns {Promise<object>} Statistics
   */
  async getStationStats() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_stations,
        COUNT(CASE WHEN trang_thai_duyet = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN trang_thai_duyet = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN trang_thai_duyet = 'rejected' THEN 1 END) as rejected
      FROM tram_sac
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    return {
      total_stations: parseInt(stats.total_stations) || 0,
      by_status: {
        pending: parseInt(stats.pending) || 0,
        approved: parseInt(stats.approved) || 0,
        rejected: parseInt(stats.rejected) || 0,
      },
    };
  }

  /**
   * Get station detail by ID
   * @param {number} stationId - Station ID
   * @returns {Promise<object>} Station details
   */
  async getStationDetail(stationId) {
    const query = `
      SELECT 
        ts.*,
        -- Business info
        dn.ten_doanh_nghiep,
        dn.dia_chi as dia_chi_doanh_nghiep,
        dn.email_lien_he,
        dn.so_dien_thoai,
        -- Owner info
        nd.ho_ten as ten_chu_so_huu,
        nd.email as email_chu_so_huu,
        nd.so_dien_thoai as sdt_chu_so_huu,
        -- Approver info (if approved/rejected)
        approver.ho_ten as ten_nguoi_duyet,
        -- Current price
        COALESCE(lsg.gia_kwh, 0) as gia_kwh,
        COALESCE(lsg.phi_cho_phut, 0) as phi_cho_phut,
        -- Connector info
        json_agg(
          DISTINCT jsonb_build_object(
            'id_cong_sac', cs.id_cong_sac,
            'ma_cong_tram', cs.ma_cong_tram,
            'loai_cong', lcs.ma_cong,
            'cong_suat_kwh', cs.cong_suat_kwh,
            'trang_thai', cs.trang_thai
          )
        ) FILTER (WHERE cs.id_cong_sac IS NOT NULL) as connectors
        
      FROM tram_sac ts
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = dn.id_chu_so_huu
      LEFT JOIN nguoi_dung approver ON approver.id_nguoi_dung = ts.id_nguoi_duyet
      LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
      LEFT JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      LEFT JOIN lich_su_gia_tram lsg 
        ON lsg.id_tram = ts.id_tram
        AND lsg.trang_thai = 'active'
        AND NOW() BETWEEN lsg.hieu_luc_tu AND COALESCE(lsg.hieu_luc_den, '9999-12-31')
      
      WHERE ts.id_tram = $1
      GROUP BY 
        ts.id_tram,
        dn.ten_doanh_nghiep,
        dn.dia_chi,
        dn.email_lien_he,
        dn.so_dien_thoai,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        approver.ho_ten,
        lsg.gia_kwh,
        lsg.phi_cho_phut
    `;

    const result = await pool.query(query, [stationId]);

    if (result.rows.length === 0) {
      throw new Error('Không tìm thấy trạm sạc');
    }

    return result.rows[0];
  }

  /**
   * Approve station
   * @param {number} stationId - Station ID
   * @param {number} adminId - Admin user ID
   * @returns {Promise<object>} Updated station
   */
  async approveStation(stationId, adminId) {
    const query = `
      UPDATE tram_sac
      SET 
        trang_thai_duyet = 'approved',
        id_nguoi_duyet = $2,
        ngay_duyet = NOW(),
        ly_do_tu_choi = NULL
      WHERE id_tram = $1
      RETURNING *
    `;

    const result = await pool.query(query, [stationId, adminId]);

    if (result.rows.length === 0) {
      throw new Error('Không tìm thấy trạm sạc');
    }

    return result.rows[0];
  }

  /**
   * Reject station
   * @param {number} stationId - Station ID
   * @param {number} adminId - Admin user ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<object>} Updated station
   */
  async rejectStation(stationId, adminId, reason) {
    if (!reason || reason.trim() === '') {
      throw new Error('Vui lòng nhập lý do từ chối');
    }

    const query = `
      UPDATE tram_sac
      SET 
        trang_thai_duyet = 'rejected',
        id_nguoi_duyet = $2,
        ngay_duyet = NOW(),
        ly_do_tu_choi = $3
      WHERE id_tram = $1
      RETURNING *
    `;

    const result = await pool.query(query, [stationId, adminId, reason.trim()]);

    if (result.rows.length === 0) {
      throw new Error('Không tìm thấy trạm sạc');
    }

    return result.rows[0];
  }
}

export default new AdminStationService();

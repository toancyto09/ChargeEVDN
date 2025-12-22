import { pool } from '../../../config/db.js';

/**
 * Owner Session Service
 * Manage charging sessions for owner's stations
 */
class OwnerSessionService {
  /**
   * Get all sessions for owner's stations
   * @param {number} userId - Owner's user ID
   * @param {object} filters - Filter options
   * @returns {Promise<object>} Sessions list with pagination
   */
  async getOwnerSessions(userId, filters = {}) {
    const { 
      stationId, 
      status, 
      startDate, 
      endDate,
      limit = 50, 
      offset = 0 
    } = filters;

    // Build WHERE conditions
    let whereConditions = ['dn.id_chu_so_huu = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (stationId) {
      whereConditions.push(`ts.id_tram = $${paramIndex}`);
      params.push(parseInt(stationId));
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`ps.trang_thai = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`ps.thoi_gian_bat_dau >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`ps.thoi_gian_bat_dau <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get sessions with details
    const query = `
      SELECT 
        ps.id_phien_sac,
        ps.thoi_gian_bat_dau,
        ps.thoi_gian_ket_thuc,
        ps.trang_thai,
        ps.soc_truoc,
        ps.soc_sau,
        ps.dien_nang_kwh,
        ps.don_gia_kwh,
        ps.phi_cho_phut,
        ps.so_phut_cho,
        (ps.dien_nang_kwh * ps.don_gia_kwh + ps.phi_cho_phut * ps.so_phut_cho) as tong_tien,
        
        -- User info (from booking)
        nd.id_nguoi_dung,
        nd.ho_ten as ten_nguoi_dung,
        nd.email as email_nguoi_dung,
        nd.so_dien_thoai as sdt_nguoi_dung,
        
        -- Vehicle info
        pv.hang_xe,
        pv.dong_xe,
        pv.bien_so,
        
        -- Station info
        ts.id_tram,
        ts.ten_tram,
        
        -- Connector info
        cs.id_cong_sac,
        cs.ma_cong_tram,
        lcs.ma_cong as loai_cong,
        
        -- Booking info (if exists)
        dc.id_dat_cho,
        dc.ma_xac_nhan,
        
        -- Payment info (if exists)
        tt.id_thanh_toan,
        tt.trang_thai as trang_thai_thanh_toan,
        tt.phuong_thuc as phuong_thuc_thanh_toan
        
      FROM phien_sac ps
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      LEFT JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
      LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = dc.id_nguoi_dung
      LEFT JOIN phuong_tien pv ON pv.id_phuong_tien = dc.id_phuong_tien
      LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac
      
      WHERE ${whereClause}
      ORDER BY ps.thoi_gian_bat_dau DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT ps.id_phien_sac) as total
      FROM phien_sac ps
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params.slice(0, paramIndex - 1));

    return {
      sessions: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    };
  }

  /**
   * Get session statistics for owner
   * @param {number} userId - Owner's user ID
   * @param {object} filters - Filter options (stationId, startDate, endDate)
   * @returns {Promise<object>} Statistics
   */
  async getSessionStats(userId, filters = {}) {
    const { stationId, startDate, endDate } = filters;

    let whereConditions = ['dn.id_chu_so_huu = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (stationId) {
      whereConditions.push(`ts.id_tram = $${paramIndex}`);
      params.push(parseInt(stationId));
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`ps.thoi_gian_bat_dau >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`ps.thoi_gian_bat_dau <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const statsQuery = `
      SELECT 
        COUNT(ps.id_phien_sac) as total_sessions,
        
        COUNT(CASE WHEN ps.trang_thai = 'dang_sac' THEN 1 END) as dang_sac,
        COUNT(CASE WHEN ps.trang_thai = 'hoan_thanh' THEN 1 END) as hoan_thanh,
        COUNT(CASE WHEN ps.trang_thai = 'loi' THEN 1 END) as loi,
        COUNT(CASE WHEN ps.trang_thai = 'huy' THEN 1 END) as huy,
        
        COALESCE(SUM(ps.dien_nang_kwh), 0) as tong_dien_nang,
        COALESCE(SUM(ps.dien_nang_kwh * ps.don_gia_kwh + ps.phi_cho_phut * ps.so_phut_cho), 0) as tong_doanh_thu,
        COALESCE(AVG(ps.dien_nang_kwh), 0) as trung_binh_kwh,
        
        COUNT(DISTINCT dc.id_nguoi_dung) as so_khach_hang_unique
        
      FROM phien_sac ps
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      LEFT JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
      WHERE ${whereClause}
    `;

    const statsResult = await pool.query(statsQuery, params.slice(0, paramIndex - 1));
    const stats = statsResult.rows[0];

    return {
      total_sessions: parseInt(stats.total_sessions) || 0,
      by_status: {
        dang_sac: parseInt(stats.dang_sac) || 0,
        hoan_thanh: parseInt(stats.hoan_thanh) || 0,
        loi: parseInt(stats.loi) || 0,
        huy: parseInt(stats.huy) || 0,
      },
      total_energy: parseFloat(stats.tong_dien_nang) || 0,
      total_revenue: parseFloat(stats.tong_doanh_thu) || 0,
      avg_kwh: parseFloat(stats.trung_binh_kwh) || 0,
      unique_customers: parseInt(stats.so_khach_hang_unique) || 0,
    };
  }

  /**
   * Get session detail by ID
   * @param {number} sessionId - Session ID
   * @param {number} userId - Owner's user ID
   * @returns {Promise<object>} Session details
   */
  async getSessionDetail(sessionId, userId) {
    const query = `
      SELECT 
        ps.*,
        
        -- User info
        nd.ho_ten as ten_nguoi_dung,
        nd.email as email_nguoi_dung,
        nd.so_dien_thoai as sdt_nguoi_dung,
        
        -- Vehicle info
        pv.hang_xe,
        pv.dong_xe,
        pv.bien_so,
        pv.dung_luong_pin_kwh,
        
        -- Station info
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi as dia_chi_tram,
        
        -- Connector info
        cs.id_cong_sac,
        cs.ma_cong_tram,
        cs.cong_suat_kwh,
        lcs.ma_cong as loai_cong,
        
        -- Booking info
        dc.id_dat_cho,
        dc.ma_xac_nhan,
        dc.thoi_gian_bat_dau as booking_bat_dau,
        dc.thoi_gian_ket_thuc as booking_ket_thuc,
        
        -- Payment info
        tt.id_thanh_toan,
        tt.so_tien as so_tien_thanh_toan,
        tt.phuong_thuc as phuong_thuc_thanh_toan,
        tt.trang_thai as trang_thai_thanh_toan,
        tt.ngay_thanh_toan
        
      FROM phien_sac ps
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      LEFT JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
      LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = dc.id_nguoi_dung
      LEFT JOIN phuong_tien pv ON pv.id_phuong_tien = dc.id_phuong_tien
      LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac
      
      WHERE ps.id_phien_sac = $1 AND dn.id_chu_so_huu = $2
    `;

    const result = await pool.query(query, [sessionId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Không tìm thấy phiên sạc hoặc bạn không có quyền truy cập');
    }

    return result.rows[0];
  }
}

export default new OwnerSessionService();

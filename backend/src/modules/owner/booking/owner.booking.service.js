import { pool } from '../../../config/db.js';

/**
 * Owner Booking Service
 * Manage bookings for owner's stations
 */
class OwnerBookingService {
  /**
   * Get all bookings for owner's stations
   * @param {number} userId - Owner's user ID
   * @param {object} filters - Filter options
   * @returns {Promise<object>} Bookings list with pagination and stats
   */
  async getOwnerBookings(userId, filters = {}) {
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
      whereConditions.push(`dc.trang_thai = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`dc.thoi_gian_bat_dau >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`dc.thoi_gian_bat_dau <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get bookings with details
    const query = `
      SELECT 
        dc.id_dat_cho,
        dc.id_nguoi_dung,
        dc.thoi_gian_bat_dau,
        dc.thoi_gian_ket_thuc,
        dc.het_han,
        dc.trang_thai,
        dc.uoc_tinh_kwh,
        dc.uoc_tinh_chi_phi,
        dc.ma_xac_nhan,
        dc.nguon_huy,
        dc.ngay_tao,
        
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
        
        -- Session info (if exists)
        ps.id_phien_sac,
        ps.trang_thai as trang_thai_phien_sac,
        ps.dien_nang_kwh,
        (ps.dien_nang_kwh * ps.don_gia_kwh + ps.phi_cho_phut * ps.so_phut_cho) as tong_tien,
        
        -- Payment info (if exists)
        tt.id_thanh_toan,
        tt.trang_thai as trang_thai_thanh_toan
        
      FROM dat_cho dc
      JOIN nguoi_dung nd ON nd.id_nguoi_dung = dc.id_nguoi_dung
      JOIN phuong_tien pv ON pv.id_phuong_tien = dc.id_phuong_tien
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      LEFT JOIN phien_sac ps ON ps.id_dat_cho = dc.id_dat_cho
      LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac
      
      WHERE ${whereClause}
      ORDER BY dc.thoi_gian_bat_dau DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT dc.id_dat_cho) as total
      FROM dat_cho dc
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params.slice(0, paramIndex - 1));

    return {
      bookings: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    };
  }

  /**
   * Get booking statistics for owner
   * @param {number} userId - Owner's user ID
   * @param {object} filters - Filter options (stationId, startDate, endDate)
   * @returns {Promise<object>} Statistics
   */
  async getBookingStats(userId, filters = {}) {
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
      whereConditions.push(`dc.thoi_gian_bat_dau >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`dc.thoi_gian_bat_dau <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const statsQuery = `
      SELECT 
        COUNT(dc.id_dat_cho) as total_bookings,
        
        COUNT(CASE WHEN dc.trang_thai = 'cho_xac_nhan' THEN 1 END) as cho_xac_nhan,
        COUNT(CASE WHEN dc.trang_thai = 'da_xac_nhan' THEN 1 END) as da_xac_nhan,
        COUNT(CASE WHEN dc.trang_thai = 'dang_su_dung' THEN 1 END) as dang_su_dung,
        COUNT(CASE WHEN dc.trang_thai = 'hoan_thanh' THEN 1 END) as hoan_thanh,
        COUNT(CASE WHEN dc.trang_thai = 'huy' THEN 1 END) as huy,
        
        COUNT(CASE WHEN dc.trang_thai = 'huy' AND dc.nguon_huy = 'nguoi_dung' THEN 1 END) as huy_boi_nguoi_dung,
        COUNT(CASE WHEN dc.trang_thai = 'huy' AND dc.nguon_huy = 'chu_so_huu' THEN 1 END) as huy_boi_chu_so_huu,
        COUNT(CASE WHEN dc.trang_thai = 'huy' AND dc.nguon_huy = 'he_thong' THEN 1 END) as huy_boi_he_thong,
        
        SUM(dc.uoc_tinh_chi_phi) as tong_uoc_tinh_chi_phi,
        AVG(dc.uoc_tinh_kwh) as trung_binh_kwh,
        
        COUNT(DISTINCT dc.id_nguoi_dung) as so_khach_hang_unique
        
      FROM dat_cho dc
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ${whereClause}
    `;

    const statsResult = await pool.query(statsQuery, params.slice(0, paramIndex - 1));
    const stats = statsResult.rows[0];

    // Calculate rates
    const totalBookings = parseInt(stats.total_bookings) || 0;
    const cancelledBookings = parseInt(stats.huy) || 0;
    const completedBookings = parseInt(stats.hoan_thanh) || 0;

    return {
      total_bookings: totalBookings,
      by_status: {
        cho_xac_nhan: parseInt(stats.cho_xac_nhan) || 0,
        da_xac_nhan: parseInt(stats.da_xac_nhan) || 0,
        dang_su_dung: parseInt(stats.dang_su_dung) || 0,
        hoan_thanh: completedBookings,
        huy: cancelledBookings,
      },
      cancellation_sources: {
        nguoi_dung: parseInt(stats.huy_boi_nguoi_dung) || 0,
        chu_so_huu: parseInt(stats.huy_boi_chu_so_huu) || 0,
        he_thong: parseInt(stats.huy_boi_he_thong) || 0,
      },
      cancellation_rate: totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(2) : '0.00',
      completion_rate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(2) : '0.00',
      estimated_revenue: parseFloat(stats.tong_uoc_tinh_chi_phi) || 0,
      avg_kwh: parseFloat(stats.trung_binh_kwh) || 0,
      unique_customers: parseInt(stats.so_khach_hang_unique) || 0,
    };
  }

  /**
   * Get booking detail by ID
   * @param {number} bookingId - Booking ID
   * @param {number} userId - Owner's user ID
   * @returns {Promise<object>} Booking details
   */
  async getBookingDetail(bookingId, userId) {
    const query = `
      SELECT 
        dc.*,
        
        -- User info
        nd.ho_ten as ten_nguoi_dung,
        nd.email as email_nguoi_dung,
        nd.so_dien_thoai as sdt_nguoi_dung,
        
        -- Vehicle info
        pv.hang_xe,
        pv.dong_xe,
        pv.bien_so,
        pv.dung_luong_pin_kwh,
        pv.soc_hien_tai,
        
        -- Station info
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi as dia_chi_tram,
        ts.kinh_do,
        ts.vi_do,
        
        -- Connector info
        cs.id_cong_sac,
        cs.ma_cong_tram,
        cs.cong_suat_kwh,
        cs.trang_thai as trang_thai_cong,
        lcs.ma_cong as loai_cong,
        
        -- Pricing info
        hsg.gia_kwh,
        hsg.phi_cho_phut,
        
        -- Session info (if exists)
        ps.id_phien_sac,
        ps.trang_thai as trang_thai_phien_sac,
        ps.thoi_gian_bat_dau as phien_bat_dau,
        ps.thoi_gian_ket_thuc as phien_ket_thuc,
        ps.soc_truoc,
        ps.soc_sau,
        ps.dien_nang_kwh,
        ps.don_gia_kwh,
        ps.phi_cho_phut,
        ps.so_phut_cho,
        (ps.dien_nang_kwh * ps.don_gia_kwh + ps.phi_cho_phut * ps.so_phut_cho) as tong_tien,
        
        -- Payment info (if exists)
        tt.id_thanh_toan,
        tt.so_tien as so_tien_thanh_toan,
        tt.phuong_thuc as phuong_thuc_thanh_toan,
        tt.trang_thai as trang_thai_thanh_toan,
        tt.ngay_thanh_toan
        
      FROM dat_cho dc
      JOIN nguoi_dung nd ON nd.id_nguoi_dung = dc.id_nguoi_dung
      JOIN phuong_tien pv ON pv.id_phuong_tien = dc.id_phuong_tien
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      LEFT JOIN lich_su_gia_tram hsg ON hsg.id_tram = ts.id_tram 
        AND hsg.trang_thai = 'active'
      LEFT JOIN phien_sac ps ON ps.id_dat_cho = dc.id_dat_cho
      LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac
      
      WHERE dc.id_dat_cho = $1 AND dn.id_chu_so_huu = $2
    `;

    const result = await pool.query(query, [bookingId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Không tìm thấy đặt chỗ hoặc bạn không có quyền truy cập');
    }

    return result.rows[0];
  }

  /**
   * Confirm/Approve booking by owner
   * @param {number} bookingId - Booking ID
   * @param {number} userId - Owner's user ID
   * @returns {Promise<object>} Updated booking
   */
  async confirmBooking(bookingId, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if booking exists and belongs to owner's station
      const checkQuery = `
        SELECT dc.*, ts.ten_tram
        FROM dat_cho dc
        JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
        JOIN tram_sac ts ON ts.id_tram = cs.id_tram
        JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
        WHERE dc.id_dat_cho = $1 AND dn.id_chu_so_huu = $2
      `;

      const checkResult = await client.query(checkQuery, [bookingId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Không tìm thấy đặt chỗ hoặc bạn không có quyền xác nhận');
      }

      const booking = checkResult.rows[0];

      // Check if booking can be confirmed
      if (booking.trang_thai !== 'cho_xac_nhan') {
        if (booking.trang_thai === 'da_xac_nhan') {
          throw new Error('Đặt chỗ đã được xác nhận trước đó');
        }
        if (booking.trang_thai === 'huy') {
          throw new Error('Không thể xác nhận đặt chỗ đã bị hủy');
        }
        if (booking.trang_thai === 'hoan_thanh') {
          throw new Error('Đặt chỗ đã hoàn thành');
        }
        throw new Error('Không thể xác nhận đặt chỗ này');
      }

      // Update booking status to confirmed
      const updateQuery = `
        UPDATE dat_cho 
        SET trang_thai = 'da_xac_nhan'
        WHERE id_dat_cho = $1
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [bookingId]);

      await client.query('COMMIT');

      return updateResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancel booking by owner
   * @param {number} bookingId - Booking ID
   * @param {number} userId - Owner's user ID
   * @returns {Promise<object>} Updated booking
   */
  async cancelBooking(bookingId, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if booking exists and belongs to owner's station
      const checkQuery = `
        SELECT dc.*, ts.ten_tram
        FROM dat_cho dc
        JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
        JOIN tram_sac ts ON ts.id_tram = cs.id_tram
        JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
        WHERE dc.id_dat_cho = $1 AND dn.id_chu_so_huu = $2
      `;

      const checkResult = await client.query(checkQuery, [bookingId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Không tìm thấy đặt chỗ hoặc bạn không có quyền hủy');
      }

      const booking = checkResult.rows[0];

      // Check if booking can be cancelled
      if (booking.trang_thai === 'huy') {
        throw new Error('Đặt chỗ đã bị hủy trước đó');
      }

      if (booking.trang_thai === 'hoan_thanh') {
        throw new Error('Không thể hủy đặt chỗ đã hoàn thành');
      }

      if (booking.trang_thai === 'dang_su_dung') {
        throw new Error('Không thể hủy đặt chỗ đang được sử dụng');
      }

      // Update booking status
      const updateBookingQuery = `
        UPDATE dat_cho 
        SET 
          trang_thai = 'huy',
          nguon_huy = 'chu_so_huu',
          id_nguoi_huy = $1
        WHERE id_dat_cho = $2
        RETURNING *
      `;

      const updateResult = await client.query(updateBookingQuery, [userId, bookingId]);

      // Release the connector (set status back to 'trong')
      const releaseConnectorQuery = `
        UPDATE cong_sac 
        SET trang_thai = 'trong'
        WHERE id_cong_sac = $1
          AND trang_thai != 'bao_tri'
      `;

      await client.query(releaseConnectorQuery, [booking.id_cong_sac]);

      await client.query('COMMIT');

      console.log(`✅ Booking cancelled by owner: ID ${bookingId}, Connector released: ${booking.id_cong_sac}`);

      return updateResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get bookings by date range for calendar view
   * @param {number} userId - Owner's user ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {number} stationId - Optional station filter
   * @returns {Promise<array>} Bookings grouped by date
   */
  async getBookingsCalendar(userId, startDate, endDate, stationId = null) {
    let whereConditions = ['dn.id_chu_so_huu = $1'];
    const params = [userId, startDate, endDate];
    let paramIndex = 4;

    if (stationId) {
      whereConditions.push(`ts.id_tram = $${paramIndex}`);
      params.push(parseInt(stationId));
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        DATE(dc.thoi_gian_bat_dau) as booking_date,
        COUNT(dc.id_dat_cho) as total_bookings,
        COUNT(CASE WHEN dc.trang_thai = 'cho_xac_nhan' THEN 1 END) as pending,
        COUNT(CASE WHEN dc.trang_thai = 'da_xac_nhan' THEN 1 END) as confirmed,
        COUNT(CASE WHEN dc.trang_thai = 'hoan_thanh' THEN 1 END) as completed,
        COUNT(CASE WHEN dc.trang_thai = 'huy' THEN 1 END) as cancelled,
        
        json_agg(
          json_build_object(
            'id_dat_cho', dc.id_dat_cho,
            'thoi_gian_bat_dau', dc.thoi_gian_bat_dau,
            'thoi_gian_ket_thuc', dc.thoi_gian_ket_thuc,
            'trang_thai', dc.trang_thai,
            'ten_nguoi_dung', nd.ho_ten,
            'ten_tram', ts.ten_tram,
            'ma_cong_tram', cs.ma_cong_tram
          ) ORDER BY dc.thoi_gian_bat_dau
        ) as bookings
        
      FROM dat_cho dc
      JOIN nguoi_dung nd ON nd.id_nguoi_dung = dc.id_nguoi_dung
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ${whereClause}
        AND dc.thoi_gian_bat_dau >= $2
        AND dc.thoi_gian_bat_dau <= $3
      GROUP BY DATE(dc.thoi_gian_bat_dau)
      ORDER BY booking_date DESC
    `;

    const result = await pool.query(query, params.slice(0, paramIndex - 1));

    return result.rows;
  }
}

export default new OwnerBookingService();


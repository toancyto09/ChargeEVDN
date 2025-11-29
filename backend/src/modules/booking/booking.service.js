import { pool } from '../../config/db.js';
import crypto from 'crypto';

/**
 * Booking Service
 * Handles all booking-related business logic
 */

class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(userId, bookingData) {
    const { 
      id_phuong_tien, 
      id_cong_sac, 
      thoi_gian_bat_dau, 
      thoi_gian_ket_thuc,
      uoc_tinh_kwh 
    } = bookingData;

    // ✅ ANTI-SPAM #1: Check concurrent booking limit
    const activeCountQuery = `
      SELECT COUNT(*) as count
      FROM dat_cho
      WHERE id_nguoi_dung = $1
        AND trang_thai IN ('cho_xac_nhan', 'da_xac_nhan')
    `;
    
    const activeCount = await pool.query(activeCountQuery, [userId]);
    const count = parseInt(activeCount.rows[0].count);

    if (count >= 3) {
      throw new Error(
        'Bạn đã có 3 đặt chỗ đang chờ. ' +
        'Vui lòng hoàn thành hoặc hủy booking cũ trước khi đặt thêm.'
      );
    }

    // ✅ ANTI-SPAM #2: Check overlapping time with user's other bookings
    const overlapQuery = `
      SELECT dc.id_dat_cho, ts.ten_tram, dc.thoi_gian_bat_dau, dc.thoi_gian_ket_thuc
      FROM dat_cho dc
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      WHERE dc.id_nguoi_dung = $1
        AND dc.trang_thai IN ('cho_xac_nhan', 'da_xac_nhan')
        AND (
          (dc.thoi_gian_bat_dau <= $2 AND dc.thoi_gian_ket_thuc >= $2)
          OR (dc.thoi_gian_bat_dau <= $3 AND dc.thoi_gian_ket_thuc >= $3)
          OR (dc.thoi_gian_bat_dau >= $2 AND dc.thoi_gian_ket_thuc <= $3)
        )
      LIMIT 1
    `;

    const overlapResult = await pool.query(overlapQuery, [
      userId,
      thoi_gian_bat_dau,
      thoi_gian_ket_thuc
    ]);

    if (overlapResult.rows.length > 0) {
      const existing = overlapResult.rows[0];
      const existingTime = new Date(existing.thoi_gian_bat_dau)
        .toLocaleString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      
      throw new Error(
        `Bạn đã có lịch đặt chỗ trùng giờ tại "${existing.ten_tram}" ` +
        `vào lúc ${existingTime}. Vui lòng chọn thời gian khác.`
      );
    }

    // Generate confirmation code
    const ma_xac_nhan = this.generateConfirmationCode();

    // Calculate expiry (15 minutes after start time)
    const het_han = new Date(thoi_gian_bat_dau);
    het_han.setMinutes(het_han.getMinutes() + 15);

    // Get station pricing
    const pricingQuery = `
      SELECT hsg.gia_kwh, hsg.phi_cho_phut
      FROM cong_sac cs
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      LEFT JOIN lich_su_gia_tram hsg ON hsg.id_tram = ts.id_tram
        AND hsg.trang_thai = 'active'
        AND NOW() BETWEEN hsg.hieu_luc_tu AND COALESCE(hsg.hieu_luc_den, NOW() + INTERVAL '100 years')
      WHERE cs.id_cong_sac = $1
      LIMIT 1
    `;
    const pricingResult = await pool.query(pricingQuery, [id_cong_sac]);
    
    const gia_kwh = pricingResult.rows[0]?.gia_kwh || 0;
    const uoc_tinh_chi_phi = uoc_tinh_kwh * gia_kwh;

    // Insert booking
    const insertQuery = `
      INSERT INTO dat_cho (
        id_nguoi_dung,
        id_phuong_tien,
        id_cong_sac,
        thoi_gian_bat_dau,
        thoi_gian_ket_thuc,
        het_han,
        trang_thai,
        uoc_tinh_kwh,
        uoc_tinh_chi_phi,
        ma_xac_nhan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      userId,
      id_phuong_tien,
      id_cong_sac,
      thoi_gian_bat_dau,
      thoi_gian_ket_thuc,
      het_han,
      'cho_xac_nhan',
      uoc_tinh_kwh,
      uoc_tinh_chi_phi,
      ma_xac_nhan
    ]);

    // Update connector status
    await pool.query(
      `UPDATE cong_sac SET trang_thai = 'dang_su_dung' WHERE id_cong_sac = $1`,
      [id_cong_sac]
    );

    return result.rows[0];
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId, filters = {}) {
    const { status, limit = 50, offset = 0 } = filters;

    let query = `
      SELECT 
        dc.*,
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi,
        ts.kinh_do,
        ts.vi_do,
        cs.ma_cong_tram,
        lcs.ma_cong as loai_cong,
        cs.cong_suat_kwh,
        pv.hang_xe,
        pv.dong_xe,
        pv.bien_so,
        hsg.gia_kwh,
        hsg.phi_cho_phut
      FROM dat_cho dc
      JOIN phuong_tien pv ON pv.id_phuong_tien = dc.id_phuong_tien
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      LEFT JOIN lich_su_gia_tram hsg ON hsg.id_tram = ts.id_tram
        AND hsg.trang_thai = 'active'
        AND dc.thoi_gian_bat_dau BETWEEN hsg.hieu_luc_tu AND COALESCE(hsg.hieu_luc_den, NOW() + INTERVAL '100 years')
      WHERE dc.id_nguoi_dung = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND dc.trang_thai = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY dc.thoi_gian_bat_dau DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM dat_cho
      WHERE id_nguoi_dung = $1
      ${status ? 'AND trang_thai = $2' : ''}
    `;
    const countParams = status ? [userId, status] : [userId];
    const countResult = await pool.query(countQuery, countParams);

    return {
      bookings: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId, userId) {
    const query = `
      SELECT 
        dc.*,
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi,
        ts.kinh_do,
        ts.vi_do,
        cs.ma_cong_tram,
        lcs.ma_cong as loai_cong,
        cs.cong_suat_kwh,
        pv.hang_xe,
        pv.dong_xe,
        pv.bien_so,
        pv.dung_luong_pin_kwh,
        hsg.gia_kwh,
        hsg.phi_cho_phut
      FROM dat_cho dc
      JOIN phuong_tien pv ON pv.id_phuong_tien = dc.id_phuong_tien
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      LEFT JOIN lich_su_gia_tram hsg ON hsg.id_tram = ts.id_tram
        AND hsg.trang_thai = 'active'
        AND dc.thoi_gian_bat_dau BETWEEN hsg.hieu_luc_tu AND COALESCE(hsg.hieu_luc_den, NOW() + INTERVAL '100 years')
      WHERE dc.id_dat_cho = $1 AND dc.id_nguoi_dung = $2
    `;

    const result = await pool.query(query, [bookingId, userId]);
    return result.rows[0] || null;
  }

  /**
   * Extend booking expiry time (for late arrivals)
   * Charges late fee (phi_cho_phut) for extension minutes
   */
  async extendBooking(bookingId, userId, extensionMinutes = 15) {
    try {
      // Get booking details with pricing
      const booking = await this.getBookingById(bookingId, userId);

      if (!booking) {
        throw new Error('Không tìm thấy booking');
      }

      // Validate booking status - only allow extension for confirmed bookings
      if (booking.trang_thai !== 'da_xac_nhan') {
        throw new Error(
          `Chỉ có thể gia hạn booking đã được xác nhận. ` +
          `Booking này đang ở trạng thái: ${booking.trang_thai}`
        );
      }

      // Check if already expired
      const now = new Date();
      const currentExpiry = new Date(booking.het_han);

      if (now > currentExpiry) {
        // Already expired - can still extend but show warning
        console.warn(`⚠️ Extending already expired booking ${booking.ma_xac_nhan}`);
      }

      // Calculate new expiry time
      const newExpiry = new Date(currentExpiry);
      newExpiry.setMinutes(newExpiry.getMinutes() + extensionMinutes);

      // Calculate late fee
      const phiChoPhut = parseFloat(booking.phi_cho_phut) || 0;
      const lateFee = phiChoPhut * extensionMinutes;

      // Update booking
      const updateQuery = `
        UPDATE dat_cho
        SET 
          het_han = $1,
          uoc_tinh_chi_phi = uoc_tinh_chi_phi + $2,
          ghi_chu = COALESCE(ghi_chu, '') || $3
        WHERE id_dat_cho = $4 AND id_nguoi_dung = $5
        RETURNING *
      `;

      const note = `\n[Gia hạn ${extensionMinutes} phút - Phí chờ: ${lateFee.toFixed(0)}đ - ${now.toISOString()}]`;

      const result = await pool.query(updateQuery, [
        newExpiry,
        lateFee,
        note,
        bookingId,
        userId
      ]);

      const updatedBooking = result.rows[0];

      return {
        ...updatedBooking,
        extension_minutes: extensionMinutes,
        late_fee: lateFee,
        old_expiry: currentExpiry,
        new_expiry: newExpiry
      };
    } catch (error) {
      console.error('❌ Error extending booking:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId) {
    // Check if booking exists and belongs to user
    const booking = await this.getBookingById(bookingId, userId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if booking can be cancelled
    if (['hoan_thanh', 'huy'].includes(booking.trang_thai)) {
      throw new Error('Cannot cancel completed or already cancelled booking');
    }

    // Update booking status
    const updateQuery = `
      UPDATE dat_cho
      SET 
        trang_thai = 'huy',
        id_nguoi_huy = $1,
        nguon_huy = 'nguoi_dung'
      WHERE id_dat_cho = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [userId, bookingId]);

    // Free up the connector
    await pool.query(
      `UPDATE cong_sac SET trang_thai = 'trong' WHERE id_cong_sac = $1`,
      [booking.id_cong_sac]
    );

    return result.rows[0];
  }

  /**
   * Check connector availability
   */
  async checkConnectorAvailability(connectorId, startTime, endTime, excludeBookingId = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM dat_cho
      WHERE id_cong_sac = $1
        AND trang_thai NOT IN ('huy', 'hoan_thanh')
        AND (
          (thoi_gian_bat_dau <= $2 AND thoi_gian_ket_thuc >= $2)
          OR (thoi_gian_bat_dau <= $3 AND thoi_gian_ket_thuc >= $3)
          OR (thoi_gian_bat_dau >= $2 AND thoi_gian_ket_thuc <= $3)
        )
    `;

    const params = [connectorId, startTime, endTime];

    if (excludeBookingId) {
      query += ` AND id_dat_cho != $4`;
      params.push(excludeBookingId);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Get available time slots for a connector
   */
  async getAvailableSlots(connectorId, date) {
    // Get existing bookings for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      SELECT thoi_gian_bat_dau, thoi_gian_ket_thuc
      FROM dat_cho
      WHERE id_cong_sac = $1
        AND trang_thai NOT IN ('huy', 'hoan_thanh')
        AND thoi_gian_bat_dau >= $2
        AND thoi_gian_bat_dau < $3
      ORDER BY thoi_gian_bat_dau
    `;

    const result = await pool.query(query, [connectorId, startOfDay, endOfDay]);
    
    // Generate slots (30-minute intervals from 6 AM to 10 PM)
    const slots = [];
    const currentDate = new Date(date);
    currentDate.setHours(6, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(22, 0, 0, 0);

    while (currentDate < endTime) {
      const slotStart = new Date(currentDate);
      const slotEnd = new Date(currentDate);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      // Check if slot overlaps with any booking
      const isBooked = result.rows.some(booking => {
        const bookingStart = new Date(booking.thoi_gian_bat_dau);
        const bookingEnd = new Date(booking.thoi_gian_ket_thuc);
        return (slotStart < bookingEnd && slotEnd > bookingStart);
      });

      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        available: !isBooked
      });

      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }

    return slots;
  }

  /**
   * Generate confirmation code
   */
  generateConfirmationCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Update booking (for admin/system)
   */
  async updateBookingStatus(bookingId, status) {
    const query = `
      UPDATE dat_cho
      SET trang_thai = $1
      WHERE id_dat_cho = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, bookingId]);
    return result.rows[0];
  }
}

export default new BookingService();


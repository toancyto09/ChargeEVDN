import { pool } from '../../config/db.js';

/**
 * Rating Service
 * Handles all rating and review business logic
 */
class RatingService {
  /**
   * Create a new rating
   */
  async createRating(userId, ratingData) {
    const { id_dat_cho, id_tram, diem_so, nhan_xet } = ratingData;

    console.log('🔍 Creating rating:', { userId, id_dat_cho, id_tram, diem_so });

    // Validation 1: Check booking exists and belongs to user
    const bookingCheck = await pool.query(
      `SELECT id_dat_cho, trang_thai 
       FROM dat_cho 
       WHERE id_dat_cho = $1 AND id_nguoi_dung = $2`,
      [id_dat_cho, userId]
    );

    console.log('📊 Booking check result:', {
      found: bookingCheck.rows.length > 0,
      booking: bookingCheck.rows[0]
    });

    if (bookingCheck.rows.length === 0) {
      console.error('❌ Booking not found or wrong user:', { id_dat_cho, userId });
      throw new Error('Không tìm thấy booking hoặc bạn không có quyền đánh giá booking này');
    }

    const booking = bookingCheck.rows[0];

    // Validation 2: Only allow rating for completed bookings
    if (booking.trang_thai !== 'hoan_thanh') {
      console.error('❌ Booking not completed:', { status: booking.trang_thai });
      throw new Error('Chỉ có thể đánh giá sau khi hoàn thành sạc xe');
    }

    // Validation 3: Check if already rated
    const existingRating = await pool.query(
      `SELECT id_danh_gia FROM danh_gia WHERE id_dat_cho = $1`,
      [id_dat_cho]
    );

    if (existingRating.rows.length > 0) {
      throw new Error('Bạn đã đánh giá booking này rồi');
    }

    // Validation 4: Rating must be between 1-5
    if (diem_so < 1 || diem_so > 5) {
      throw new Error('Điểm đánh giá phải từ 1 đến 5 sao');
    }

    // Insert rating
    const insertQuery = `
      INSERT INTO danh_gia (
        id_tram,
        id_nguoi_dung,
        id_dat_cho,
        diem_so,
        nhan_xet
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      id_tram,
      userId,
      id_dat_cho,
      diem_so,
      nhan_xet || null
    ]);

    return result.rows[0];
  }

  /**
   * Get all ratings for a station
   */
  async getStationRatings(stationId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const query = `
      SELECT 
        dg.id_danh_gia,
        dg.diem_so,
        dg.nhan_xet,
        dg.ngay_tao,
        nd.ho_ten,
        nd.duong_dan_anh_dai_dien,
        dc.thoi_gian_bat_dau as ngay_sac
      FROM danh_gia dg
      JOIN nguoi_dung nd ON nd.id_nguoi_dung = dg.id_nguoi_dung
      JOIN dat_cho dc ON dc.id_dat_cho = dg.id_dat_cho
      WHERE dg.id_tram = $1
      ORDER BY dg.ngay_tao DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [stationId, limit, offset]);
    return result.rows;
  }

  /**
   * Get average rating for a station
   */
  async getStationAverageRating(stationId) {
    const query = `
      SELECT 
        ROUND(AVG(diem_so), 1) as diem_trung_binh,
        COUNT(*) as tong_danh_gia,
        COUNT(CASE WHEN diem_so = 5 THEN 1 END) as so_5_sao,
        COUNT(CASE WHEN diem_so = 4 THEN 1 END) as so_4_sao,
        COUNT(CASE WHEN diem_so = 3 THEN 1 END) as so_3_sao,
        COUNT(CASE WHEN diem_so = 2 THEN 1 END) as so_2_sao,
        COUNT(CASE WHEN diem_so = 1 THEN 1 END) as so_1_sao
      FROM danh_gia
      WHERE id_tram = $1
    `;

    const result = await pool.query(query, [stationId]);
    return result.rows[0];
  }

  /**
   * Get user's ratings
   */
  async getUserRatings(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const query = `
      SELECT 
        dg.id_danh_gia,
        dg.diem_so,
        dg.nhan_xet,
        dg.ngay_tao,
        ts.ten_tram,
        ts.dia_chi,
        dc.thoi_gian_bat_dau as ngay_sac
      FROM danh_gia dg
      JOIN tram_sac ts ON ts.id_tram = dg.id_tram
      JOIN dat_cho dc ON dc.id_dat_cho = dg.id_dat_cho
      WHERE dg.id_nguoi_dung = $1
      ORDER BY dg.ngay_tao DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Check if user can rate a booking
   */
  async canRateBooking(userId, bookingId) {
    const query = `
      SELECT 
        dc.id_dat_cho,
        dc.trang_thai,
        dg.id_danh_gia
      FROM dat_cho dc
      LEFT JOIN danh_gia dg ON dg.id_dat_cho = dc.id_dat_cho
      WHERE dc.id_dat_cho = $1 AND dc.id_nguoi_dung = $2
    `;

    const result = await pool.query(query, [bookingId, userId]);

    if (result.rows.length === 0) {
      return { canRate: false, reason: 'Booking không tồn tại' };
    }

    const booking = result.rows[0];

    if (booking.trang_thai !== 'hoan_thanh') {
      return { canRate: false, reason: 'Chưa hoàn thành sạc' };
    }

    if (booking.id_danh_gia) {
      return { canRate: false, reason: 'Đã đánh giá rồi' };
    }

    return { canRate: true };
  }
}

export default new RatingService();


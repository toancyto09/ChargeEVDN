import { pool } from '../../../config/db.js';

/**
 * Owner Rating Service
 * Manage station ratings and reviews
 */
class OwnerRatingService {
  /**
   * Get all ratings for owner's stations
   * @param {number} userId - Owner's user ID
   * @param {object} filters - Filter options
   * @returns {Promise<object>} Ratings list with pagination
   */
  async getOwnerRatings(userId, filters = {}) {
    const { 
      stationId, 
      minRating,
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

    if (minRating) {
      whereConditions.push(`dg.diem_so >= $${paramIndex}`);
      params.push(parseInt(minRating));
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get ratings with details
    const query = `
      SELECT 
        dg.id_danh_gia,
        dg.diem_so,
        dg.nhan_xet,
        dg.ngay_tao,
        
        -- User info
        nd.id_nguoi_dung,
        nd.ho_ten as ten_nguoi_dung,
        nd.duong_dan_anh_dai_dien,
        
        -- Station info
        ts.id_tram,
        ts.ten_tram,
        
        -- Booking info
        dc.id_dat_cho,
        dc.ma_xac_nhan
        
      FROM danh_gia dg
      JOIN nguoi_dung nd ON nd.id_nguoi_dung = dg.id_nguoi_dung
      JOIN tram_sac ts ON ts.id_tram = dg.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      LEFT JOIN dat_cho dc ON dc.id_dat_cho = dg.id_dat_cho
      
      WHERE ${whereClause}
      ORDER BY dg.ngay_tao DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT dg.id_danh_gia) as total
      FROM danh_gia dg
      JOIN tram_sac ts ON ts.id_tram = dg.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params.slice(0, paramIndex - 1));

    return {
      ratings: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    };
  }

  /**
   * Get rating statistics for owner
   * @param {number} userId - Owner's user ID
   * @param {object} filters - Filter options (stationId)
   * @returns {Promise<object>} Statistics
   */
  async getRatingStats(userId, filters = {}) {
    const { stationId } = filters;

    let whereConditions = ['dn.id_chu_so_huu = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (stationId) {
      whereConditions.push(`ts.id_tram = $${paramIndex}`);
      params.push(parseInt(stationId));
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const statsQuery = `
      SELECT 
        COUNT(dg.id_danh_gia) as total_ratings,
        COALESCE(AVG(dg.diem_so), 0) as diem_trung_binh,
        
        COUNT(CASE WHEN dg.diem_so = 5 THEN 1 END) as rating_5,
        COUNT(CASE WHEN dg.diem_so = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN dg.diem_so = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN dg.diem_so = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN dg.diem_so = 1 THEN 1 END) as rating_1,
        
        COUNT(CASE WHEN dg.nhan_xet IS NOT NULL AND dg.nhan_xet != '' THEN 1 END) as with_comment
        
      FROM danh_gia dg
      JOIN tram_sac ts ON ts.id_tram = dg.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      WHERE ${whereClause}
    `;

    const statsResult = await pool.query(statsQuery, params.slice(0, paramIndex - 1));
    const stats = statsResult.rows[0];

    return {
      total_ratings: parseInt(stats.total_ratings) || 0,
      average_rating: parseFloat(stats.diem_trung_binh) || 0,
      distribution: {
        rating_5: parseInt(stats.rating_5) || 0,
        rating_4: parseInt(stats.rating_4) || 0,
        rating_3: parseInt(stats.rating_3) || 0,
        rating_2: parseInt(stats.rating_2) || 0,
        rating_1: parseInt(stats.rating_1) || 0,
      },
      with_comment: parseInt(stats.with_comment) || 0,
    };
  }

  /**
   * Get rating detail by ID
   * @param {number} ratingId - Rating ID
   * @param {number} userId - Owner's user ID
   * @returns {Promise<object>} Rating details
   */
  async getRatingDetail(ratingId, userId) {
    const query = `
      SELECT 
        dg.*,
        
        -- User info
        nd.ho_ten as ten_nguoi_dung,
        nd.email as email_nguoi_dung,
        nd.duong_dan_anh_dai_dien,
        
        -- Station info
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi as dia_chi_tram,
        
        -- Booking info
        dc.id_dat_cho,
        dc.ma_xac_nhan,
        dc.thoi_gian_bat_dau as booking_bat_dau,
        dc.thoi_gian_ket_thuc as booking_ket_thuc
        
      FROM danh_gia dg
      JOIN nguoi_dung nd ON nd.id_nguoi_dung = dg.id_nguoi_dung
      JOIN tram_sac ts ON ts.id_tram = dg.id_tram
      JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      LEFT JOIN dat_cho dc ON dc.id_dat_cho = dg.id_dat_cho
      
      WHERE dg.id_danh_gia = $1 AND dn.id_chu_so_huu = $2
    `;

    const result = await pool.query(query, [ratingId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Không tìm thấy đánh giá hoặc bạn không có quyền truy cập');
    }

    return result.rows[0];
  }
}

export default new OwnerRatingService();

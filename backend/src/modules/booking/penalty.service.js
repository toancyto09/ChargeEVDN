import { pool } from '../../config/db.js';

/**
 * Penalty Service (No Schema Changes)
 * Calculate user penalties from booking history
 */

/**
 * Get user's no-show statistics (from booking history)
 * @param {number} userId 
 * @returns {object} { noShowCount, totalBookings, penaltyScore }
 */
export async function getUserPenaltyStats(userId) {
  // Count no-shows in last 30 days
  const noShowQuery = `
    SELECT COUNT(*) as no_show_count
    FROM dat_cho
    WHERE id_nguoi_dung = $1
      AND trang_thai = 'da_xac_nhan'
      AND het_han < NOW()  -- Expired
      AND id_dat_cho NOT IN (
        SELECT DISTINCT id_dat_cho 
        FROM phien_sac 
        WHERE id_dat_cho IS NOT NULL
      )  -- No session created = no-show
      AND ngay_tao >= NOW() - INTERVAL '30 days'
  `;

  const totalQuery = `
    SELECT COUNT(*) as total_count
    FROM dat_cho
    WHERE id_nguoi_dung = $1
      AND ngay_tao >= NOW() - INTERVAL '30 days'
  `;

  const [noShowResult, totalResult] = await Promise.all([
    pool.query(noShowQuery, [userId]),
    pool.query(totalQuery, [userId])
  ]);

  const noShowCount = parseInt(noShowResult.rows[0].no_show_count);
  const totalBookings = parseInt(totalResult.rows[0].total_count);

  // Calculate penalty score (0-100, 100 = worst)
  let penaltyScore = 0;
  if (totalBookings > 0) {
    const noShowRate = noShowCount / totalBookings;
    penaltyScore = Math.min(Math.round(noShowRate * 100), 100);
  }

  // Calculate trust score (100 - penalty)
  const trustScore = 100 - penaltyScore;

  return {
    noShowCount,
    totalBookings,
    penaltyScore,
    trustScore,
    isBlocked: noShowCount >= 3,  // Block after 3 no-shows
    warningLevel: noShowCount >= 2 ? 'high' : noShowCount >= 1 ? 'medium' : 'low'
  };
}

/**
 * Check if user can create booking (penalty check)
 * @param {number} userId 
 * @throws {Error} if user is blocked
 */
export async function checkBookingEligibility(userId) {
  const stats = await getUserPenaltyStats(userId);

  if (stats.isBlocked) {
    throw new Error(
      `Tài khoản tạm thời bị hạn chế do không check-in ${stats.noShowCount} lần trong 30 ngày qua. ` +
      `Vui lòng liên hệ hỗ trợ hoặc đợi 30 ngày.`
    );
  }

  // Return warning if needed
  if (stats.warningLevel === 'high') {
    return {
      allowed: true,
      warning: `⚠️ Lưu ý: Bạn đã bỏ lỡ ${stats.noShowCount} booking. Lần nữa sẽ bị khóa tài khoản.`
    };
  } else if (stats.warningLevel === 'medium') {
    return {
      allowed: true,
      warning: `⚠️ Lưu ý: Bạn đã bỏ lỡ ${stats.noShowCount} booking. Vui lòng check-in đúng giờ.`
    };
  }

  return { allowed: true, warning: null };
}

/**
 * Mark expired bookings as no-show (Cron job function)
 * @returns {number} Number of expired bookings marked
 */
export async function markExpiredBookings() {
  const query = `
    UPDATE dat_cho
    SET 
      trang_thai = 'huy',
      nguon_huy = 'he_thong'
    WHERE trang_thai = 'da_xac_nhan'
      AND het_han < NOW()
      AND id_dat_cho NOT IN (
        SELECT DISTINCT id_dat_cho 
        FROM phien_sac 
        WHERE id_dat_cho IS NOT NULL
      )
    RETURNING id_dat_cho, id_nguoi_dung
  `;

  const result = await pool.query(query);
  
  console.log(`✅ Marked ${result.rows.length} bookings as no-show`);
  
  // Log for each user
  for (const booking of result.rows) {
    const stats = await getUserPenaltyStats(booking.id_nguoi_dung);
    console.log(
      `   User ${booking.id_nguoi_dung}: ${stats.noShowCount} no-shows total ` +
      `(${stats.isBlocked ? 'BLOCKED' : 'OK'})`
    );
  }

  return result.rows.length;
}

/**
 * Get detailed penalty report for user
 * @param {number} userId 
 * @returns {object} Detailed penalty info
 */
export async function getUserPenaltyReport(userId) {
  const stats = await getUserPenaltyStats(userId);

  // Get recent no-shows
  const recentNoShowsQuery = `
    SELECT 
      dc.id_dat_cho,
      dc.thoi_gian_bat_dau,
      dc.het_han,
      dc.ngay_tao,
      ts.ten_tram
    FROM dat_cho dc
    JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
    JOIN tram_sac ts ON ts.id_tram = cs.id_tram
    WHERE dc.id_nguoi_dung = $1
      AND dc.trang_thai = 'da_xac_nhan'
      AND dc.het_han < NOW()
      AND dc.id_dat_cho NOT IN (
        SELECT DISTINCT id_dat_cho FROM phien_sac WHERE id_dat_cho IS NOT NULL
      )
      AND dc.ngay_tao >= NOW() - INTERVAL '30 days'
    ORDER BY dc.het_han DESC
    LIMIT 10
  `;

  const recentNoShows = await pool.query(recentNoShowsQuery, [userId]);

  return {
    ...stats,
    recentNoShows: recentNoShows.rows,
    message: stats.isBlocked 
      ? '❌ Tài khoản bị khóa do vi phạm chính sách check-in'
      : stats.warningLevel === 'high'
      ? '⚠️ Cảnh báo: Sắp bị khóa tài khoản'
      : stats.warningLevel === 'medium'
      ? '⚠️ Cảnh báo: Vui lòng cải thiện tỷ lệ check-in'
      : '✅ Tài khoản tốt'
  };
}

export default {
  getUserPenaltyStats,
  checkBookingEligibility,
  markExpiredBookings,
  getUserPenaltyReport
};

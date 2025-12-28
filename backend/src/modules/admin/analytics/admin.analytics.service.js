import { pool } from '../../../config/db.js';

/**
 * Admin Analytics Service
 * Business logic for analytics and reporting
 */
class AdminAnalyticsService {
  /**
   * Get overview statistics
   * @returns {Promise<object>} Overview stats
   */
  async getOverviewStats() {
    const query = `
      SELECT 
        -- Total revenue from completed payments
        (SELECT COALESCE(SUM(so_tien), 0) 
         FROM thanh_toan 
         WHERE trang_thai = 'success') as total_revenue,
        
        -- Total completed sessions
        (SELECT COUNT(*) 
         FROM phien_sac 
         WHERE trang_thai = 'hoan_thanh') as total_sessions,
        
        -- Total active users
        (SELECT COUNT(*) 
         FROM nguoi_dung 
         WHERE trang_thai = 'hoat_dong') as active_users,
        
        -- Total stations
        (SELECT COUNT(*) 
         FROM tram_sac 
         WHERE trang_thai_duyet = 'approved') as total_stations,
        
        -- Revenue this month
        (SELECT COALESCE(SUM(so_tien), 0) 
         FROM thanh_toan 
         WHERE trang_thai = 'success'
         AND EXTRACT(MONTH FROM ngay_thanh_toan) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM ngay_thanh_toan) = EXTRACT(YEAR FROM CURRENT_DATE)) as revenue_this_month,
        
        -- Revenue last month
        (SELECT COALESCE(SUM(so_tien), 0) 
         FROM thanh_toan 
         WHERE trang_thai = 'success'
         AND EXTRACT(MONTH FROM ngay_thanh_toan) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
         AND EXTRACT(YEAR FROM ngay_thanh_toan) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')) as revenue_last_month,
        
        -- Sessions this month
        (SELECT COUNT(*) 
         FROM phien_sac 
         WHERE trang_thai = 'hoan_thanh'
         AND EXTRACT(MONTH FROM thoi_gian_ket_thuc) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM thoi_gian_ket_thuc) = EXTRACT(YEAR FROM CURRENT_DATE)) as sessions_this_month,
        
        -- Sessions last month
        (SELECT COUNT(*) 
         FROM phien_sac 
         WHERE trang_thai = 'hoan_thanh'
         AND EXTRACT(MONTH FROM thoi_gian_ket_thuc) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
         AND EXTRACT(YEAR FROM thoi_gian_ket_thuc) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')) as sessions_last_month
    `;

    const result = await pool.query(query);
    const stats = result.rows[0];

    // Calculate growth percentages
    const revenueGrowth = stats.revenue_last_month > 0 
      ? ((stats.revenue_this_month - stats.revenue_last_month) / stats.revenue_last_month * 100).toFixed(1)
      : 0;

    const sessionsGrowth = stats.sessions_last_month > 0
      ? ((stats.sessions_this_month - stats.sessions_last_month) / stats.sessions_last_month * 100).toFixed(1)
      : 0;

    return {
      total_revenue: parseFloat(stats.total_revenue) || 0,
      total_sessions: parseInt(stats.total_sessions) || 0,
      active_users: parseInt(stats.active_users) || 0,
      total_stations: parseInt(stats.total_stations) || 0,
      revenue_this_month: parseFloat(stats.revenue_this_month) || 0,
      sessions_this_month: parseInt(stats.sessions_this_month) || 0,
      revenue_growth: parseFloat(revenueGrowth),
      sessions_growth: parseFloat(sessionsGrowth),
    };
  }

  /**
   * Get revenue chart data
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Promise<Array>} Revenue data by date
   */
  async getRevenueChart(startDate, endDate) {
    const query = `
      SELECT 
        DATE(ngay_thanh_toan) as date,
        COALESCE(SUM(so_tien), 0) as revenue,
        COUNT(*) as transaction_count
      FROM thanh_toan
      WHERE 
        trang_thai = 'success'
        AND ngay_thanh_toan >= $1 
        AND ngay_thanh_toan <= $2
      GROUP BY DATE(ngay_thanh_toan)
      ORDER BY date
    `;

    const result = await pool.query(query, [startDate, endDate]);
    return result.rows.map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue) || 0,
      transactions: parseInt(row.transaction_count) || 0,
    }));
  }

  /**
   * Get user growth chart data
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Promise<Array>} User growth data
   */
  async getUserGrowthChart(startDate, endDate) {
    const query = `
      SELECT 
        DATE(ngay_tao) as date,
        COUNT(*) as new_users,
        vai_tro
      FROM nguoi_dung
      WHERE 
        ngay_tao >= $1 
        AND ngay_tao <= $2
      GROUP BY DATE(ngay_tao), vai_tro
      ORDER BY date
    `;

    const result = await pool.query(query, [startDate, endDate]);
    
    // Group by date and accumulate totals
    const dataByDate = {};
    result.rows.forEach(row => {
      const dateStr = row.date;
      if (!dataByDate[dateStr]) {
        dataByDate[dateStr] = { date: dateStr, users: 0, owners: 0, total: 0 };
      }
      if (row.vai_tro === 'user') {
        dataByDate[dateStr].users += parseInt(row.new_users);
      } else if (row.vai_tro === 'owner') {
        dataByDate[dateStr].owners += parseInt(row.new_users);
      }
      dataByDate[dateStr].total += parseInt(row.new_users);
    });

    return Object.values(dataByDate);
  }

  /**
   * Get sessions chart data
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Promise<Array>} Sessions data by date
   */
  async getSessionsChart(startDate, endDate) {
    const query = `
      SELECT 
        DATE(thoi_gian_bat_dau) as date,
        COUNT(*) as total_sessions,
        COALESCE(SUM(dien_nang_kwh), 0) as total_energy,
        COUNT(CASE WHEN trang_thai = 'hoan_thanh' THEN 1 END) as completed_sessions
      FROM phien_sac
      WHERE 
        thoi_gian_bat_dau >= $1 
        AND thoi_gian_bat_dau <= $2
      GROUP BY DATE(thoi_gian_bat_dau)
      ORDER BY date
    `;

    const result = await pool.query(query, [startDate, endDate]);
    return result.rows.map(row => ({
      date: row.date,
      total: parseInt(row.total_sessions) || 0,
      completed: parseInt(row.completed_sessions) || 0,
      energy: parseFloat(row.total_energy) || 0,
    }));
  }

  /**
   * Get top stations
   * @param {number} limit 
   * @returns {Promise<Array>} Top performing stations
   */
  async getTopStations(limit = 10) {
    const query = `
      SELECT 
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi,
        dn.ten_doanh_nghiep,
        COUNT(DISTINCT ps.id_phien_sac) as total_sessions,
        COALESCE(SUM(ps.dien_nang_kwh), 0) as total_energy,
        COALESCE(SUM(tt.so_tien), 0) as total_revenue,
        COALESCE(AVG(dg.diem_so), 0) as avg_rating,
        COUNT(DISTINCT dg.id_danh_gia) as total_reviews
      FROM tram_sac ts
      LEFT JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
      LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
      LEFT JOIN phien_sac ps ON ps.id_cong_sac = cs.id_cong_sac AND ps.trang_thai = 'hoan_thanh'
      LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac AND tt.trang_thai = 'success'
      LEFT JOIN danh_gia dg ON dg.id_tram = ts.id_tram
      WHERE ts.trang_thai_duyet = 'approved'
      GROUP BY ts.id_tram, ts.ten_tram, ts.dia_chi, dn.ten_doanh_nghiep
      ORDER BY total_revenue DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows.map(row => ({
      id: row.id_tram,
      name: row.ten_tram,
      address: row.dia_chi,
      business: row.ten_doanh_nghiep,
      sessions: parseInt(row.total_sessions) || 0,
      energy: parseFloat(row.total_energy) || 0,
      revenue: parseFloat(row.total_revenue) || 0,
      rating: parseFloat(row.avg_rating) || 0,
      reviews: parseInt(row.total_reviews) || 0,
    }));
  }

  /**
   * Get booking status distribution
   * @returns {Promise<Array>} Booking status stats
   */
  async getBookingStatusDistribution() {
    const query = `
      SELECT 
        trang_thai,
        COUNT(*) as count
      FROM dat_cho
      GROUP BY trang_thai
    `;

    const result = await pool.query(query);
    return result.rows.map(row => ({
      status: row.trang_thai,
      count: parseInt(row.count) || 0,
    }));
  }

  /**
   * Get recent transactions
   * @param {number} limit 
   * @returns {Promise<Array>} Recent transactions
   */
  async getRecentTransactions(limit = 10) {
    const query = `
      SELECT 
        tt.id_thanh_toan,
        tt.so_tien,
        tt.phuong_thuc,
        tt.trang_thai,
        tt.ngay_thanh_toan,
        nd.ho_ten as user_name,
        nd.email as user_email,
        ts.ten_tram as station_name
      FROM thanh_toan tt
      JOIN phien_sac ps ON ps.id_phien_sac = tt.id_phien_sac
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
      JOIN nguoi_dung nd ON nd.id_nguoi_dung = dc.id_nguoi_dung
      ORDER BY tt.ngay_thanh_toan DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows.map(row => ({
      id: row.id_thanh_toan,
      amount: parseFloat(row.so_tien) || 0,
      method: row.phuong_thuc,
      status: row.trang_thai,
      date: row.ngay_thanh_toan,
      user_name: row.user_name,
      user_email: row.user_email,
      station_name: row.station_name,
    }));
  }

  /**
   * Get revenue by business
   * @param {number} limit 
   * @returns {Promise<Array>} Revenue breakdown by business
   */
  async getRevenueByBusiness(limit = 10) {
    const PLATFORM_COMMISSION_RATE = 0.10; // 10% platform commission

    const query = `
      SELECT 
        dn.id_doanh_nghiep,
        dn.ten_doanh_nghiep,
        nd.ho_ten as owner_name,
        COUNT(DISTINCT ts.id_tram) as total_stations,
        COUNT(DISTINCT ps.id_phien_sac) as total_sessions,
        COALESCE(SUM(tt.so_tien), 0) as total_revenue,
        COALESCE(SUM(ps.dien_nang_kwh), 0) as total_energy
      FROM doanh_nghiep dn
      JOIN nguoi_dung nd ON nd.id_nguoi_dung = dn.id_chu_so_huu
      LEFT JOIN tram_sac ts ON ts.id_doanh_nghiep = dn.id_doanh_nghiep AND ts.trang_thai_duyet = 'approved'
      LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
      LEFT JOIN phien_sac ps ON ps.id_cong_sac = cs.id_cong_sac AND ps.trang_thai = 'hoan_thanh'
      LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac AND tt.trang_thai = 'success'
      GROUP BY dn.id_doanh_nghiep, dn.ten_doanh_nghiep, nd.ho_ten
      HAVING COALESCE(SUM(tt.so_tien), 0) > 0
      ORDER BY total_revenue DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows.map(row => {
      const totalRevenue = parseFloat(row.total_revenue) || 0;
      const platformCommission = totalRevenue * PLATFORM_COMMISSION_RATE;
      const ownerPayout = totalRevenue - platformCommission;

      return {
        id: row.id_doanh_nghiep,
        business_name: row.ten_doanh_nghiep,
        owner_name: row.owner_name,
        total_stations: parseInt(row.total_stations) || 0,
        total_sessions: parseInt(row.total_sessions) || 0,
        total_revenue: totalRevenue,
        platform_commission: platformCommission,
        owner_payout: ownerPayout,
        total_energy: parseFloat(row.total_energy) || 0,
        commission_rate: PLATFORM_COMMISSION_RATE * 100, // Return as percentage
      };
    });
  }
}

export default new AdminAnalyticsService();

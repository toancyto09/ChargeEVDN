import { pool } from '../config/db.js';

/**
 * Audit Log Service
 * Service for logging system activities and user actions
 */
class AuditLogService {
  /**
   * Create audit log entry
   * @param {object} logData - Log data
   * @returns {Promise<void>}
   */
  async createLog({ userId, action, details = {}, req = null }) {
    try {
      // Extract IP and user agent if request is provided
      const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
      const userAgent = req?.headers['user-agent'] || null;

      // Merge IP and user agent into details
      const fullDetails = {
        ...details,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
      };

      const query = `
        INSERT INTO nhat_ky_he_thong (id_nguoi_dung, hanh_dong, chi_tiet)
        VALUES ($1, $2, $3)
        RETURNING id_nhat_ky
      `;

      await pool.query(query, [userId, action, JSON.stringify(fullDetails)]);
    } catch (error) {
      // Don't throw error to avoid breaking main flow
      console.error('Error creating audit log:', error);
    }
  }

  /**
   * Get audit logs with filters
   * @param {object} filters - Filter options
   * @returns {Promise<object>} Paginated logs
   */
  async getLogs({ page = 1, limit = 50, action, userId, startDate, endDate, search }) {
    try {
      const offset = (page - 1) * limit;
      const conditions = [];
      const params = [];
      let paramCount = 1;

      // Build WHERE conditions
      if (action) {
        conditions.push(`nk.hanh_dong = $${paramCount}`);
        params.push(action);
        paramCount++;
      }

      if (userId) {
        conditions.push(`nk.id_nguoi_dung = $${paramCount}`);
        params.push(userId);
        paramCount++;
      }

      if (startDate) {
        conditions.push(`nk.ngay_tao >= $${paramCount}`);
        params.push(startDate);
        paramCount++;
      }

      if (endDate) {
        conditions.push(`nk.ngay_tao <= $${paramCount}`);
        params.push(endDate);
        paramCount++;
      }

      if (search) {
        conditions.push(`(nd.ho_ten ILIKE $${paramCount} OR nk.hanh_dong ILIKE $${paramCount})`);
        params.push(`%${search}%`);
        paramCount++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM nhat_ky_he_thong nk
        LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = nk.id_nguoi_dung
        ${whereClause}
      `;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get logs
      const logsQuery = `
        SELECT 
          nk.id_nhat_ky,
          nk.id_nguoi_dung,
          nk.hanh_dong,
          nk.chi_tiet,
          nk.ngay_tao,
          nd.ho_ten as user_name,
          nd.email as user_email,
          nd.vai_tro as user_role
        FROM nhat_ky_he_thong nk
        LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = nk.id_nguoi_dung
        ${whereClause}
        ORDER BY nk.ngay_tao DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      params.push(limit, offset);

      const logsResult = await pool.query(logsQuery, params);

      return {
        logs: logsResult.rows.map(row => ({
          id: row.id_nhat_ky,
          user_id: row.id_nguoi_dung,
          user_name: row.user_name || 'System',
          user_email: row.user_email,
          user_role: row.user_role,
          action: row.hanh_dong,
          details: row.chi_tiet,
          created_at: row.ngay_tao,
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }

  /**
   * Get log statistics
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Promise<object>} Statistics
   */
  async getStatistics(startDate, endDate) {
    try {
      const query = `
        SELECT 
          hanh_dong,
          COUNT(*) as count,
          COUNT(DISTINCT id_nguoi_dung) as unique_users
        FROM nhat_ky_he_thong
        WHERE ngay_tao >= $1 AND ngay_tao <= $2
        GROUP BY hanh_dong
        ORDER BY count DESC
      `;

      const result = await pool.query(query, [startDate, endDate]);

      return {
        by_action: result.rows.map(row => ({
          action: row.hanh_dong,
          count: parseInt(row.count),
          unique_users: parseInt(row.unique_users),
        })),
      };
    } catch (error) {
      console.error('Error getting audit log statistics:', error);
      throw error;
    }
  }

  /**
   * Get activity timeline
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Promise<Array>} Timeline data
   */
  async getActivityTimeline(startDate, endDate) {
    try {
      const query = `
        SELECT 
          DATE(ngay_tao) as date,
          COUNT(*) as total_actions,
          COUNT(DISTINCT id_nguoi_dung) as active_users
        FROM nhat_ky_he_thong
        WHERE ngay_tao >= $1 AND ngay_tao <= $2
        GROUP BY DATE(ngay_tao)
        ORDER BY date
      `;

      const result = await pool.query(query, [startDate, endDate]);

      return result.rows.map(row => ({
        date: row.date,
        total_actions: parseInt(row.total_actions),
        active_users: parseInt(row.active_users),
      }));
    } catch (error) {
      console.error('Error getting activity timeline:', error);
      throw error;
    }
  }
}

export default new AuditLogService();

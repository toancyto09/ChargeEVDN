import { pool } from '../../../config/db.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

/**
 * Admin User Service
 * Manage system users (create, read, update, delete)
 */
class AdminUserService {
  /**
   * Create new user account
   * @param {object} userData - User data
   * @param {number} adminId - Admin user ID
   * @returns {Promise<object>} Created user
   */
  async createUser(userData, adminId) {
    const { ho_ten, email, so_dien_thoai, vai_tro, mat_khau } = userData;

    // Validate required fields
    if (!ho_ten || !email || !vai_tro) {
      throw new Error('Vui lòng cung cấp đầy đủ thông tin bắt buộc');
    }

    // Validate role
    const validRoles = ['user', 'owner'];
    if (!validRoles.includes(vai_tro)) {
      throw new Error('Vai trò không hợp lệ. Chỉ được tạo user hoặc owner');
    }

    // Check if email already exists
    const checkQuery = 'SELECT id_nguoi_dung FROM nguoi_dung WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
      throw new Error('Email đã tồn tại trong hệ thống');
    }

    // Check phone if provided
    if (so_dien_thoai) {
      const checkPhoneQuery = 'SELECT id_nguoi_dung FROM nguoi_dung WHERE so_dien_thoai = $1';
      const checkPhoneResult = await pool.query(checkPhoneQuery, [so_dien_thoai]);
      
      if (checkPhoneResult.rows.length > 0) {
        throw new Error('Số điện thoại đã tồn tại trong hệ thống');
      }
    }

    // Generate temporary password if not provided
    const tempPassword = mat_khau || this.generateTemporaryPassword();
    const hashedPassword = await bcryptjs.hash(tempPassword, 12);

    // Insert new user
    const insertQuery = `
      INSERT INTO nguoi_dung (
        ho_ten, email, so_dien_thoai, mat_khau, vai_tro, trang_thai
      ) VALUES ($1, $2, $3, $4, $5, 'hoat_dong')
      RETURNING id_nguoi_dung, ho_ten, email, so_dien_thoai, vai_tro, trang_thai, ngay_tao
    `;

    const result = await pool.query(insertQuery, [
      ho_ten,
      email, 
      so_dien_thoai || null,
      hashedPassword,
      vai_tro
    ]);

    const newUser = result.rows[0];

    // Return user with temporary password (only shown once)
    return {
      ...newUser,
      temp_password: tempPassword, // Only for admin to send to user
    };
  }

  /**
   * Update user information
   * @param {number} userId - User ID
   * @param {object} updateData - Data to update
   * @param {number} adminId - Admin user ID
   * @returns {Promise<object>} Updated user
   */
  async updateUser(userId, updateData, adminId) {
    const { ho_ten, so_dien_thoai } = updateData;

    // Check user exists
    const checkQuery = 'SELECT vai_tro FROM nguoi_dung WHERE id_nguoi_dung = $1';
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (ho_ten) {
      updates.push(`ho_ten = $${paramIndex}`);
      values.push(ho_ten);
      paramIndex++;
    }

    if (so_dien_thoai !== undefined) {
      // Check if phone number already exists (if changing)
      if (so_dien_thoai) {
        const checkPhoneQuery = `
          SELECT id_nguoi_dung FROM nguoi_dung 
          WHERE so_dien_thoai = $1 AND id_nguoi_dung != $2
        `;
        const phoneCheck = await pool.query(checkPhoneQuery, [so_dien_thoai, userId]);
        
        if (phoneCheck.rows.length > 0) {
          throw new Error('Số điện thoại đã được sử dụng bởi tài khoản khác');
        }
      }
      
      updates.push(`so_dien_thoai = $${paramIndex}`);
      values.push(so_dien_thoai || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('Không có thông tin nào để cập nhật');
    }

    values.push(userId);

    const query = `
      UPDATE nguoi_dung
      SET ${updates.join(', ')}
      WHERE id_nguoi_dung = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Change user role
   * @param {number} userId - User ID
   * @param {string} newRole - New role ('user', 'owner')
   * @param {number} adminId - Admin user ID
   * @returns {Promise<object>} Updated user
   */
  async changeUserRole(userId, newRole, adminId) {
    // Validate role
    const validRoles = ['user', 'owner'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Vai trò không hợp lệ. Chỉ được đổi giữa user và owner');
    }

    // Check user exists and get current role
    const checkQuery = 'SELECT vai_tro FROM nguoi_dung WHERE id_nguoi_dung = $1';
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Không tìm thấy người dùng');
    }

    const currentRole = checkResult.rows[0].vai_tro;

    // Don't allow changing admin role
    if (currentRole === 'admin') {
      throw new Error('Không thể thay đổi vai trò của tài khoản admin');
    }

    // Don't change to admin
    if (newRole === 'admin') {
      throw new Error('Không thể nâng cấp lên vai trò admin');
    }

    // Check if already has that role
    if (currentRole === newRole) {
      throw new Error(`Người dùng đã là ${newRole} rồi`);
    }

    const query = `
      UPDATE nguoi_dung
      SET vai_tro = $2
      WHERE id_nguoi_dung = $1
      RETURNING *
    `;

    const result = await pool.query(query, [userId, newRole]);
    return result.rows[0];
  }

  /**
   * Reset user password
   * @param {number} userId - User ID
   * @param {number} adminId - Admin user ID
   * @returns {Promise<object>} Temp password
   */
  async resetUserPassword(userId, adminId) {
    // Check user exists
    const checkQuery = 'SELECT email, vai_tro FROM nguoi_dung WHERE id_nguoi_dung = $1';
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Không tìm thấy người dùng');
    }

    const user = checkResult.rows[0];

    // Don't allow resetting admin password
    if (user.vai_tro === 'admin') {
      throw new Error('Không thể reset mật khẩu admin');
    }

    // Generate new temporary password
    const tempPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcryptjs.hash(tempPassword, 12);

    const query = `
      UPDATE nguoi_dung
      SET mat_khau = $2
      WHERE id_nguoi_dung = $1
      RETURNING id_nguoi_dung, email
    `;

    await pool.query(query, [userId, hashedPassword]);

    return {
      email: user.email,
      temp_password: tempPassword,
    };
  }

  /**
   * Generate secure temporary password
   * @returns {string} Temporary password
   */
  generateTemporaryPassword() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@#$%&*';
    
    let password = '';
    
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill rest with random characters
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < 10; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Get all users with filters
   * @param {object} filters - Filter options (role, status, limit, offset, search)
   * @returns {Promise<object>} Users list with pagination
   */
  async getUsers(filters = {}) {
    const { 
      role = 'all', // 'all', 'user', 'owner', 'admin'
      status = 'all', // 'all', 'hoat_dong', 'khoa', 'cho_xac_thuc'
      search = '', // Search by name, email, phone
      limit = 50, 
      offset = 0 
    } = filters;

    // Build WHERE conditions
    let whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (role !== 'all') {
      whereConditions.push(`nd.vai_tro = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status !== 'all') {
      whereConditions.push(`nd.trang_thai = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search && search.trim() !== '') {
      whereConditions.push(`(
        nd.ho_ten ILIKE $${paramIndex} OR 
        nd.email ILIKE $${paramIndex} OR 
        nd.so_dien_thoai ILIKE $${paramIndex}
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get users with business info (for owners)
    const query = `
      SELECT DISTINCT ON (nd.id_nguoi_dung)
        nd.id_nguoi_dung,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.gioi_tinh,
        nd.ngay_sinh,
        nd.vai_tro,
        nd.trang_thai,
        nd.ngay_tao,
        nd.duong_dan_anh_dai_dien,
        -- Business info for owners (first business only)
        dn.id_doanh_nghiep,
        dn.ten_doanh_nghiep,
        -- Count owned stations
        (SELECT COUNT(*) FROM tram_sac WHERE id_doanh_nghiep = dn.id_doanh_nghiep) as so_tram_quan_ly,
        -- Count bookings (last 30 days)
        (SELECT COUNT(*) 
         FROM dat_cho 
         WHERE id_nguoi_dung = nd.id_nguoi_dung 
         AND ngay_tao >= NOW() - INTERVAL '30 days'
        ) as so_dat_cho_30_ngay
        
      FROM nguoi_dung nd
      LEFT JOIN doanh_nghiep dn ON dn.id_chu_so_huu = nd.id_nguoi_dung
      
      ${whereClause}
      ORDER BY nd.id_nguoi_dung, dn.ngay_tao DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT nd.id_nguoi_dung) as total
      FROM nguoi_dung nd
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params.slice(0, paramIndex - 1));

    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    };
  }

  /**
   * Get user statistics
   * @returns {Promise<object>} Statistics
   */
  async getUserStats() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN vai_tro = 'user' THEN 1 END) as users,
        COUNT(CASE WHEN vai_tro = 'owner' THEN 1 END) as owners,
        COUNT(CASE WHEN vai_tro = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN trang_thai = 'hoat_dong' THEN 1 END) as active,
        COUNT(CASE WHEN trang_thai = 'khoa' THEN 1 END) as blocked,
        COUNT(CASE WHEN trang_thai = 'cho_xac_thuc' THEN 1 END) as pending
      FROM nguoi_dung
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    return {
      total_users: parseInt(stats.total_users) || 0,
      by_role: {
        user: parseInt(stats.users) || 0,
        owner: parseInt(stats.owners) || 0,
        admin: parseInt(stats.admins) || 0,
      },
      by_status: {
        hoat_dong: parseInt(stats.active) || 0,
        khoa: parseInt(stats.blocked) || 0,
        cho_xac_thuc: parseInt(stats.pending) || 0,
      },
    };
  }

  /**
   * Get user detail by ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} User details
   */
  async getUserDetail(userId) {
    const query = `
      SELECT 
        nd.*,
        -- Business info for owners
        dn.id_doanh_nghiep,
        dn.ten_doanh_nghiep,
        dn.dia_chi as dia_chi_doanh_nghiep,
        dn.email_lien_he as email_doanh_nghiep,
        dn.so_dien_thoai as sdt_doanh_nghiep,
        -- Stats
        COUNT(DISTINCT ts.id_tram) as so_tram_quan_ly,
        COUNT(DISTINCT dc.id_dat_cho) as tong_dat_cho,
        COUNT(DISTINCT CASE WHEN dc.trang_thai = 'hoan_thanh' THEN dc.id_dat_cho END) as dat_cho_hoan_thanh,
        COUNT(DISTINCT ps.id_phien_sac) as tong_phien_sac,
        COALESCE(SUM(ps.dien_nang_kwh), 0) as tong_dien_tieu_thu
        
      FROM nguoi_dung nd
      LEFT JOIN doanh_nghiep dn ON dn.id_chu_so_huu = nd.id_nguoi_dung
      LEFT JOIN tram_sac ts ON ts.id_doanh_nghiep = dn.id_doanh_nghiep
      LEFT JOIN dat_cho dc ON dc.id_nguoi_dung = nd.id_nguoi_dung
      LEFT JOIN phien_sac ps ON ps.id_dat_cho = dc.id_dat_cho
      
      WHERE nd.id_nguoi_dung = $1
      GROUP BY 
        nd.id_nguoi_dung,
        dn.id_doanh_nghiep,
        dn.ten_doanh_nghiep,
        dn.dia_chi,
        dn.email_lien_he,
        dn.so_dien_thoai
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new Error('Không tìm thấy người dùng');
    }

    const user = result.rows[0];

    // Get stations list for owners
    if (user.vai_tro === 'owner' && user.id_doanh_nghiep) {
      const stationsQuery = `
        SELECT 
          ts.id_tram,
          ts.ten_tram,
          ts.dia_chi,
          ts.trang_thai_duyet,
          ts.ngay_tao,
          COALESCE(lsg.gia_kwh, 0) as gia_kwh,
          COUNT(DISTINCT cs.id_cong_sac) as so_cong_sac,
          COUNT(DISTINCT CASE WHEN cs.trang_thai = 'trong' THEN cs.id_cong_sac END) as cong_trong
        FROM tram_sac ts
        LEFT JOIN cong_sac cs ON cs.id_tram = ts.id_tram
        LEFT JOIN lich_su_gia_tram lsg 
          ON lsg.id_tram = ts.id_tram
          AND lsg.trang_thai = 'active'
          AND NOW() BETWEEN lsg.hieu_luc_tu AND COALESCE(lsg.hieu_luc_den, '9999-12-31')
        WHERE ts.id_doanh_nghiep = $1
        GROUP BY 
          ts.id_tram,
          ts.ten_tram,
          ts.dia_chi,
          ts.trang_thai_duyet,
          ts.ngay_tao,
          lsg.gia_kwh
        ORDER BY ts.ngay_tao DESC
      `;

      const stationsResult = await pool.query(stationsQuery, [user.id_doanh_nghiep]);
      user.stations = stationsResult.rows;
    }

    return user;
  }

  /**
   * Update user status
   * @param {number} userId - User ID
   * @param {string} status - New status ('hoat_dong', 'khoa', 'cho_xac_thuc')
   * @param {number} adminId - Admin user ID
   * @returns {Promise<object>} Updated user
   */
  async updateUserStatus(userId, status, adminId) {
    // Validate status
    const validStatuses = ['hoat_dong', 'khoa', 'cho_xac_thuc'];
    if (!validStatuses.includes(status)) {
      throw new Error('Trạng thái không hợp lệ');
    }

    // Don't allow blocking admin accounts
    const checkQuery = 'SELECT vai_tro FROM nguoi_dung WHERE id_nguoi_dung = $1';
    const checkResult = await pool.query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (checkResult.rows[0].vai_tro === 'admin' && status === 'khoa') {
      throw new Error('Không thể khóa tài khoản admin');
    }

    const query = `
      UPDATE nguoi_dung
      SET trang_thai = $2
      WHERE id_nguoi_dung = $1
      RETURNING *
    `;

    const result = await pool.query(query, [userId, status]);

    return result.rows[0];
  }

  /**
   * Delete user (soft delete by blocking)
   * @param {number} userId - User ID
   * @param {number} adminId - Admin user ID
   * @returns {Promise<object>} Updated user
   */
  async deleteUser(userId, adminId) {
    // Don't allow deleting admin accounts
    const checkQuery = 'SELECT vai_tro FROM nguoi_dung WHERE id_nguoi_dung = $1';
    const checkResult = await pool.query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (checkResult.rows[0].vai_tro === 'admin') {
      throw new Error('Không thể xóa tài khoản admin');
    }

    // For now, just block the user (soft delete)
    return this.updateUserStatus(userId, 'khoa', adminId);
  }
}

export default new AdminUserService();

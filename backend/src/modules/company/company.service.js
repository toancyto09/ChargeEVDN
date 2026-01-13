import { pool } from '../../config/db.js';

/**
 * Company Service
 * Handles business company operations
 */

class CompanyService {
  /**
   * Create a new company (Admin only)
   */
  async createCompany(data) {
    const { id_chu_so_huu, ten_doanh_nghiep, dia_chi, email_lien_he, so_dien_thoai } = data;

    const query = `
      INSERT INTO doanh_nghiep (
        id_chu_so_huu,
        ten_doanh_nghiep,
        dia_chi,
        email_lien_he,
        so_dien_thoai,
        trang_thai
      ) VALUES ($1, $2, $3, $4, $5, 'cho_duyet')
      RETURNING *
    `;

    const result = await pool.query(query, [
      id_chu_so_huu,
      ten_doanh_nghiep,
      dia_chi,
      email_lien_he,
      so_dien_thoai
    ]);

    return result.rows[0];
  }

  /**
   * Get all companies (Admin only)
   */
  async getAllCompanies(filters = {}) {
    const { trang_thai, search, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (trang_thai) {
      whereConditions.push(`dn.trang_thai = $${paramCount}`);
      params.push(trang_thai);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(
        dn.ten_doanh_nghiep ILIKE $${paramCount} OR 
        dn.email_lien_he ILIKE $${paramCount} OR
        nd.ho_ten ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM doanh_nghiep dn
      LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = dn.id_chu_so_huu
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get companies
    const query = `
      SELECT 
        dn.*,
        nd.ho_ten as ten_chu_so_huu,
        nd.email as email_chu_so_huu,
        nd.so_dien_thoai as sdt_chu_so_huu
      FROM doanh_nghiep dn
      LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = dn.id_chu_so_huu
      ${whereClause}
      ORDER BY dn.ngay_tao DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      companies: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id) {
    const query = `
      SELECT 
        dn.*,
        nd.ho_ten as ten_chu_so_huu,
        nd.email as email_chu_so_huu,
        nd.so_dien_thoai as sdt_chu_so_huu,
        nd.vai_tro
      FROM doanh_nghiep dn
      LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = dn.id_chu_so_huu
      WHERE dn.id_doanh_nghiep = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get company by owner ID
   */
  async getCompanyByOwnerId(ownerId) {
    const query = `
      SELECT 
        dn.*,
        nd.ho_ten as ten_chu_so_huu,
        nd.email as email_chu_so_huu
      FROM doanh_nghiep dn
      LEFT JOIN nguoi_dung nd ON nd.id_nguoi_dung = dn.id_chu_so_huu
      WHERE dn.id_chu_so_huu = $1
    `;

    const result = await pool.query(query, [ownerId]);
    return result.rows[0] || null;
  }

  /**
   * Update company (Admin or Owner)
   */
  async updateCompany(id, data, isOwnerUpdate = false) {
    const { ten_doanh_nghiep, dia_chi, email_lien_he, so_dien_thoai } = data;

    // If owner updates, set status back to pending review
    const trang_thai = isOwnerUpdate ? 'cho_duyet' : data.trang_thai;

    const query = `
      UPDATE doanh_nghiep 
      SET 
        ten_doanh_nghiep = COALESCE($1, ten_doanh_nghiep),
        dia_chi = COALESCE($2, dia_chi),
        email_lien_he = COALESCE($3, email_lien_he),
        so_dien_thoai = COALESCE($4, so_dien_thoai),
        trang_thai = COALESCE($5, trang_thai)
      WHERE id_doanh_nghiep = $6
      RETURNING *
    `;

    const result = await pool.query(query, [
      ten_doanh_nghiep,
      dia_chi,
      email_lien_he,
      so_dien_thoai,
      trang_thai,
      id
    ]);

    return result.rows[0];
  }

  /**
   * Approve company (Admin only)
   */
  async approveCompany(id) {
    const query = `
      UPDATE doanh_nghiep 
      SET trang_thai = 'da_duyet'
      WHERE id_doanh_nghiep = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Reject company (Admin only)
   */
  async rejectCompany(id) {
    const query = `
      UPDATE doanh_nghiep 
      SET trang_thai = 'tu_choi'
      WHERE id_doanh_nghiep = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Delete company (Admin only)
   */
  async deleteCompany(id) {
    const query = 'DELETE FROM doanh_nghiep WHERE id_doanh_nghiep = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get statistics
   */
  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE trang_thai = 'cho_duyet') as cho_duyet,
        COUNT(*) FILTER (WHERE trang_thai = 'da_duyet') as da_duyet,
        COUNT(*) FILTER (WHERE trang_thai = 'tu_choi') as tu_choi,
        COUNT(*) FILTER (WHERE trang_thai = 'active') as active
      FROM doanh_nghiep
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

export default new CompanyService();

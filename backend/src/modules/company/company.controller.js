import companyService from './company.service.js';

/**
 * Company Controller
 * Handles HTTP requests for company management
 */

class CompanyController {
  /**
   * Create company (Admin only)
   * POST /api/admin/companies
   */
  async createCompany(req, res) {
    try {
      const company = await companyService.createCompany(req.body);

      return res.status(201).json({
        success: true,
        message: 'Tạo doanh nghiệp thành công',
        data: company
      });
    } catch (error) {
      console.error('Create company error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo doanh nghiệp'
      });
    }
  }

  /**
   * Get all companies (Admin only)
   * GET /api/admin/companies
   */
  async getAllCompanies(req, res) {
    try {
      const { trang_thai, search, page, limit } = req.query;

      const result = await companyService.getAllCompanies({
        trang_thai,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      return res.json({
        success: true,
        data: result.companies,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get companies error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải danh sách doanh nghiệp'
      });
    }
  }

  /**
   * Get company by ID (Admin only)
   * GET /api/admin/companies/:id
   */
  async getCompanyById(req, res) {
    try {
      const company = await companyService.getCompanyById(req.params.id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy doanh nghiệp'
        });
      }

      return res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Get company error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải thông tin doanh nghiệp'
      });
    }
  }

  /**
   * Update company (Admin only)
   * PUT /api/admin/companies/:id
   */
  async updateCompany(req, res) {
    try {
      const company = await companyService.updateCompany(
        req.params.id,
        req.body,
        false // Admin update - can change status
      );

      return res.json({
        success: true,
        message: 'Cập nhật doanh nghiệp thành công',
        data: company
      });
    } catch (error) {
      console.error('Update company error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật doanh nghiệp'
      });
    }
  }

  /**
   * Approve company (Admin only)
   * POST /api/admin/companies/:id/approve
   */
  async approveCompany(req, res) {
    try {
      const company = await companyService.approveCompany(req.params.id);

      return res.json({
        success: true,
        message: 'Duyệt doanh nghiệp thành công',
        data: company
      });
    } catch (error) {
      console.error('Approve company error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi duyệt doanh nghiệp'
      });
    }
  }

  /**
   * Reject company (Admin only)
   * POST /api/admin/companies/:id/reject
   */
  async rejectCompany(req, res) {
    try {
      const company = await companyService.rejectCompany(req.params.id);

      return res.json({
        success: true,
        message: 'Từ chối doanh nghiệp thành công',
        data: company
      });
    } catch (error) {
      console.error('Reject company error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi từ chối doanh nghiệp'
      });
    }
  }

  /**
   * Delete company (Admin only)
   * DELETE /api/admin/companies/:id
   */
  async deleteCompany(req, res) {
    try {
      await companyService.deleteCompany(req.params.id);

      return res.json({
        success: true,
        message: 'Xóa doanh nghiệp thành công'
      });
    } catch (error) {
      console.error('Delete company error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa doanh nghiệp'
      });
    }
  }

  /**
   * Get statistics (Admin only)
   * GET /api/admin/companies/stats
   */
  async getStats(req, res) {
    try {
      const stats = await companyService.getStats();

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải thống kê'
      });
    }
  }

  // ========================================
  // OWNER ENDPOINTS
  // ========================================

  /**
   * Get owner's company
   * GET /api/owner/company-profile
   */
  async getOwnerCompany(req, res) {
    try {
      const userId = req.user.id_nguoi_dung || req.user.userId;
      const company = await companyService.getCompanyByOwnerId(userId);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Bạn chưa có doanh nghiệp nào'
        });
      }

      return res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Get owner company error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải thông tin doanh nghiệp'
      });
    }
  }

  /**
   * Update owner's company (will set status to pending review)
   * PUT /api/owner/company-profile
   */
  async updateOwnerCompany(req, res) {
    try {
      const userId = req.user.id_nguoi_dung || req.user.userId;
      
      // Get owner's company first
      const company = await companyService.getCompanyByOwnerId(userId);
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Bạn chưa có doanh nghiệp nào'
        });
      }

      // Update with owner flag (will set status to cho_duyet)
      const updatedCompany = await companyService.updateCompany(
        company.id_doanh_nghiep,
        req.body,
        true // Owner update - reset status to pending
      );

      return res.json({
        success: true,
        message: 'Cập nhật thông tin thành công. Vui lòng chờ admin duyệt.',
        data: updatedCompany
      });
    } catch (error) {
      console.error('Update owner company error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật doanh nghiệp'
      });
    }
  }
}

export default new CompanyController();

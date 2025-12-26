import adminUserService from './admin.user.service.js';

/**
 * Admin User Controller
 * Handle HTTP requests for user management
 */
class AdminUserController {
  /**
   * GET /api/admin/users
   * Get all users with filters
   */
  async getUsers(req, res, next) {
    try {
      const { role, status, search, limit, offset } = req.query;

      const result = await adminUserService.getUsers({
        role,
        status,
        search,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users/stats
   * Get user statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await adminUserService.getUserStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users/:id
   * Get user detail by ID
   */
  async getUserDetail(req, res, next) {
    try {
      const { id } = req.params;

      const user = await adminUserService.getUserDetail(parseInt(id));

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/users/:id/status
   * Update user status
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.user.id_nguoi_dung || req.user.userId;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp trạng thái',
        });
      }

      const user = await adminUserService.updateUserStatus(
        parseInt(id),
        status,
        adminId
      );

      res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/users/:id
   * Delete user (soft delete)
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id_nguoi_dung || req.user.userId;

      const user = await adminUserService.deleteUser(parseInt(id), adminId);

      res.json({
        success: true,
        message: 'Xóa người dùng thành công',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/users
   * Create new user
   */
  async createUser(req, res, next) {
    try {
      const adminId = req.user.id_nguoi_dung || req.user.userId;
      const userData = req.body;

      const newUser = await adminUserService.createUser(userData, adminId);

      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản thành công',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/users/:id
   * Update user information
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id_nguoi_dung || req.user.userId;
      const updateData = req.body;

      const user = await adminUserService.updateUser(
        parseInt(id),
        updateData,
        adminId
      );

      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/users/:id/role
   * Change user role
   */
  async changeUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const adminId = req.user.id_nguoi_dung || req.user.userId;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp vai trò mới',
        });
      }

      const user = await adminUserService.changeUserRole(
        parseInt(id),
        role,
        adminId
      );

      res.json({
        success: true,
        message: 'Thay đổi vai trò thành công',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/users/:id/reset-password
   * Reset user password
   */
  async resetUserPassword(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id_nguoi_dung || req.user.userId;

      const result = await adminUserService.resetUserPassword(
        parseInt(id),
        adminId
      );

      res.json({
        success: true,
        message: 'Reset mật khẩu thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminUserController();

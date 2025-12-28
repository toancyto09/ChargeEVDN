import auditLogService from '../../../services/auditLog.service.js';

/**
 * Admin Audit Log Controller
 * Handle requests for viewing audit logs
 */
class AdminAuditLogController {
  /**
   * GET /api/admin/audit-logs
   * Get audit logs with filters
   */
  async getLogs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 50,
        action,
        userId,
        startDate,
        endDate,
        search,
      } = req.query;

      const result = await auditLogService.getLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        userId: userId ? parseInt(userId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        search,
      });

      res.json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/audit-logs/statistics
   * Get audit log statistics
   */
  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const stats = await auditLogService.getStatistics(start, end);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/audit-logs/timeline
   * Get activity timeline
   */
  async getTimeline(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const timeline = await auditLogService.getActivityTimeline(start, end);

      res.json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminAuditLogController();

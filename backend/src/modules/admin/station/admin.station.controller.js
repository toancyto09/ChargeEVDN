import adminStationService from './admin.station.service.js';

/**
 * Admin Station Controller
 * Handle HTTP requests for station approval
 */
class AdminStationController {
  /**
   * GET /api/admin/stations
   * Get all stations for admin review
   */
  async getStations(req, res, next) {
    try {
      const { status, limit, offset } = req.query;

      const result = await adminStationService.getStations({
        status,
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
   * GET /api/admin/stations/stats
   * Get station statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await adminStationService.getStationStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/stations/:id
   * Get station detail by ID
   */
  async getStationDetail(req, res, next) {
    try {
      const { id } = req.params;

      const station = await adminStationService.getStationDetail(parseInt(id));

      res.json({
        success: true,
        data: station,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/stations/:id/approve
   * Approve a station
   */
  async approveStation(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id_nguoi_dung || req.user.userId;

      const station = await adminStationService.approveStation(
        parseInt(id),
        adminId
      );

      res.json({
        success: true,
        message: 'Duyệt trạm sạc thành công',
        data: station,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/stations/:id/reject
   * Reject a station with reason
   */
  async rejectStation(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id_nguoi_dung || req.user.userId;

      if (!reason || reason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập lý do từ chối',
        });
      }

      const station = await adminStationService.rejectStation(
        parseInt(id),
        adminId,
        reason
      );

      res.json({
        success: true,
        message: 'Từ chối trạm sạc thành công',
        data: station,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminStationController();

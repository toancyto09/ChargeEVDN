import ownerSessionService from './owner.session.service.js';

/**
 * Owner Session Controller
 * Handle HTTP requests for owner session management
 */
class OwnerSessionController {
  /**
   * Get all sessions for owner's stations
   * GET /api/owner/sessions
   */
  async getSessions(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      
      const filters = {
        stationId: req.query.station_id,
        status: req.query.status,
        startDate: req.query.start_date,
        endDate: req.query.end_date,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
      };

      const result = await ownerSessionService.getOwnerSessions(userId, filters);

      res.status(200).json({
        success: true,
        data: result.sessions,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.sessions.length < result.total,
        },
      });
    } catch (error) {
      console.error('Get owner sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách phiên sạc',
        error: error.message,
      });
    }
  }

  /**
   * Get session statistics
   * GET /api/owner/sessions/stats
   */
  async getStats(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      
      const filters = {
        stationId: req.query.station_id,
        startDate: req.query.start_date,
        endDate: req.query.end_date,
      };

      const stats = await ownerSessionService.getSessionStats(userId, filters);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get session stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy thống kê phiên sạc',
        error: error.message,
      });
    }
  }

  /**
   * Get session detail
   * GET /api/owner/sessions/:id
   */
  async getSessionDetail(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;

      // Validate session ID
      const sessionId = parseInt(id);
      if (isNaN(sessionId) || sessionId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID phiên sạc không hợp lệ',
        });
      }

      const session = await ownerSessionService.getSessionDetail(
        sessionId,
        userId
      );

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error('Get session detail error:', error);
      
      if (error.message.includes('Không tìm thấy')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Không thể lấy chi tiết phiên sạc',
        error: error.message,
      });
    }
  }
}

export default new OwnerSessionController();

import * as ownerStationService from './owner.station.service.js';

/**
 * Owner Station Controller
 * Handles HTTP requests for owner station management
 */

class OwnerStationController {
  /**
   * Get all stations owned by this user
   * GET /api/owner/stations
   */
  async getStations(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung; // JWT token uses 'id'
      
      const stations = await ownerStationService.getOwnerStations(userId);

      res.status(200).json({
        success: true,
        data: stations
      });

    } catch (error) {
      console.error('Get owner stations error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách trạm',
        error: error.message
      });
    }
  }

  /**
   * Get single station detail
   * GET /api/owner/stations/:id
   */
  async getStation(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung; // JWT token uses 'id'
      const { id } = req.params;

      const station = await ownerStationService.getOwnerStation(id, userId);

      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy trạm hoặc bạn không có quyền truy cập'
        });
      }

      res.status(200).json({
        success: true,
        data: station
      });

    } catch (error) {
      console.error('Get owner station error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin trạm',
        error: error.message
      });
    }
  }

  /**
   * Create new station
   * POST /api/owner/stations
   */
  async createStation(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung; // JWT token uses 'id'
      const stationData = req.body;

      // Validate required fields
      const { ten_tram, dia_chi, kinh_do, vi_do } = stationData;
      
      if (!ten_tram || !dia_chi || !kinh_do || !vi_do) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: tên trạm, địa chỉ, kinh độ, vĩ độ'
        });
      }

      const station = await ownerStationService.createStation(userId, stationData);

      res.status(201).json({
        success: true,
        message: 'Tạo trạm thành công. Đang chờ admin phê duyệt.',
        data: station
      });

    } catch (error) {
      console.error('Create station error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo trạm',
        error: error.message
      });
    }
  }

  /**
   * Update station
   * PUT /api/owner/stations/:id
   */
  async updateStation(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung; // JWT token uses 'id'
      const { id } = req.params;
      const updates = req.body;

      const station = await ownerStationService.updateStation(id, userId, updates);

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạm thành công',
        data: station
      });

    } catch (error) {
      console.error('Update station error:', error);
      
      if (error.message.includes('Không có quyền')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạm',
        error: error.message
      });
    }
  }

  /**
   * Delete station
   * DELETE /api/owner/stations/:id
   */
  async deleteStation(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung; // JWT token uses 'id'
      const { id } = req.params;

      await ownerStationService.deleteStation(id, userId);

      res.status(200).json({
        success: true,
        message: 'Xóa trạm thành công'
      });

    } catch (error) {
      console.error('Delete station error:', error);
      
      if (error.message.includes('Không có quyền')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('đang hoạt động')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa trạm',
        error: error.message
      });
    }
  }
}

export default new OwnerStationController();


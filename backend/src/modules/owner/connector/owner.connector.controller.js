import * as ownerConnectorService from './owner.connector.service.js';

/**
 * Owner Connector Controller
 * Handles HTTP requests for connector management
 */

class OwnerConnectorController {
  /**
   * Get all connectors for a station
   * GET /api/owner/stations/:stationId/connectors
   */
  async getConnectors(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { stationId } = req.params;

      const connectors = await ownerConnectorService.getStationConnectors(
        userId,
        parseInt(stationId)
      );

      res.status(200).json({
        success: true,
        data: connectors
      });

    } catch (error) {
      console.error('Get connectors error:', error);
      res.status(error.message.includes('quyền') ? 403 : 500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách cổng sạc'
      });
    }
  }

  /**
   * Get available connector types
   * GET /api/owner/connector-types
   */
  async getConnectorTypes(req, res) {
    try {
      const types = await ownerConnectorService.getConnectorTypes();

      res.status(200).json({
        success: true,
        data: types
      });

    } catch (error) {
      console.error('Get connector types error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy loại cổng sạc'
      });
    }
  }

  /**
   * Create new connector
   * POST /api/owner/stations/:stationId/connectors
   */
  async createConnector(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { stationId } = req.params;
      const connectorData = req.body;

      // Validate required fields
      if (!connectorData.ma_cong_tram) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu mã cổng trạm'
        });
      }

      if (!connectorData.id_loai_cong) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu loại cổng'
        });
      }

      if (!connectorData.cong_suat_kwh) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu công suất'
        });
      }

      const connector = await ownerConnectorService.createConnector(
        userId,
        parseInt(stationId),
        connectorData
      );

      res.status(201).json({
        success: true,
        message: 'Thêm cổng sạc thành công',
        data: connector
      });

    } catch (error) {
      console.error('Create connector error:', error);
      
      const statusCode = 
        error.message.includes('quyền') ? 403 :
        error.message.includes('đã tồn tại') ? 409 :
        400;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi thêm cổng sạc'
      });
    }
  }

  /**
   * Update connector
   * PUT /api/owner/connectors/:id
   */
  async updateConnector(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;
      const connectorData = req.body;

      const connector = await ownerConnectorService.updateConnector(
        userId,
        parseInt(id),
        connectorData
      );

      res.status(200).json({
        success: true,
        message: 'Cập nhật cổng sạc thành công',
        data: connector
      });

    } catch (error) {
      console.error('Update connector error:', error);
      
      const statusCode = 
        error.message.includes('quyền') ? 403 :
        error.message.includes('đã tồn tại') ? 409 :
        400;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật cổng sạc'
      });
    }
  }

  /**
   * Delete connector
   * DELETE /api/owner/connectors/:id
   */
  async deleteConnector(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;

      await ownerConnectorService.deleteConnector(userId, parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Xóa cổng sạc thành công'
      });

    } catch (error) {
      console.error('Delete connector error:', error);
      
      const statusCode = 
        error.message.includes('quyền') ? 403 :
        error.message.includes('đang được sử dụng') || 
        error.message.includes('đang hoạt động') ? 409 :
        400;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi xóa cổng sạc'
      });
    }
  }

  /**
   * Change connector status
   * PATCH /api/owner/connectors/:id/status
   */
  async changeStatus(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;
      const { trang_thai } = req.body;

      if (!trang_thai) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu trạng thái mới'
        });
      }

      const connector = await ownerConnectorService.changeConnectorStatus(
        userId,
        parseInt(id),
        trang_thai
      );

      res.status(200).json({
        success: true,
        message: 'Thay đổi trạng thái thành công',
        data: connector
      });

    } catch (error) {
      console.error('Change status error:', error);
      
      const statusCode = 
        error.message.includes('quyền') ? 403 :
        error.message.includes('không hợp lệ') ? 400 :
        500;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi khi thay đổi trạng thái'
      });
    }
  }
}

export default new OwnerConnectorController();


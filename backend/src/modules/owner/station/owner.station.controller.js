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
   * Get QR Code data for station (DEPRECATED - use getConnectorQR instead)
   * GET /api/owner/stations/:id/qr
   */
  async getStationQR(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;

      // Verify ownership
      const station = await ownerStationService.getOwnerStation(id, userId);

      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy trạm hoặc bạn không có quyền truy cập'
        });
      }

      // Generate QR data (kept for backward compatibility)
      const qrData = {
        type: 'station_checkin',
        stationId: parseInt(id),
        stationName: station.ten_tram,
        address: station.dia_chi,
        timestamp: Date.now(),
        version: '1.0'
      };

      res.status(200).json({
        success: true,
        data: {
          qrData: JSON.stringify(qrData),
          station: {
            id: station.id_tram,
            name: station.ten_tram,
            address: station.dia_chi
          }
        }
      });

    } catch (error) {
      console.error('Get station QR error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo QR code',
        error: error.message
      });
    }
  }

  /**
   * Get QR Code data for a specific connector (RECOMMENDED)
   * GET /api/owner/connectors/:connectorId/qr
   */
  async getConnectorQR(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { connectorId } = req.params;

      // Get connector details with station info and verify ownership
      const connectorQuery = `
        SELECT 
          cs.id_cong_sac,
          cs.ma_cong_tram,
          cs.cong_suat_kwh,
          cs.trang_thai,
          lcs.ma_cong as loai_cong,
          ts.id_tram,
          ts.ten_tram,
          ts.dia_chi,
          dn.id_chu_so_huu
        FROM cong_sac cs
        JOIN tram_sac ts ON ts.id_tram = cs.id_tram
        JOIN doanh_nghiep dn ON dn.id_doanh_nghiep = ts.id_doanh_nghiep
        JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
        WHERE cs.id_cong_sac = $1
      `;

      const { pool } = await import('../../../config/db.js');
      const result = await pool.query(connectorQuery, [connectorId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy cổng sạc'
        });
      }

      const connector = result.rows[0];

      // Verify ownership
      if (connector.id_chu_so_huu !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền tạo QR cho cổng sạc này'
        });
      }

      // Generate QR data for CONNECTOR
      const qrData = {
        type: 'connector_checkin',
        connectorId: parseInt(connectorId),
        connectorCode: connector.ma_cong_tram,
        connectorType: connector.loai_cong,
        power: connector.cong_suat_kwh,
        stationId: connector.id_tram,
        stationName: connector.ten_tram,
        address: connector.dia_chi,
        timestamp: Date.now(),
        version: '2.0'
      };

      res.status(200).json({
        success: true,
        data: {
          qrData: JSON.stringify(qrData),
          connector: {
            id: connector.id_cong_sac,
            code: connector.ma_cong_tram,
            type: connector.loai_cong,
            power: connector.cong_suat_kwh,
            status: connector.trang_thai,
            station: {
              id: connector.id_tram,
              name: connector.ten_tram,
              address: connector.dia_chi
            }
          }
        }
      });

    } catch (error) {
      console.error('Get connector QR error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo QR code cho cổng sạc',
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


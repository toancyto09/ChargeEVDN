import * as sessionService from './session.service.js';

/**
 * Session Controller
 * Handles HTTP requests for charging session operations
 */

class SessionController {
  /**
   * Start a charging session
   * POST /api/sessions/start
   */
  async startSession(req, res) {
    try {
      const { bookingId } = req.body;
      const userId = req.user.id_nguoi_dung;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin booking ID'
        });
      }

      const session = await sessionService.startSession(bookingId);

      res.status(201).json({
        success: true,
        message: 'Bắt đầu sạc thành công',
        data: session
      });

    } catch (error) {
      console.error('Start session error:', error);
      
      if (error.message.includes('Không tìm thấy') || 
          error.message.includes('không ở trạng thái') ||
          error.message.includes('đã được bắt đầu')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi khi bắt đầu session sạc',
        error: error.message
      });
    }
  }

  /**
   * Finish a charging session
   * POST /api/sessions/:id/finish
   */
  async finishSession(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id_nguoi_dung;
      const { dien_nang_kwh, soc_truoc, soc_sau } = req.body;

      // Validation
      if (!dien_nang_kwh || dien_nang_kwh <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Điện năng tiêu thụ phải lớn hơn 0'
        });
      }

      if (soc_truoc !== undefined && soc_sau !== undefined) {
        if (soc_truoc < 0 || soc_truoc > 100 || soc_sau < 0 || soc_sau > 100) {
          return res.status(400).json({
            success: false,
            message: 'SOC phải trong khoảng 0-100'
          });
        }
      }

      const result = await sessionService.finishSession(parseInt(id), {
        dien_nang_kwh: parseFloat(dien_nang_kwh),
        soc_truoc: soc_truoc ? parseInt(soc_truoc) : null,
        soc_sau: soc_sau ? parseInt(soc_sau) : null
      });

      res.status(200).json({
        success: true,
        message: 'Kết thúc sạc thành công. Vui lòng thanh toán.',
        data: result
      });

    } catch (error) {
      console.error('Finish session error:', error);
      
      if (error.message.includes('Không tìm thấy') || 
          error.message.includes('không ở trạng thái')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi khi kết thúc session sạc',
        error: error.message
      });
    }
  }

  /**
   * Get session details by ID
   * GET /api/sessions/:id
   */
  async getSessionById(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(req.user.id); // Use .id not .id_nguoi_dung

      const session = await sessionService.getSessionById(parseInt(id));

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy session'
        });
      }

      // Check ownership - compare as integers
      if (parseInt(session.id_nguoi_dung) !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem session này'
        });
      }

      res.status(200).json({
        success: true,
        data: session
      });

    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin session',
        error: error.message
      });
    }
  }

  /**
   * Get user sessions with filters
   * GET /api/sessions?status=completed
   */
  async getUserSessions(req, res) {
    try {
      const userId = parseInt(req.user.id);
      const { status } = req.query;

      const sessions = await sessionService.getUserSessions(userId, status);

      res.status(200).json({
        success: true,
        data: sessions,
        count: sessions.length
      });

    } catch (error) {
      console.error('Get user sessions error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách session',
        error: error.message
      });
    }
  }

  /**
   * Get unpaid sessions for current user
   * GET /api/sessions/unpaid
   */
  async getUnpaidSessions(req, res) {
    try {
      const userId = parseInt(req.user.id);

      const sessions = await sessionService.getUnpaidSessions(userId);

      res.status(200).json({
        success: true,
        data: sessions,
        count: sessions.length
      });

    } catch (error) {
      console.error('Get unpaid sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách session chưa thanh toán',
        error: error.message
      });
    }
  }

  /**
   * Check-in via QR code (Station-level)
   * POST /api/sessions/checkin-qr
   */
  async checkInWithQR(req, res) {
    try {
      const { station_id } = req.body;
      const userId = req.user.id_nguoi_dung;

      if (!station_id) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin station_id từ QR code'
        });
      }

      const result = await sessionService.checkInWithQR(
        userId, 
        parseInt(station_id)
      );

      res.status(200).json({
        success: true,
        message: 'Check-in thành công! Đang bắt đầu sạc...',
        data: result
      });

    } catch (error) {
      console.error('QR check-in error:', error);
      
      // User-friendly errors
      const userErrors = [
        'Chưa đến giờ',
        'không đúng với đặt chỗ',
        'chưa có đặt chỗ',
        'đã được bắt đầu',
        'đã hết hạn'
      ];
      
      if (userErrors.some(msg => error.message.includes(msg))) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi khi check-in. Vui lòng thử lại',
        error: error.message
      });
    }
  }
}

export default new SessionController();

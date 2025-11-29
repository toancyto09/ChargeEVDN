import bookingService from './booking.service.js';

/**
 * Booking Controller
 * Handles HTTP requests for booking management
 */

class BookingController {
  /**
   * Create a new booking
   * POST /api/bookings
   */
  async createBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingData = req.body;

      // Validate required fields
      const required = ['id_phuong_tien', 'id_cong_sac', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'uoc_tinh_kwh'];
      for (const field of required) {
        if (!bookingData[field]) {
          return res.status(400).json({
            success: false,
            message: `Missing required field: ${field}`
          });
        }
      }

      // Validate time range
      const startTime = new Date(bookingData.thoi_gian_bat_dau);
      const endTime = new Date(bookingData.thoi_gian_ket_thuc);
      
      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: 'Start time must be before end time'
        });
      }

      if (startTime < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot book in the past'
        });
      }

      // Check connector availability
      const isAvailable = await bookingService.checkConnectorAvailability(
        bookingData.id_cong_sac,
        startTime,
        endTime
      );

      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: 'Connector is not available for the selected time'
        });
      }

      const booking = await bookingService.createBooking(userId, bookingData);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      
      // Handle business logic errors (400)
      const businessErrors = [
        'Bạn đã có 3 đặt chỗ',
        'lịch đặt chỗ trùng giờ',
        'không tương thích',
        'Không tìm thấy thông tin'
      ];

      if (businessErrors.some(msg => error.message.includes(msg))) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // System errors (500)
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi tạo đặt chỗ. Vui lòng thử lại sau.',
        error: error.message
      });
    }
  }

  /**
   * Get user's bookings
   * GET /api/bookings
   */
  async getUserBookings(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };

      const result = await bookingService.getUserBookings(userId, filters);

      res.json({
        success: true,
        data: result.bookings,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.bookings.length < result.total
        }
      });
    } catch (error) {
      console.error('❌ Error getting bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bookings',
        error: error.message
      });
    }
  }

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  async getBookingById(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;

      const booking = await bookingService.getBookingById(bookingId, userId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('❌ Error getting booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking',
        error: error.message
      });
    }
  }

  /**
   * Extend booking expiry (for late arrivals)
   * POST /api/bookings/:id/extend
   */
  async extendBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      const { extension_minutes = 15 } = req.body;

      // Validate extension minutes
      if (extension_minutes < 5 || extension_minutes > 60) {
        return res.status(400).json({
          success: false,
          message: 'Thời gian gia hạn phải từ 5-60 phút'
        });
      }

      const result = await bookingService.extendBooking(
        bookingId,
        userId,
        extension_minutes
      );

      res.json({
        success: true,
        message: `Đã gia hạn thêm ${extension_minutes} phút. Phí chờ: ${result.late_fee.toFixed(0)}đ`,
        data: result
      });
    } catch (error) {
      console.error('❌ Error extending booking:', error);

      // Handle business errors
      const businessErrors = [
        'Không tìm thấy booking',
        'Chỉ có thể gia hạn'
      ];

      if (businessErrors.some(msg => error.message.includes(msg))) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Có lỗi khi gia hạn booking',
        error: error.message
      });
    }
  }

  /**
   * Cancel booking
   * DELETE /api/bookings/:id
   */
  async cancelBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;

      const booking = await bookingService.cancelBooking(bookingId, userId);

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      
      if (error.message === 'Booking not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Cannot cancel')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      });
    }
  }

  /**
   * Get available time slots
   * GET /api/bookings/connector/:id/slots
   */
  async getAvailableSlots(req, res) {
    try {
      const connectorId = req.params.id;
      const date = req.query.date || new Date().toISOString().split('T')[0];

      const slots = await bookingService.getAvailableSlots(connectorId, date);

      res.json({
        success: true,
        data: {
          date,
          slots
        }
      });
    } catch (error) {
      console.error('❌ Error getting available slots:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available slots',
        error: error.message
      });
    }
  }
}

export default new BookingController();


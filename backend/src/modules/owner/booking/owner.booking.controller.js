import ownerBookingService from './owner.booking.service.js';

/**
 * Owner Booking Controller
 * Handle HTTP requests for owner booking management
 */
class OwnerBookingController {
  /**
   * Get all bookings for owner's stations
   * GET /api/owner/bookings
   */
  async getBookings(req, res) {
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

      const result = await ownerBookingService.getOwnerBookings(userId, filters);

      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.bookings.length < result.total,
        },
      });
    } catch (error) {
      console.error('Get owner bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách đặt chỗ',
        error: error.message,
      });
    }
  }

  /**
   * Get booking statistics
   * GET /api/owner/bookings/stats
   */
  async getStats(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      
      const filters = {
        stationId: req.query.station_id,
        startDate: req.query.start_date,
        endDate: req.query.end_date,
      };

      const stats = await ownerBookingService.getBookingStats(userId, filters);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get booking stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy thống kê đặt chỗ',
        error: error.message,
      });
    }
  }

  /**
   * Get booking detail
   * GET /api/owner/bookings/:id
   */
  async getBookingDetail(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;

      // Validate booking ID
      const bookingId = parseInt(id);
      if (isNaN(bookingId) || bookingId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID đặt chỗ không hợp lệ',
        });
      }

      const booking = await ownerBookingService.getBookingDetail(
        bookingId,
        userId
      );

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error('Get booking detail error:', error);
      
      if (error.message.includes('Không tìm thấy')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Không thể lấy chi tiết đặt chỗ',
        error: error.message,
      });
    }
  }

  /**
   * Confirm/Approve booking
   * POST /api/owner/bookings/:id/confirm
   */
  async confirmBooking(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;

      // Validate booking ID
      const bookingId = parseInt(id);
      if (isNaN(bookingId) || bookingId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID đặt chỗ không hợp lệ',
        });
      }

      const booking = await ownerBookingService.confirmBooking(
        bookingId,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Đã xác nhận đặt chỗ thành công',
        data: booking,
      });
    } catch (error) {
      console.error('Confirm booking error:', error);

      if (
        error.message.includes('Không tìm thấy') ||
        error.message.includes('không có quyền') ||
        error.message.includes('Không thể xác nhận') ||
        error.message.includes('đã được xác nhận') ||
        error.message.includes('đã bị hủy')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Không thể xác nhận đặt chỗ',
        error: error.message,
      });
    }
  }

  /**
   * Cancel booking
   * POST /api/owner/bookings/:id/cancel
   */
  async cancelBooking(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { id } = req.params;

      const booking = await ownerBookingService.cancelBooking(
        parseInt(id),
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Đã hủy đặt chỗ thành công',
        data: booking,
      });
    } catch (error) {
      console.error('Cancel booking error:', error);

      if (
        error.message.includes('Không tìm thấy') ||
        error.message.includes('không có quyền') ||
        error.message.includes('Không thể hủy') ||
        error.message.includes('đã bị hủy')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Không thể hủy đặt chỗ',
        error: error.message,
      });
    }
  }

  /**
   * Get bookings calendar view
   * GET /api/owner/bookings/calendar
   */
  async getCalendar(req, res) {
    try {
      const userId = req.user.id || req.user.id_nguoi_dung;
      const { start_date, end_date, station_id } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số start_date hoặc end_date',
        });
      }

      const calendar = await ownerBookingService.getBookingsCalendar(
        userId,
        start_date,
        end_date,
        station_id ? parseInt(station_id) : null
      );

      res.status(200).json({
        success: true,
        data: calendar,
      });
    } catch (error) {
      console.error('Get bookings calendar error:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy lịch đặt chỗ',
        error: error.message,
      });
    }
  }
}

export default new OwnerBookingController();


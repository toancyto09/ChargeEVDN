import paymentService from './payment.service.js';

/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */

class PaymentController {
  /**
   * Create payment and get VNPay URL (UPDATED: Support both booking and session)
   * POST /api/payment/create
   */
  async createPayment(req, res) {
    try {
      const { bookingId, sessionId } = req.body;
      const userId = req.user.id_nguoi_dung;
      
      // Must provide either bookingId or sessionId
      if (!bookingId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin booking ID hoặc session ID'
        });
      }

      // Get client IP address
      let ipAddr = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     req.ip ||
                     '127.0.0.1';
      
      // Convert IPv6 localhost to IPv4 for VNPay compatibility
      if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
        ipAddr = '127.0.0.1';
      }

      let payment;

      if (sessionId) {
        // NEW FLOW: Create payment from session (after charging)
        payment = await paymentService.createPaymentFromSession(sessionId, ipAddr);
      } else {
        // OLD FLOW: Create payment from booking (before charging)
        payment = await paymentService.createPayment(bookingId, ipAddr);
      }

      res.status(200).json({
        success: true,
        message: 'Tạo thanh toán thành công',
        data: payment
      });

    } catch (error) {
      console.error('Create payment error:', error);
      
      // Check for specific error messages
      if (error.message.includes('Không tìm thấy') || 
          error.message.includes('không thể thanh toán') ||
          error.message.includes('đã được thanh toán') ||
          error.message.includes('chưa hoàn thành')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo thanh toán',
        error: error.message
      });
    }
  }

  /**
   * Handle VNPay callback
   * GET /api/payment/vnpay/callback
   */
  async handleVNPayCallback(req, res) {
    try {
      const vnpParams = req.query;
      
      const result = await paymentService.handleVNPayCallback(vnpParams);

      // Redirect to frontend with result
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      if (result.success) {
        // Check if this is session-based or booking-based payment
        // Session-based: vnp_TxnRef starts with 'S'
        const isSessionBased = vnpParams.vnp_TxnRef && vnpParams.vnp_TxnRef.startsWith('S');
        
        if (isSessionBased) {
          // Session-based payment - redirect with sessionId
          res.redirect(
            `${frontendUrl}/payment/success?sessionId=${result.sessionId}&paymentId=${result.paymentId}`
          );
        } else {
          // Booking-based payment - redirect with bookingId
          res.redirect(
            `${frontendUrl}/payment/success?bookingId=${result.bookingId}&paymentId=${result.paymentId}`
          );
        }
      } else {
        // Payment failed - redirect to failed page
        res.redirect(
          `${frontendUrl}/payment/failed?message=${encodeURIComponent(result.message)}`
        );
      }

    } catch (error) {
      console.error('VNPay callback error:', error);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(
        `${frontendUrl}/payment/failed?message=${encodeURIComponent('Lỗi xử lý thanh toán')}`
      );
    }
  }

  /**
   * Get payment details by booking ID
   * GET /api/payment/booking/:bookingId
   */
  async getPaymentByBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id_nguoi_dung;

      const payment = await paymentService.getPaymentByBooking(bookingId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin thanh toán'
        });
      }

      res.status(200).json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin thanh toán',
        error: error.message
      });
    }
  }

  /**
   * Get payment details by payment ID
   * GET /api/payment/:paymentId
   */
  async getPaymentById(req, res) {
    try {
      const { paymentId } = req.params;

      const payment = await paymentService.getPaymentById(paymentId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin thanh toán'
        });
      }

      res.status(200).json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin thanh toán',
        error: error.message
      });
    }
  }
}

export default new PaymentController();


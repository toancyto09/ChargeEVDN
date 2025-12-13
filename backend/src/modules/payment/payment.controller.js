import paymentService from './payment.service.js';

/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 * NOTE: Payment ONLY happens AFTER charging session completes
 */

class PaymentController {
  /**
   * Create payment from charging session (PAY AFTER model)
   * POST /api/payment/create
   * Body: { sessionId: number }
   */
  async createPayment(req, res) {
    try {
      const { sessionId } = req.body;
      const userId = req.user.id_nguoi_dung;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu session ID. Chỉ có thể thanh toán sau khi hoàn thành sạc.'
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

      // Create payment from session
      const payment = await paymentService.createPaymentFromSession(sessionId, ipAddr);

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
        // Always session-based payment (vnp_TxnRef starts with 'S')
        res.redirect(
          `${frontendUrl}/payment/success?sessionId=${result.sessionId}&paymentId=${result.paymentId}`
        );
      } else {
        // Payment failed - redirect to failed page
        res.redirect(
          `${frontendUrl}/payment/failed?sessionId=${result.sessionId}&message=${encodeURIComponent(result.message)}`
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
   * Get payment details by session ID
   * GET /api/payment/session/:sessionId
   */
  async getPaymentBySession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id_nguoi_dung;

      const payment = await paymentService.getPaymentBySession(sessionId);

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


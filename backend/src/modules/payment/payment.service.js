import { pool } from '../../config/db.js';
import crypto from 'crypto';
import querystring from 'querystring';
import { vnpayConfig } from '../../config/vnpay.config.js';

/**
 * Payment Service
 * Handles payment processing with VNPay integration
 * NOTE: Payment ONLY happens AFTER charging session completes (PAY AFTER model)
 */

class PaymentService {
  /**
   * Create payment from a completed charging session
   * @param {number} sessionId - ID of the charging session
   * @param {string} ipAddr - Client IP address
   * @returns {object} Payment URL and payment info
   */
  async createPaymentFromSession(sessionId, ipAddr) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get session details with station info
      const sessionQuery = `
        SELECT 
          ps.id_phien_sac,
          ps.id_dat_cho,
          ps.dien_nang_kwh,
          ps.don_gia_kwh,
          ps.phi_cho_phut,
          ps.so_phut_cho,
          ps.trang_thai,
          dc.id_nguoi_dung,
          dc.ma_xac_nhan,
          ts.ten_tram,
          u.ho_ten,
          u.email,
          tt.id_thanh_toan,
          tt.so_tien,
          tt.trang_thai as payment_status
        FROM phien_sac ps
        JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
        JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
        JOIN tram_sac ts ON ts.id_tram = cs.id_tram
        JOIN nguoi_dung u ON u.id_nguoi_dung = dc.id_nguoi_dung
        LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac
        WHERE ps.id_phien_sac = $1
      `;
      
      const sessionResult = await client.query(sessionQuery, [sessionId]);
      
      if (sessionResult.rows.length === 0) {
        throw new Error('Không tìm thấy session');
      }

      const session = sessionResult.rows[0];

      // Check if session is completed
      if (session.trang_thai !== 'hoan_thanh') {
        throw new Error('Session chưa hoàn thành, không thể thanh toán');
      }

      // Check if payment already exists and is successful
      if (session.id_thanh_toan && session.payment_status === 'success') {
        throw new Error('Session này đã được thanh toán rồi');
      }

      let paymentId = session.id_thanh_toan;

      // If payment exists but is pending/failed, reuse it
      if (paymentId) {
        await client.query(
          `UPDATE thanh_toan 
           SET trang_thai = 'pending', 
               ma_giao_dich = NULL,
               ngay_thanh_toan = NULL
           WHERE id_thanh_toan = $1`,
          [paymentId]
        );
      } else {
        // This shouldn't happen because finishSession creates payment
        // But add as fallback
        throw new Error('Payment record không tồn tại. Vui lòng liên hệ hỗ trợ.');
      }

      await client.query('COMMIT');

      // Get payment amount from session
      const amount = Math.round(parseFloat(session.so_tien));

      // Generate VNPay payment URL
      const paymentUrl = this.generateVNPayUrlForSession(
        sessionId,
        paymentId,
        amount,
        session.ten_tram,
        ipAddr
      );

      return {
        paymentId,
        sessionId,
        amount,
        paymentUrl,
        stationName: session.ten_tram
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate VNPay payment URL for session-based payment
   */
  generateVNPayUrlForSession(sessionId, paymentId, amount, stationName, ipAddr) {
    const date = new Date();
    const createDate = this.formatDate(date);
    
    // VNPay requires amount in smallest currency unit (VND * 100)
    const vnpAmount = amount * 100;

    // Build VNPay parameters
    let vnp_Params = {
      vnp_Version: vnpayConfig.vnp_Version,
      vnp_Command: vnpayConfig.vnp_Command,
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: vnpayConfig.vnp_Locale,
      vnp_CurrCode: vnpayConfig.vnp_CurrCode,
      vnp_TxnRef: `S${sessionId}_${paymentId}_${Date.now()}`, // S prefix for Session
      vnp_OrderInfo: `PaymentSession${sessionId}`,
      vnp_OrderType: vnpayConfig.vnp_OrderType,
      vnp_Amount: vnpAmount,
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    // Sort parameters alphabetically
    vnp_Params = this.sortObject(vnp_Params);

    // Create signature
    const sortedKeys = Object.keys(vnp_Params).sort();
    const signData = sortedKeys.map(key => `${key}=${vnp_Params[key]}`).join('&');
    
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    // Build final URL
    const finalSortedKeys = Object.keys(vnp_Params).sort();
    const paymentUrl = vnpayConfig.vnp_Url + '?' + finalSortedKeys.map(key => `${key}=${vnp_Params[key]}`).join('&');
    
    return paymentUrl;
  }

  /**
   * Handle VNPay callback after payment
   */
  async handleVNPayCallback(vnpParams) {
    try {
      // Verify signature
      const secureHash = vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHashType'];

      // Sort parameters
      const sortedParams = this.sortObject(vnpParams);
      const signData = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');
      const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      if (secureHash !== signed) {
        throw new Error('Invalid signature');
      }

      // Extract session and payment IDs from txnRef
      // Format: S{sessionId}_{paymentId}_{timestamp}
      const txnRef = vnpParams['vnp_TxnRef'];
      const responseCode = vnpParams['vnp_ResponseCode'];
      const transactionNo = vnpParams['vnp_TransactionNo'];
      const amount = parseInt(vnpParams['vnp_Amount']) / 100; // Convert back to VND

      // Parse txnRef - must start with 'S' for session
      if (!txnRef.startsWith('S')) {
        throw new Error('Invalid transaction reference format');
      }

      const parts = txnRef.substring(1).split('_'); // Remove 'S' prefix
      const sessionId = parseInt(parts[0]);
      const paymentId = parseInt(parts[1]);

      // Update payment status
      if (responseCode === '00') {
        // Payment successful
        await this.updateSessionPaymentSuccess(sessionId, paymentId, transactionNo, amount);
        
        return {
          success: true,
          sessionId,
          paymentId,
          message: vnpayConfig.responseCodes[responseCode] || 'Thanh toán thành công'
        };
      } else {
        // Payment failed
        await this.updateSessionPaymentFailed(sessionId, paymentId, responseCode);
        
        return {
          success: false,
          sessionId,
          paymentId,
          message: vnpayConfig.responseCodes[responseCode] || 'Thanh toán thất bại',
          errorCode: responseCode
        };
      }

    } catch (error) {
      console.error('VNPay callback error:', error);
      throw error;
    }
  }

  /**
   * Update session payment status to success
   */
  async updateSessionPaymentSuccess(sessionId, paymentId, transactionNo, amount) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update payment record
      await client.query(
        `UPDATE thanh_toan 
         SET trang_thai = 'success',
             ma_giao_dich = $1,
             so_tien = $2,
             ngay_thanh_toan = NOW()
         WHERE id_thanh_toan = $3`,
        [transactionNo, amount, paymentId]
      );

      await client.query('COMMIT');
      
      console.log(`✅ Session Payment successful: Session #${sessionId}, Payment #${paymentId}, Transaction: ${transactionNo}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update session payment status to failed
   */
  async updateSessionPaymentFailed(sessionId, paymentId, errorCode) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update payment record
      await client.query(
        `UPDATE thanh_toan 
         SET trang_thai = 'failed',
             ngay_thanh_toan = NOW()
         WHERE id_thanh_toan = $1`,
        [paymentId]
      );

      await client.query('COMMIT');
      
      console.log(`❌ Session Payment failed: Session #${sessionId}, Payment #${paymentId}, Error: ${errorCode}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate VNPay payment URL for session-based payment
   */
  generateVNPayUrlForSession(sessionId, paymentId, amount, stationName, ipAddr) {
    const date = new Date();
    const createDate = this.formatDate(date);
    
    // VNPay requires amount in smallest currency unit (VND * 100)
    const vnpAmount = amount * 100;

    // Build VNPay parameters
    let vnp_Params = {
      vnp_Version: vnpayConfig.vnp_Version,
      vnp_Command: vnpayConfig.vnp_Command,
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: vnpayConfig.vnp_Locale,
      vnp_CurrCode: vnpayConfig.vnp_CurrCode,
      vnp_TxnRef: `S${sessionId}_${paymentId}_${Date.now()}`, // S prefix for Session
      vnp_OrderInfo: `PaymentSession${sessionId}`,
      vnp_OrderType: vnpayConfig.vnp_OrderType,
      vnp_Amount: vnpAmount,
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    // Sort parameters alphabetically
    vnp_Params = this.sortObject(vnp_Params);

    // Create signature
    const sortedKeys = Object.keys(vnp_Params).sort();
    const signData = sortedKeys.map(key => `${key}=${vnp_Params[key]}`).join('&');
    
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    // Build final URL
    const finalSortedKeys = Object.keys(vnp_Params).sort();
    const paymentUrl = vnpayConfig.vnp_Url + '?' + finalSortedKeys.map(key => `${key}=${vnp_Params[key]}`).join('&');
    
    return paymentUrl;
  }

  /**
   * Get payment details by session ID
   */
  async getPaymentBySession(sessionId) {
    const query = `
      SELECT 
        tt.id_thanh_toan,
        tt.id_phien_sac,
        tt.so_tien,
        tt.phuong_thuc,
        tt.trang_thai,
        tt.ma_giao_dich,
        tt.ngay_thanh_toan,
        ps.trang_thai as session_status,
        ps.dien_nang_kwh,
        ts.ten_tram,
        u.ho_ten,
        u.email
      FROM thanh_toan tt
      JOIN phien_sac ps ON ps.id_phien_sac = tt.id_phien_sac
      JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN nguoi_dung u ON u.id_nguoi_dung = dc.id_nguoi_dung
      WHERE tt.id_phien_sac = $1
    `;
    
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  }

  /**
   * Get payment details by payment ID
   */
  async getPaymentById(paymentId) {
    const query = `
      SELECT 
        tt.id_thanh_toan,
        tt.id_phien_sac,
        tt.so_tien,
        tt.phuong_thuc,
        tt.trang_thai,
        tt.ma_giao_dich,
        tt.ngay_thanh_toan,
        ps.trang_thai as session_status,
        ps.dien_nang_kwh,
        ts.ten_tram,
        u.ho_ten,
        u.email
      FROM thanh_toan tt
      JOIN phien_sac ps ON ps.id_phien_sac = tt.id_phien_sac
      JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
      JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN nguoi_dung u ON u.id_nguoi_dung = dc.id_nguoi_dung
      WHERE tt.id_thanh_toan = $1
    `;
    
    const result = await pool.query(query, [paymentId]);
    return result.rows[0] || null;
  }

  /**
   * Helper: Format date for VNPay (YYYYMMDDHHmmss)
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Helper: Sort object keys alphabetically and encode values
   * CRITICAL: VNPay requires %20 => + conversion!
   */
  sortObject(obj) {
    const sorted = {};
    const str = [];
    
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    
    str.sort();
    
    for (let i = 0; i < str.length; i++) {
      const key = str[i];
      const originalKey = Object.keys(obj).find(k => encodeURIComponent(k) === key);
      // CRITICAL: Replace %20 with + per VNPay spec
      sorted[key] = encodeURIComponent(obj[originalKey]).replace(/%20/g, '+');
    }
    
    return sorted;
  }
}

export default new PaymentService();


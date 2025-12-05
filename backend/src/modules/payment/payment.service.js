import { pool } from '../../config/db.js';
import crypto from 'crypto';
import querystring from 'querystring';
import { vnpayConfig } from '../../config/vnpay.config.js';

/**
 * Payment Service
 * Handles payment processing with VNPay integration
 */

class PaymentService {
  /**
   * Create a payment record and generate VNPay payment URL
   * @param {number} bookingId - ID of the booking
   * @param {string} ipAddr - Client IP address
   * @returns {object} Payment URL and payment info
   */
  async createPayment(bookingId, ipAddr) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get booking details
      const bookingQuery = `
        SELECT 
          dc.id_dat_cho,
          dc.id_nguoi_dung,
          dc.uoc_tinh_chi_phi,
          dc.trang_thai,
          dc.ma_xac_nhan,
          ts.ten_tram,
          u.ho_ten,
          u.email
        FROM dat_cho dc
        JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
        JOIN tram_sac ts ON ts.id_tram = cs.id_tram
        JOIN nguoi_dung u ON u.id_nguoi_dung = dc.id_nguoi_dung
        WHERE dc.id_dat_cho = $1
      `;
      
      const bookingResult = await client.query(bookingQuery, [bookingId]);
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Không tìm thấy booking');
      }

      const booking = bookingResult.rows[0];

      // Check if booking is in valid state for payment
      if (booking.trang_thai !== 'cho_xac_nhan') {
        throw new Error('Booking này không thể thanh toán (đã thanh toán hoặc đã hủy)');
      }

      // Check if payment already exists
      const existingPaymentQuery = `
        SELECT id_thanh_toan, trang_thai
        FROM thanh_toan
        WHERE id_dat_cho = $1
      `;
      const existingPayment = await client.query(existingPaymentQuery, [bookingId]);

      let paymentId;

      if (existingPayment.rows.length > 0) {
        // Payment record exists, check status
        const payment = existingPayment.rows[0];
        
        if (payment.trang_thai === 'success') {
          throw new Error('Booking này đã được thanh toán');
        }
        
        // Update existing pending/failed payment
        paymentId = payment.id_thanh_toan;
        await client.query(
          `UPDATE thanh_toan 
           SET trang_thai = 'pending', 
               ma_giao_dich = NULL,
               ngay_thanh_toan = NULL
           WHERE id_thanh_toan = $1`,
          [paymentId]
        );
      } else {
        // Create new payment record
        const insertPaymentQuery = `
          INSERT INTO thanh_toan (
            id_dat_cho,
            so_tien,
            phuong_thuc,
            trang_thai
          ) VALUES ($1, $2, 'VNPAY', 'pending')
          RETURNING id_thanh_toan
        `;
        
        const paymentResult = await client.query(insertPaymentQuery, [
          bookingId,
          booking.uoc_tinh_chi_phi
        ]);
        
        paymentId = paymentResult.rows[0].id_thanh_toan;
      }

      await client.query('COMMIT');

      // Generate VNPay payment URL
      const amount = Math.round(parseFloat(booking.uoc_tinh_chi_phi));
      const paymentUrl = this.generateVNPayUrl(
        bookingId,
        paymentId,
        amount,
        booking.ten_tram,
        ipAddr
      );

      return {
        paymentId,
        bookingId,
        amount,
        paymentUrl,
        stationName: booking.ten_tram
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate VNPay payment URL
   */
  generateVNPayUrl(bookingId, paymentId, amount, stationName, ipAddr) {
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
      vnp_TxnRef: `${bookingId}_${paymentId}_${Date.now()}`, // Unique transaction reference
      vnp_OrderInfo: `Thanh toan dat cho #${bookingId} - ${stationName}`,
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

      // Extract booking/session and payment IDs from txnRef
      const txnRef = vnpParams['vnp_TxnRef'];
      const responseCode = vnpParams['vnp_ResponseCode'];
      const transactionNo = vnpParams['vnp_TransactionNo'];
      const amount = parseInt(vnpParams['vnp_Amount']) / 100; // Convert back to VND

      // Check if this is session-based or booking-based
      const isSessionBased = txnRef.startsWith('S');
      
      let bookingId, sessionId, paymentId;
      
      if (isSessionBased) {
        // Session-based: Format S{sessionId}_{paymentId}_{timestamp}
        const parts = txnRef.substring(1).split('_'); // Remove 'S' prefix
        sessionId = parseInt(parts[0]);
        paymentId = parseInt(parts[1]);
        bookingId = null;
      } else {
        // Booking-based: Format {bookingId}_{paymentId}_{timestamp}
        const parts = txnRef.split('_');
        bookingId = parseInt(parts[0]);
        paymentId = parseInt(parts[1]);
        sessionId = null;
      }

      // Update payment status
      if (responseCode === '00') {
        // Payment successful
        if (isSessionBased) {
          await this.updateSessionPaymentSuccess(sessionId, paymentId, transactionNo, amount);
          
          return {
            success: true,
            sessionId,
            paymentId,
            message: vnpayConfig.responseCodes[responseCode] || 'Thanh toán thành công'
          };
        } else {
          await this.updatePaymentSuccess(bookingId, paymentId, transactionNo, amount);
          
          return {
            success: true,
            bookingId,
            paymentId,
            message: vnpayConfig.responseCodes[responseCode] || 'Thanh toán thành công'
          };
        }
      } else {
        // Payment failed
        if (isSessionBased) {
          await this.updateSessionPaymentFailed(sessionId, paymentId, responseCode);
          
          return {
            success: false,
            sessionId,
            paymentId,
            message: vnpayConfig.responseCodes[responseCode] || 'Thanh toán thất bại',
            errorCode: responseCode
          };
        } else {
          await this.updatePaymentFailed(bookingId, paymentId, responseCode);
          
          return {
            success: false,
            bookingId,
            paymentId,
            message: vnpayConfig.responseCodes[responseCode] || 'Thanh toán thất bại',
            errorCode: responseCode
          };
        }
      }

    } catch (error) {
      console.error('VNPay callback error:', error);
      throw error;
    }
  }

  /**
   * Update payment status to success
   */
  async updatePaymentSuccess(bookingId, paymentId, transactionNo, amount) {
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

      // Note: Booking status remains 'cho_xac_nhan' until station confirms
      // We don't change it here because station owner needs to confirm

      await client.query('COMMIT');
      
      console.log(`✅ Payment successful: Booking #${bookingId}, Payment #${paymentId}, Transaction: ${transactionNo}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update payment status to failed and cancel booking
   */
  async updatePaymentFailed(bookingId, paymentId, errorCode) {
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

      // Cancel the booking
      await client.query(
        `UPDATE dat_cho 
         SET trang_thai = 'huy',
             nguon_huy = 'he_thong'
         WHERE id_dat_cho = $1`,
        [bookingId]
      );

      // Release the connector
      const connectorQuery = `
        SELECT id_cong_sac FROM dat_cho WHERE id_dat_cho = $1
      `;
      const connectorResult = await client.query(connectorQuery, [bookingId]);
      
      if (connectorResult.rows.length > 0) {
        const connectorId = connectorResult.rows[0].id_cong_sac;
        await client.query(
          `UPDATE cong_sac SET trang_thai = 'trong' WHERE id_cong_sac = $1`,
          [connectorId]
        );
      }

      await client.query('COMMIT');
      
      console.log(`❌ Payment failed: Booking #${bookingId}, Payment #${paymentId}, Error: ${errorCode}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
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
   * Get payment details by booking ID
   */
  async getPaymentByBooking(bookingId) {
    const query = `
      SELECT 
        tt.id_thanh_toan,
        tt.id_dat_cho,
        tt.so_tien,
        tt.phuong_thuc,
        tt.trang_thai,
        tt.ma_giao_dich,
        tt.ngay_thanh_toan,
        dc.ma_xac_nhan,
        dc.trang_thai as booking_status
      FROM thanh_toan tt
      JOIN dat_cho dc ON dc.id_dat_cho = tt.id_dat_cho
      WHERE tt.id_dat_cho = $1
    `;
    
    const result = await pool.query(query, [bookingId]);
    return result.rows[0] || null;
  }

  /**
   * Get payment details by payment ID
   */
  async getPaymentById(paymentId) {
    const query = `
      SELECT 
        tt.id_thanh_toan,
        tt.id_dat_cho,
        tt.so_tien,
        tt.phuong_thuc,
        tt.trang_thai,
        tt.ma_giao_dich,
        tt.ngay_thanh_toan,
        dc.ma_xac_nhan,
        dc.trang_thai as booking_status,
        ts.ten_tram,
        u.ho_ten,
        u.email
      FROM thanh_toan tt
      JOIN dat_cho dc ON dc.id_dat_cho = tt.id_dat_cho
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN nguoi_dung u ON u.id_nguoi_dung = dc.id_nguoi_dung
      WHERE tt.id_thanh_toan = $1
    `;
    
    const result = await pool.query(query, [paymentId]);
    return result.rows[0] || null;
  }

  /**
   * Create payment from a completed charging session (NEW FLOW)
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

      // Generate VNPay payment URL (use session-based format)
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
    // DEBUG: Check config values
    console.log('🔍 VNPay Config Check (SESSION-BASED):');
    console.log('  TMN Code:', vnpayConfig.vnp_TmnCode);
    console.log('  Hash Secret:', vnpayConfig.vnp_HashSecret?.substring(0, 10) + '...');
    console.log('  URL:', vnpayConfig.vnp_Url);
    console.log('  Return URL:', vnpayConfig.vnp_ReturnUrl);
    
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

    console.log('📦 VNPay Params (SESSION):', JSON.stringify(vnp_Params, null, 2));

    // Sort parameters alphabetically
    vnp_Params = this.sortObject(vnp_Params);

    // Create signature - VNPay NodeJS spec: NO encoding (raw string)
    // Equivalent to qs.stringify(params, { encode: false })
    const sortedKeys = Object.keys(vnp_Params).sort();
    const signData = sortedKeys.map(key => `${key}=${vnp_Params[key]}`).join('&');
    
    console.log('📝 SignData (NO ENCODE):', signData);
    
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    console.log('🔐 Signature:', signed);

    // Build final URL - also no encoding per VNPay spec
    const finalSortedKeys = Object.keys(vnp_Params).sort();
    const paymentUrl = vnpayConfig.vnp_Url + '?' + finalSortedKeys.map(key => `${key}=${vnp_Params[key]}`).join('&');
    
    console.log('🔗 Final Payment URL:', paymentUrl.substring(0, 150) + '...');
    
    return paymentUrl;
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


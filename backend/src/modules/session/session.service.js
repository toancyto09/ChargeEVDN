import { pool } from '../../config/db.js';

/**
 * Session Service
 * Handles charging session operations
 */

/**
 * Start a charging session from a booking
 * @param {number} bookingId - ID of the booking
 * @returns {object} Created session info
 */
export async function startSession(bookingId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get booking details
    const bookingQuery = `
      SELECT 
        dc.id_dat_cho,
        dc.id_nguoi_dung,
        dc.id_cong_sac,
        dc.trang_thai,
        dc.thoi_gian_bat_dau,
        dc.thoi_gian_ket_thuc,
        ts.id_tram,
        lsg.gia_kwh,
        lsg.phi_cho_phut
      FROM dat_cho dc
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN lich_su_gia_tram lsg ON lsg.id_tram = ts.id_tram
      WHERE dc.id_dat_cho = $1
        AND lsg.trang_thai = 'active'
        AND NOW() BETWEEN lsg.hieu_luc_tu AND COALESCE(lsg.hieu_luc_den, '9999-12-31')
    `;
    
    const bookingResult = await client.query(bookingQuery, [bookingId]);
    
    if (bookingResult.rows.length === 0) {
      throw new Error('Không tìm thấy booking hoặc giá không hợp lệ');
    }

    const booking = bookingResult.rows[0];

    // Check booking status
    if (booking.trang_thai !== 'cho_xac_nhan' && booking.trang_thai !== 'da_xac_nhan') {
      throw new Error(`Booking không ở trạng thái hợp lệ để bắt đầu sạc (trạng thái: ${booking.trang_thai})`);
    }

    // Check if session already exists
    const existingSessionQuery = `
      SELECT id_phien_sac, trang_thai 
      FROM phien_sac 
      WHERE id_dat_cho = $1
    `;
    const existingSession = await client.query(existingSessionQuery, [bookingId]);

    if (existingSession.rows.length > 0) {
      const session = existingSession.rows[0];
      if (session.trang_thai === 'dang_sac') {
        throw new Error('Session đã được bắt đầu rồi');
      }
    }

    // Create charging session
    const createSessionQuery = `
      INSERT INTO phien_sac (
        id_dat_cho,
        id_cong_sac,
        thoi_gian_bat_dau,
        don_gia_kwh,
        phi_cho_phut,
        nguon_khoi_tao,
        trang_thai
      ) VALUES ($1, $2, NOW(), $3, $4, 'dat_cho', 'dang_sac')
      RETURNING id_phien_sac, thoi_gian_bat_dau
    `;

    const sessionResult = await client.query(createSessionQuery, [
      bookingId,
      booking.id_cong_sac,
      booking.gia_kwh,
      booking.phi_cho_phut
    ]);

    const session = sessionResult.rows[0];

    // Update booking status
    await client.query(
      `UPDATE dat_cho SET trang_thai = 'dang_su_dung' WHERE id_dat_cho = $1`,
      [bookingId]
    );

    // Update connector status
    await client.query(
      `UPDATE cong_sac SET trang_thai = 'dang_su_dung' WHERE id_cong_sac = $1`,
      [booking.id_cong_sac]
    );

    await client.query('COMMIT');

    console.log(`✅ Session started: Session #${session.id_phien_sac} for Booking #${bookingId}`);

    return {
      id_phien_sac: session.id_phien_sac,
      id_dat_cho: bookingId,
      thoi_gian_bat_dau: session.thoi_gian_bat_dau,
      don_gia_kwh: booking.gia_kwh,
      phi_cho_phut: booking.phi_cho_phut,
      trang_thai: 'dang_sac'
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Finish a charging session
 * @param {number} sessionId - ID of the session
 * @param {object} data - { dien_nang_kwh, soc_truoc, soc_sau }
 * @returns {object} Finished session with cost calculation
 */
export async function finishSession(sessionId, data) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get session details
    const sessionQuery = `
      SELECT 
        ps.id_phien_sac,
        ps.id_dat_cho,
        ps.id_cong_sac,
        ps.thoi_gian_bat_dau,
        ps.don_gia_kwh,
        ps.phi_cho_phut,
        ps.trang_thai,
        dc.id_nguoi_dung,
        dc.thoi_gian_ket_thuc as booking_end_time
      FROM phien_sac ps
      JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
      WHERE ps.id_phien_sac = $1
    `;
    
    const sessionResult = await client.query(sessionQuery, [sessionId]);
    
    if (sessionResult.rows.length === 0) {
      throw new Error('Không tìm thấy session');
    }

    const session = sessionResult.rows[0];

    // Check session status
    if (session.trang_thai !== 'dang_sac') {
      throw new Error(`Session không ở trạng thái đang sạc (trạng thái: ${session.trang_thai})`);
    }

    const { dien_nang_kwh, soc_truoc, soc_sau } = data;

    // Calculate costs
    const now = new Date();
    const startTime = new Date(session.thoi_gian_bat_dau);
    const bookingEndTime = new Date(session.booking_end_time);
    
    // Calculate charging cost
    const chargingCost = parseFloat(dien_nang_kwh) * parseFloat(session.don_gia_kwh);

    // Calculate late fee (if finished after booking end time)
    let lateFee = 0;
    let lateMinutes = 0;
    if (now > bookingEndTime) {
      lateMinutes = Math.ceil((now - bookingEndTime) / (1000 * 60));
      lateFee = lateMinutes * parseFloat(session.phi_cho_phut);
    }

    const totalCost = chargingCost + lateFee;

    // Update session
    const updateSessionQuery = `
      UPDATE phien_sac 
      SET 
        thoi_gian_ket_thuc = NOW(),
        dien_nang_kwh = $1,
        soc_truoc = $2,
        soc_sau = $3,
        so_phut_cho = $4,
        trang_thai = 'hoan_thanh'
      WHERE id_phien_sac = $5
      RETURNING *
    `;

    await client.query(updateSessionQuery, [
      dien_nang_kwh,
      soc_truoc,
      soc_sau,
      lateMinutes,
      sessionId
    ]);

    // Update booking status
    await client.query(
      `UPDATE dat_cho SET trang_thai = 'hoan_thanh' WHERE id_dat_cho = $1`,
      [session.id_dat_cho]
    );

    // Release connector
    await client.query(
      `UPDATE cong_sac SET trang_thai = 'trong' WHERE id_cong_sac = $1`,
      [session.id_cong_sac]
    );

    // Create payment record (PENDING - user will pay later)
    const createPaymentQuery = `
      INSERT INTO thanh_toan (
        id_phien_sac,
        so_tien,
        phuong_thuc,
        trang_thai
      ) VALUES ($1, $2, 'VNPAY', 'pending')
      RETURNING id_thanh_toan
    `;

    const paymentResult = await client.query(createPaymentQuery, [
      sessionId,
      totalCost
    ]);

    await client.query('COMMIT');

    console.log(`✅ Session finished: Session #${sessionId}, Total: ${totalCost.toFixed(2)} VND`);

    return {
      id_phien_sac: sessionId,
      id_dat_cho: session.id_dat_cho,
      id_thanh_toan: paymentResult.rows[0].id_thanh_toan,
      dien_nang_kwh: parseFloat(dien_nang_kwh),
      soc_truoc,
      soc_sau,
      don_gia_kwh: parseFloat(session.don_gia_kwh),
      chi_phi_sac: chargingCost,
      phi_cho_phut: parseFloat(session.phi_cho_phut),
      so_phut_cho: lateMinutes,
      phi_tre: lateFee,
      tong_chi_phi: totalCost,
      trang_thai: 'hoan_thanh'
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get session by ID
 * @param {number} sessionId - Session ID
 * @returns {object|null} Session details or null
 */
export async function getSessionById(sessionId) {
  const query = `
    SELECT 
      ps.*,
      dc.id_nguoi_dung,
      dc.ma_xac_nhan,
      ts.ten_tram,
      cs.ma_cong_tram,
      tt.id_thanh_toan,
      tt.trang_thai as payment_status,
      tt.ma_giao_dich
    FROM phien_sac ps
    LEFT JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
    LEFT JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
    LEFT JOIN tram_sac ts ON ts.id_tram = cs.id_tram
    LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac
    WHERE ps.id_phien_sac = $1
  `;
  
  const result = await pool.query(query, [sessionId]);
  return result.rows[0] || null;
}

/**
 * Get user sessions with optional status filter
 * @param {number} userId - User ID
 * @param {string} status - Optional status filter ('completed', 'dang_sac', etc.)
 * @returns {Array} List of user sessions
 */
export async function getUserSessions(userId, status = null) {
  console.log('📊 getUserSessions service - userId:', userId, 'status:', status);
  
  let query = `
    SELECT 
      ps.id_phien_sac,
      ps.id_dat_cho,
      ps.thoi_gian_bat_dau,
      ps.thoi_gian_ket_thuc,
      COALESCE(ps.dien_nang_kwh, 0) as dien_nang_kwh,
      ps.soc_truoc,
      ps.soc_sau,
      COALESCE(ps.don_gia_kwh, 0) as don_gia_kwh,
      COALESCE(ps.so_phut_cho, 0) as so_phut_cho,
      ps.trang_thai,
      ts.ten_tram,
      cs.ma_cong_tram,
      tt.id_thanh_toan,
      COALESCE(tt.so_tien, 0) as tong_chi_phi,
      tt.trang_thai as payment_status,
      tt.ma_giao_dich,
      -- Calculate chi_phi_sac
      COALESCE(ps.dien_nang_kwh, 0) * COALESCE(ps.don_gia_kwh, 0) as chi_phi_sac,
      -- Calculate chi_phi_cho (late fee)
      CASE 
        WHEN ps.so_phut_cho > 0 AND ps.phi_cho_phut IS NOT NULL 
        THEN ps.so_phut_cho * ps.phi_cho_phut
        ELSE 0
      END as chi_phi_cho
    FROM phien_sac ps
    JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
    JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
    JOIN tram_sac ts ON ts.id_tram = cs.id_tram
    LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac
    WHERE dc.id_nguoi_dung = $1
  `;
  
  const params = [userId];
  
  // Add status filter if provided
  if (status === 'completed') {
    // For completed sessions, check both session status and payment status
    query += ` AND ps.trang_thai = 'hoan_thanh' AND tt.trang_thai = 'success'`;
  } else if (status) {
    query += ` AND ps.trang_thai = $2`;
    params.push(status);
  }
  
  query += ` ORDER BY ps.thoi_gian_ket_thuc DESC NULLS LAST`;
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get unpaid sessions for a user
 * @param {number} userId - User ID
 * @returns {Array} List of unpaid sessions
 */
export async function getUnpaidSessions(userId) {
  const query = `
    SELECT 
      ps.id_phien_sac,
      ps.id_dat_cho,
      ps.thoi_gian_bat_dau,
      ps.thoi_gian_ket_thuc,
      ps.dien_nang_kwh,
      ps.trang_thai,
      tt.id_thanh_toan,
      tt.so_tien,
      tt.trang_thai as payment_status,
      tt.ngay_tao as payment_created_at,
      ts.ten_tram,
      cs.ma_cong_tram
    FROM phien_sac ps
    JOIN dat_cho dc ON dc.id_dat_cho = ps.id_dat_cho
    JOIN cong_sac cs ON cs.id_cong_sac = ps.id_cong_sac
    JOIN tram_sac ts ON ts.id_tram = cs.id_tram
    LEFT JOIN thanh_toan tt ON tt.id_phien_sac = ps.id_phien_sac
    WHERE dc.id_nguoi_dung = $1
      AND ps.trang_thai = 'hoan_thanh'
      AND (tt.trang_thai = 'pending' OR tt.trang_thai IS NULL)
    ORDER BY ps.thoi_gian_ket_thuc DESC
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * Check-in via QR code (Station-level QR)
 * Automatically find user's booking for this station and start session
 * @param {number} userId - User ID
 * @param {number} stationId - Station ID from QR code
 * @returns {object} Session info with connector details
 */
export async function checkInWithQR(userId, stationId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Find user's valid booking for this station
    const bookingQuery = `
      SELECT 
        dc.id_dat_cho,
        dc.id_nguoi_dung,
        dc.id_cong_sac,
        dc.trang_thai,
        dc.thoi_gian_bat_dau,
        dc.thoi_gian_ket_thuc,
        dc.ma_xac_nhan,
        ts.id_tram,
        ts.ten_tram,
        ts.dia_chi,
        cs.ma_cong_tram,
        lcs.ma_cong as loai_cong,
        cs.cong_suat_kwh
      FROM dat_cho dc
      JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
      JOIN tram_sac ts ON ts.id_tram = cs.id_tram
      JOIN loai_cong_sac lcs ON lcs.id_loai_cong = cs.id_loai_cong
      WHERE dc.id_nguoi_dung = $1
        AND ts.id_tram = $2
        AND dc.trang_thai IN ('cho_xac_nhan', 'da_xac_nhan')
        AND NOW() >= (dc.thoi_gian_bat_dau - INTERVAL '15 minutes')
        AND NOW() <= dc.thoi_gian_ket_thuc
      ORDER BY dc.ngay_tao DESC
      LIMIT 1
    `;
    
    const bookingResult = await client.query(bookingQuery, [userId, stationId]);
    
    if (bookingResult.rows.length === 0) {
      // No valid booking found - Check for other scenarios
      const anyBookingQuery = `
        SELECT 
          dc.id_dat_cho,
          dc.thoi_gian_bat_dau,
          dc.trang_thai,
          ts.ten_tram,
          ts.id_tram
        FROM dat_cho dc
        JOIN cong_sac cs ON cs.id_cong_sac = dc.id_cong_sac
        JOIN tram_sac ts ON ts.id_tram = cs.id_tram
        WHERE dc.id_nguoi_dung = $1
          AND dc.trang_thai IN ('cho_xac_nhan', 'da_xac_nhan')
        ORDER BY dc.thoi_gian_bat_dau ASC
        LIMIT 1
      `;
      
      const anyBooking = await client.query(anyBookingQuery, [userId]);
      
      if (anyBooking.rows.length > 0) {
        const booking = anyBooking.rows[0];
        const startTime = new Date(booking.thoi_gian_bat_dau);
        const now = new Date();
        
        // Check if at wrong station
        if (booking.id_tram !== stationId) {
          throw new Error(`QR code này không đúng với đặt chỗ của bạn. Bạn đã đặt chỗ tại "${booking.ten_tram}"`);
        }
        
        // Check if too early
        if (now < new Date(startTime.getTime() - 15 * 60 * 1000)) {
          const minutesUntil = Math.floor((startTime - now) / 60000);
          throw new Error(`Chưa đến giờ check-in. Vui lòng đợi thêm ${minutesUntil} phút`);
        }
        
        // Check if expired
        throw new Error('Đặt chỗ của bạn đã hết hạn. Vui lòng đặt lại');
      }
      
      throw new Error('Bạn chưa có đặt chỗ tại trạm này. Vui lòng đặt chỗ trước khi check-in');
    }

    const booking = bookingResult.rows[0];

    // Check if session already exists
    const existingSessionQuery = `
      SELECT id_phien_sac, trang_thai 
      FROM phien_sac 
      WHERE id_dat_cho = $1
    `;
    const existingSession = await client.query(existingSessionQuery, [booking.id_dat_cho]);

    if (existingSession.rows.length > 0) {
      const session = existingSession.rows[0];
      if (session.trang_thai === 'dang_sac') {
        throw new Error('Phiên sạc đã được bắt đầu rồi. Vui lòng kiểm tra trong "Phiên sạc"');
      }
    }

    // Auto-confirm booking if still waiting
    if (booking.trang_thai === 'cho_xac_nhan') {
      await client.query(
        `UPDATE dat_cho SET trang_thai = 'da_xac_nhan' WHERE id_dat_cho = $1`,
        [booking.id_dat_cho]
      );
    }

    // Start charging session
    const session = await startSession(booking.id_dat_cho);
    
    await client.query('COMMIT');

    console.log(`✅ QR Check-in successful: User ${userId} at Station ${stationId}, Session #${session.id_phien_sac}`);

    return {
      session_id: session.id_phien_sac,
      booking_id: booking.id_dat_cho,
      station_name: booking.ten_tram,
      station_address: booking.dia_chi,
      connector_code: booking.ma_cong_tram,
      connector_type: booking.loai_cong,
      power_kw: booking.cong_suat_kwh,
      confirmation_code: booking.ma_xac_nhan,
      start_time: session.thoi_gian_bat_dau
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
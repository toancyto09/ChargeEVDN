import cron from 'node-cron';
import { pool } from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Auto-cleanup Expired Bookings Cron Job
 * 
 * Schedule: Every 5 minutes
 * 
 * Purpose:
 * - Cancel bookings that passed their expiry time (het_han)
 * - Free up connectors for other users
 * - Keep database clean
 * 
 * Anti-spam impact:
 * - Prevent users from holding slots indefinitely
 * - Auto-release no-show bookings
 */

export const startCleanupJob = () => {
  // Schedule: Every 5 minutes (*/5 * * * *)
  // Cron format: minute hour day month weekday
  cron.schedule('*/5 * * * *', async () => {
    try {
      const startTime = new Date();
      logger.info('🧹 [CLEANUP JOB] Starting expired bookings cleanup...');

      // Find and cancel expired bookings
      const cancelQuery = `
        UPDATE dat_cho
        SET 
          trang_thai = 'huy',
          nguon_huy = 'he_thong',
          id_nguoi_huy = NULL
        WHERE trang_thai = 'cho_xac_nhan'
          AND het_han < NOW()
        RETURNING id_dat_cho, id_cong_sac, ma_xac_nhan, het_han
      `;

      const result = await pool.query(cancelQuery);
      const expiredBookings = result.rows;

      if (expiredBookings.length === 0) {
        logger.info('✅ [CLEANUP JOB] No expired bookings found');
        return;
      }

      // Free up connectors
      const connectorIds = expiredBookings.map(b => b.id_cong_sac);
      
      if (connectorIds.length > 0) {
        const freeConnectorsQuery = `
          UPDATE cong_sac 
          SET trang_thai = 'trong' 
          WHERE id_cong_sac = ANY($1::bigint[])
            AND trang_thai = 'dang_su_dung'
        `;
        
        await pool.query(freeConnectorsQuery, [connectorIds]);
      }

      // Log results
      const duration = new Date() - startTime;
      logger.info(`✅ [CLEANUP JOB] Auto-cancelled ${expiredBookings.length} expired booking(s) in ${duration}ms`);
      
      expiredBookings.forEach(booking => {
        const expiredTime = new Date(booking.het_han).toLocaleString('vi-VN');
        logger.info(`   📍 Booking ${booking.ma_xac_nhan} - Expired at ${expiredTime}`);
      });

    } catch (error) {
      logger.error('❌ [CLEANUP JOB] Failed:', error);
    }
  });

  logger.info('✅ [CLEANUP JOB] Scheduled successfully (every 5 minutes)');
  logger.info('   ⏰ Next run: ~5 minutes from now');
};

/**
 * Manual cleanup function (for testing)
 */
export const runCleanupNow = async () => {
  try {
    logger.info('🧹 [MANUAL CLEANUP] Running now...');

    const cancelQuery = `
      UPDATE dat_cho
      SET 
        trang_thai = 'huy',
        nguon_huy = 'he_thong',
        id_nguoi_huy = NULL
      WHERE trang_thai = 'cho_xac_nhan'
        AND het_han < NOW()
      RETURNING id_dat_cho, id_cong_sac, ma_xac_nhan
    `;

    const result = await pool.query(cancelQuery);
    const expiredBookings = result.rows;

    if (expiredBookings.length === 0) {
      logger.info('✅ [MANUAL CLEANUP] No expired bookings');
      return { cancelled: 0 };
    }

    // Free connectors
    const connectorIds = expiredBookings.map(b => b.id_cong_sac);
    await pool.query(
      `UPDATE cong_sac SET trang_thai = 'trong' WHERE id_cong_sac = ANY($1::bigint[])`,
      [connectorIds]
    );

    logger.info(`✅ [MANUAL CLEANUP] Cancelled ${expiredBookings.length} booking(s)`);
    
    return { 
      cancelled: expiredBookings.length,
      bookings: expiredBookings 
    };

  } catch (error) {
    logger.error('❌ [MANUAL CLEANUP] Failed:', error);
    throw error;
  }
};


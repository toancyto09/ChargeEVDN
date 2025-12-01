import { pool } from '../config/db.js';

/**
 * Auto-release expired bookings and free up connectors
 * This job runs periodically to clean up:
 * 1. Bookings past their end time
 * 2. Expired pending bookings (het_han passed)
 * 3. Stuck connectors
 */

export async function releaseExpiredBookings() {
  try {
    console.log('🔄 Running auto-release job...');

    // 1. Find and cancel expired pending bookings (het_han passed)
    const expiredPendingQuery = `
      UPDATE dat_cho
      SET 
        trang_thai = 'huy',
        nguon_huy = 'he_thong'
      WHERE trang_thai = 'cho_xac_nhan'
        AND het_han < NOW()
      RETURNING id_dat_cho, id_cong_sac
    `;

    const expiredPending = await pool.query(expiredPendingQuery);

    if (expiredPending.rows.length > 0) {
      console.log(`⏰ Auto-cancelled ${expiredPending.rows.length} expired pending bookings`);
      
      // Free their connectors
      for (const booking of expiredPending.rows) {
        await pool.query(
          `UPDATE cong_sac SET trang_thai = 'trong' WHERE id_cong_sac = $1`,
          [booking.id_cong_sac]
        );
      }
    }

    // 2. Auto-complete bookings past their end time
    const pastEndTimeQuery = `
      UPDATE dat_cho
      SET trang_thai = 'hoan_thanh'
      WHERE trang_thai IN ('da_xac_nhan', 'dang_su_dung')
        AND thoi_gian_ket_thuc < NOW()
      RETURNING id_dat_cho, id_cong_sac
    `;

    const pastEndTime = await pool.query(pastEndTimeQuery);

    if (pastEndTime.rows.length > 0) {
      console.log(`✅ Auto-completed ${pastEndTime.rows.length} bookings past end time`);
      
      // Free their connectors
      for (const booking of pastEndTime.rows) {
        await pool.query(
          `UPDATE cong_sac SET trang_thai = 'trong' WHERE id_cong_sac = $1`,
          [booking.id_cong_sac]
        );
      }
    }

    // 3. Safety check: Free connectors that are stuck (no active booking)
    const stuckConnectorsQuery = `
      UPDATE cong_sac
      SET trang_thai = 'trong'
      WHERE trang_thai = 'dang_su_dung'
        AND id_cong_sac NOT IN (
          SELECT id_cong_sac
          FROM dat_cho
          WHERE trang_thai IN ('cho_xac_nhan', 'da_xac_nhan', 'dang_su_dung')
        )
      RETURNING id_cong_sac
    `;

    const stuckConnectors = await pool.query(stuckConnectorsQuery);

    if (stuckConnectors.rows.length > 0) {
      console.log(`🔓 Released ${stuckConnectors.rows.length} stuck connectors`);
    }

    const totalReleased = 
      expiredPending.rows.length + 
      pastEndTime.rows.length + 
      stuckConnectors.rows.length;

    if (totalReleased === 0) {
      console.log('✨ All connectors are properly managed');
    } else {
      console.log(`✅ Total cleanup: ${totalReleased} items processed`);
    }

  } catch (error) {
    console.error('❌ Error in auto-release job:', error);
  }
}

/**
 * Start the cron job
 * Runs every 5 minutes
 */
export function startAutoReleaseJob() {
  console.log('🚀 Starting auto-release cron job (every 5 minutes)');
  
  // Run immediately on startup
  releaseExpiredBookings();
  
  // Then run every 5 minutes
  setInterval(releaseExpiredBookings, 5 * 60 * 1000);
}


import cron from 'node-cron';
import { markExpiredBookings } from '../modules/booking/penalty.service.js';

/**
 * Cron Job: Check and mark expired bookings as no-show
 * Runs every 5 minutes
 */
export function startPenaltyChecker() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔍 [Cron] Checking for expired bookings...');
      const count = await markExpiredBookings();
      
      if (count > 0) {
        console.log(`✅ [Cron] Processed ${count} no-show bookings`);
      } else {
        console.log('✅ [Cron] No expired bookings found');
      }
    } catch (error) {
      console.error('❌ [Cron] Error in penalty checker:', error);
    }
  });

  console.log('⏰ Penalty Checker Cron Job started (runs every 5 minutes)');
}

export default { startPenaltyChecker };

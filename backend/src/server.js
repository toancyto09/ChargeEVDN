import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import dotenv from 'dotenv';
import { verifyEmailConfig } from './utils/emailService.js';
import { startCleanupJob } from './jobs/cleanupExpiredBookings.js';

// Sau dòng await connectDB();
console.log('\n📧 Checking email configuration...');
await verifyEmailConfig();

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    console.log('🔄 Initializing ChargeEVDN Backend Server...');

    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    console.log('\n📧 Checking email configuration...');
    await verifyEmailConfig();
    
    // Start cron jobs
    console.log('\n⏰ Starting scheduled jobs...');
    startCleanupJob();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(
        `🚀 ChargeEVDN Backend Server running on http://localhost:${PORT}`
      );
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('📝 API endpoints available:');
      console.log('   - GET  /health');
      console.log('   - GET  /api/test-db');
      console.log('   - POST /api/auth/login');
      console.log('   - GET  /api/stations');
      console.log('   - POST /api/bookings');
      console.log('   - ... and more');
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n👋 ${signal} received, shutting down gracefully...`);

      server.close(async () => {
        console.log('🛑 HTTP server closed');
        await closeDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

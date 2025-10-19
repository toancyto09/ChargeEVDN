import app from './app.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // TODO: Connect to database here
    console.log('🔄 Initializing server...');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 ChargeEVDN Backend Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('📝 API endpoints available:');
      console.log('   - /api/auth');
      console.log('   - /api/users');
      console.log('   - /api/stations');
      console.log('   - /api/bookings');
      console.log('   - /api/payments');
      console.log('   - ... and more');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

/**
 * Express Application
 * Main application configuration and middleware setup
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import { configurePassport } from './config/passport.js';

// Config
import { corsOptions } from './config/cors.config.js';
import { pool } from './config/db.js';

// Middlewares
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/errorHandler.middleware.js';
import logger from './utils/logger.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import stationRoutes from './modules/station/station.routes.js';
import profileRoutes from './modules/user/profile.routes.js';
import vehicleRoutes from './modules/vehicle/vehicle.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (for uploaded avatars, documents...)
app.use('/uploads', express.static('public/uploads'));

// Initialize Passport
configurePassport();
app.use(passport.initialize());

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.request(req.method, req.originalUrl);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Database connection test endpoint
app.get('/api/test-db', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT NOW() as current_time, current_database() as database'
    );
    logger.success('Database connection test successful');
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        currentTime: result.rows[0].current_time,
        database: result.rows[0].database,
        status: 'connected',
      },
    });
  } catch (error) {
    logger.error('Database connection test failed', error);
    next(error);
  }
});

// ============================
// API ROUTES
// ============================
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stations', stationRoutes);

logger.info('✅ All routes registered');

// ============================
// ERROR HANDLING
// ============================
// 404 Not Found handler (must be after all routes)
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;

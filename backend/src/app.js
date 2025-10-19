import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes (placeholder - sẽ được thêm sau)
app.use('/api/auth', (req, res) => res.json({ message: 'Auth routes - Coming soon' }));
app.use('/api/users', (req, res) => res.json({ message: 'User routes - Coming soon' }));
app.use('/api/companies', (req, res) => res.json({ message: 'Company routes - Coming soon' }));
app.use('/api/stations', (req, res) => res.json({ message: 'Station routes - Coming soon' }));
app.use('/api/connectors', (req, res) => res.json({ message: 'Connector routes - Coming soon' }));
app.use('/api/vehicles', (req, res) => res.json({ message: 'Vehicle routes - Coming soon' }));
app.use('/api/bookings', (req, res) => res.json({ message: 'Booking routes - Coming soon' }));
app.use('/api/sessions', (req, res) => res.json({ message: 'Session routes - Coming soon' }));
app.use('/api/payments', (req, res) => res.json({ message: 'Payment routes - Coming soon' }));
app.use('/api/invoices', (req, res) => res.json({ message: 'Invoice routes - Coming soon' }));
app.use('/api/reviews', (req, res) => res.json({ message: 'Review routes - Coming soon' }));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

export default app;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const requestRoutes = require('./routes/requests');
const offerRoutes = require('./routes/offers');

const app = express();

// ====== SECURITY MIDDLEWARE ======

// Basic security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - Apply more selectively
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check and development
    return req.path === '/health' || process.env.NODE_ENV === 'development';
  }
});

// Apply rate limiting only to API routes
app.use('/api/', limiter);

// ====== BASIC MIDDLEWARE ======

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });
}

// ====== HEALTH CHECK (before rate limiting affects it) ======

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SanchayKart Flex API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ====== API ROUTES ======

// Routes order matters - more specific routes should come first
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/offers', offerRoutes);

// Debug route to test if server is receiving requests
if (process.env.NODE_ENV === 'development') {
  app.use('/api/debug', (req, res) => {
    res.json({
      success: true,
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query
    });
  });
}

// ====== ERROR HANDLING ======

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  console.error('Stack:', err.stack);
  console.error('Request:', {
    method: req.method,
    url: req.url,
    body: req.body
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ====== DATABASE CONNECTION & SERVER START ======

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Start server after successful DB connection
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 SanchayKart Flex API running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🛠️  Debug route: http://localhost:${PORT}/api/debug`);
      
      // Log all registered routes in development
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Registered Routes:');
        app._router.stack.forEach((middleware) => {
          if (middleware.route) {
            console.log(`   ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
          } else if (middleware.name === 'router') {
            console.log(`   Router: ${middleware.regexp}`);
          }
        });
        console.log('');
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`${signal} received, shutting down gracefully`);
      server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Connect to database
connectDB();

module.exports = app;

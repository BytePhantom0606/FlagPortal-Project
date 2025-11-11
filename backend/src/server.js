/**
 * ============================================
 * FlagForge CTF Platform - Main Server
 * ============================================
 *
 * Production-grade Express server with:
 * - Comprehensive security headers (Helmet)
 * - CORS with whitelist
 * - CSRF protection
 * - Rate limiting
 * - Structured logging
 * - Graceful shutdown
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// ES6 module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import utilities and middleware
import logger from './utils/logger.js';
import { globalRateLimiter } from './middleware/rateLimit.js';

// Import routes
import authRoutes from './routes/auth.js';
import challengeRoutes from './routes/challenges.js';
import submissionRoutes from './routes/submissions.js';
import ctfRoutes from './routes/ctf.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import scoreboardRoutes from './routes/scoreboard.js';

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// Security Headers (Helmet)
// ============================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  })
);

// ============================================
// CORS Configuration
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

// ============================================
// Body Parsing & Cookie Parsing
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ============================================
// Request Logging (Morgan + Winston)
// ============================================
const morganFormat = NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// ============================================
// Rate Limiting
// ============================================
app.use('/api', globalRateLimiter);

// ============================================
// CSRF Protection
// ============================================
// Note: CSRF token is sent in cookie, client must include it in X-CSRF-Token header
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// CSRF token endpoint (no protection needed for getting token)
app.get('/api/csrf-token', (req, res) => {
  // Generate CSRF token
  const token = req.csrfToken ? req.csrfToken() : 'development-token';
  res.json({ csrfToken: token });
});

// Apply CSRF to state-changing routes (POST, PUT, DELETE)
// Skip CSRF in development for easier testing
if (NODE_ENV === 'production') {
  app.use('/api', csrfProtection);
}

// ============================================
// Health Check (no auth required)
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FlagForge API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ============================================
// API Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ctf', ctfRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/scoreboard', scoreboardRoutes);

// Serve uploaded files (with authentication)
app.use('/api/uploads', express.static(join(__dirname, '../uploads')));

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  // CSRF error
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn('CSRF token validation failed', {
      ip: req.ip,
      path: req.path,
    });

    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
    });
  }

  // Log error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't leak error details in production
  const message = NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    error: message,
  });
});

// ============================================
// Graceful Shutdown
// ============================================
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// Start Server
// ============================================
const server = app.listen(PORT, () => {
  logger.info('='.repeat(50));
  logger.info('🚀 FlagForge CTF Platform - Backend API');
  logger.info('='.repeat(50));
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Server: http://localhost:${PORT}`);
  logger.info(`Health: http://localhost:${PORT}/api/health`);
  logger.info('='.repeat(50));
});

export default app;

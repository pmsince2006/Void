import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDatabase, isDatabaseConnected, initializeDatabaseIndexes } from './config/database';
import { parseAllowedOrigins, isOriginAllowed } from './utils/origin';
import { generalLimiter } from './middleware/rateLimiter';
import { startOrderExpiryWorker } from './services/orderExpiryService';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import collectionRoutes from './routes/collectionRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import orderRoutes from './routes/orderRoutes';

// Load environment configuration from .env if present
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Configure reverse proxy trust safely for the documented production topology.
// Behind a single reverse proxy (e.g. Render, Railway, AWS ALB, Nginx),
// we trust 1 hop to determine client IP for rate limiting and TLS status for secure cookies.
// Avoids broad proxy trust ('true') which would allow spoofing of client IP via forged headers.
const trustProxyConfig = process.env.TRUST_PROXY;
if (trustProxyConfig !== undefined) {
  if (trustProxyConfig === 'true') {
    app.set('trust proxy', true);
  } else if (trustProxyConfig === 'false') {
    app.set('trust proxy', false);
  } else if (!isNaN(Number(trustProxyConfig))) {
    app.set('trust proxy', Number(trustProxyConfig));
  } else {
    app.set('trust proxy', trustProxyConfig);
  }
} else if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 2. Security Headers (HSTS, NoSniff, XSS protection, Frameguard)
app.use(helmet());

// 3. Strict CORS Configuration: Only allow configured frontend origins with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = parseAllowedOrigins(process.env.FRONTEND_URL);
      // Allow requests with no origin (e.g. server-to-server, curl) or matching allowed origins
      if (!origin || isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy: Origin not allowed'));
      }
    },
    credentials: true // Crucial for sending and receiving HttpOnly session cookies
  })
);

// 4. Request Body and Cookie Parsers
app.use(express.json({ limit: '10kb' })); // Guard against large payload DoS attacks
app.use(cookieParser());

// 5. Defense-in-depth CSRF / Origin verification for state-changing requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const origin = req.headers.origin;

  if (isStateChanging && origin) {
    const allowedOrigins = parseAllowedOrigins(process.env.FRONTEND_URL);
    if (!isOriginAllowed(origin, allowedOrigins)) {
      res.status(403).json({
        status: 'error',
        message: 'Cross-site request forgery protection: Origin not allowed'
      });
      return;
    }
  }
  next();
});

// 6. Health Check Endpoint (Includes safe database status)
// (Health check is mounted above generalLimiter so automated container/uptime probes are never throttled)
app.get('/api/health', (_req: Request, res: Response) => {
  const dbConnected = isDatabaseConnected();

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    message: 'VOID backend is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 7. General API Rate Limiting for standard endpoints
app.use('/api', generalLimiter);

// 8. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// 8. Catch-all 404 Handler for Unknown Routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found on VOID backend`
  });
});

// 9. Centralized Safe Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.message && err.message.includes('Blocked by CORS')) {
    res.status(403).json({
      status: 'error',
      message: err.message
    });
    return;
  }

  // Never log credentials or tokens
  console.error('Unhandled server error:', err?.message || 'Unknown error');

  // Prevent leaking stack traces or internal schemas to clients
  res.status(err?.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err?.message || 'Internal server error')
  });
});

// Async server startup: Connect to MongoDB before opening the HTTP port
export async function startServer() {
  await connectDatabase();
  await initializeDatabaseIndexes();

  // Start background order expiration worker only when the server is run directly
  startOrderExpiryWorker();

  const server = app.listen(PORT, () => {
    console.log(`VOID backend server running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Auth endpoints mounted at: http://localhost:${PORT}/api/auth`);
  });

  return server;
}

// Only start HTTP listener if this file is run directly (not imported as a module in tests)
if (require.main === module) {
  startServer();
}

export default app;

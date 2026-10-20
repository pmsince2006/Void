import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDatabase, isDatabaseConnected } from './config/database';
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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Security Headers (HSTS, NoSniff, XSS protection, Frameguard)
app.use(helmet());

// 2. Strict CORS Configuration: Only allow configured frontend origin with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl) or matching frontend
      if (!origin || origin === FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy: Origin not allowed'));
      }
    },
    credentials: true // Crucial for sending and receiving HttpOnly session cookies
  })
);

// 3. Request Body and Cookie Parsers
app.use(express.json({ limit: '10kb' })); // Guard against large payload DoS attacks
app.use(cookieParser());

// 4. Defense-in-depth CSRF / Origin verification for state-changing requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const origin = req.headers.origin;

  if (isStateChanging && origin && origin !== FRONTEND_URL) {
    res.status(403).json({
      status: 'error',
      message: 'Cross-site request forgery protection: Origin not allowed'
    });
    return;
  }
  next();
});

// 5. Health Check Endpoint (Includes safe database status)
app.get('/api/health', (_req: Request, res: Response) => {
  const dbConnected = isDatabaseConnected();

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    message: 'VOID backend is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 6. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// 7. Catch-all 404 Handler for Unknown Routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found on VOID backend`
  });
});

// 8. Centralized Safe Error Handler
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

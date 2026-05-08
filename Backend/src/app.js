import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';

// ============================================
// Import Routes
// ============================================
import authRoutes from './routes/auth.routes.js';
import companyRoutes from './routes/company.routes.js';
import agentRoutes from './routes/agent.routes.js';
import userRoutes from './routes/user.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import messageRoutes from './routes/message.routes.js';
import chatRoutes from './routes/chat.routes.js';
import slaRoutes from './routes/sla.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';

// ============================================
// Import Middleware & Error Handlers
// ============================================
import { errorHandler, notFoundHandler } from './utils/errorHandler.js';

// ============================================
// Initialize Express App
// ============================================
const app = express();
const __dirname = path.resolve();

// ============================================
// Middleware Configuration
// ============================================

/**
 * CORS Configuration
 * - Allows requests from frontend
 * - Configurable via environment or default to localhost
 */
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      `http://localhost:${process.env.FRONTEND_PORT}`,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ============================================
// Setting up logger for info
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * Body Parser Middleware
 * - Parses incoming JSON request bodies (limit: 10mb)
 * - Parses incoming form-encoded request bodies
 * - Parses cookies from Cookie header
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AideDesk API',
  });
});
// ============================================
// Health Check Endpoint
// ============================================

/**
 * Health Check Route
 * - Verifies server is running
 * - Used for monitoring and tests
 * Endpoint: GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// API Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/sla-config', slaRoutes);
app.use('/api/workspaces', workspaceRoutes);

// ============================================
// Frontend Catch-All (SPA Router)
// ============================================
// Must be AFTER all API routes to avoid intercepting API calls
app.get(/^(?!\/api\/)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// Error Handling & 404
// ============================================

/**
 * 404 Not Found Handler
 * - Catches all undefined routes
 * - Must be before error handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 * - Catches all errors from routes and middleware
 * - Formats error responses consistently
 * - Logs errors for debugging
 */
app.use(errorHandler);

export default app;

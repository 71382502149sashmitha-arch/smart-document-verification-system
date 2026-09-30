import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import { testConnection } from './config/database.js';
import logger from './utils/logger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import verificationRoutes from './routes/verification.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---- SECURITY ----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(generalLimiter);

// ---- PARSING ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- LOGGING ----
app.use(morgan('dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ---- STATIC FILES ----
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// ---- ROUTES ----
app.get(['/api', '/api/'], (req, res) => {
  res.json({
    success: true,
    message: 'Smart Document Verification System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      documents: '/api/documents',
      verification: '/api/verification',
      admin: '/api/admin',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Document Verification System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    demoMode: config.demoMode,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);

// ---- FRONTEND SPA FALLBACK ----
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// ---- ERROR HANDLING ----
app.use(notFound);
app.use(errorHandler);

// ---- START SERVER ----
async function start() {
  const dbConnected = await testConnection();

  app.listen(config.port, '0.0.0.0', () => {
    logger.info('='.repeat(50));
    logger.info('🚀 Smart Document Verification System API');
    logger.info(`   Port: ${config.port}`);
    logger.info(`   Environment: ${config.nodeEnv}`);
    logger.info(`   Frontend: ${config.frontendUrl}`);
    logger.info(`   Database: ${dbConnected ? '✅ Connected' : '❌ Not connected'}`);
    logger.info(`   OCR Engine: ${config.ocrEngine}`);
    logger.info(`   Demo Mode: ${config.demoMode}`);
    logger.info('='.repeat(50));
  });
}

start().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;

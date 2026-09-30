import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import lawyerRoutes from './routes/lawyerRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import documentRoutes from './routes/documentRoutes';
import aiRoutes from './routes/aiRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'NepalAdvocate REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile/dashboard', dashboardRoutes);

// Fallback 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🇳🇵 NepalAdvocate Backend Server Online`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Auth Endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/google`);
  console.log(`   GET  /api/auth/me`);
  console.log(`⚖️ Core Services:`);
  console.log(`   GET  /api/lawyers`);
  console.log(`   POST /api/appointments`);
  console.log(`   GET  /api/documents`);
  console.log(`   POST /api/ai/query`);
  console.log(`   GET  /api/profile/dashboard`);
  console.log(`=======================================================`);
});

export default app;

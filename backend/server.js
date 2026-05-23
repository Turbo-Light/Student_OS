import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Establish database connection (with automatic local fallback)
connectDB();

// Initialize Express application
const app = express();

// Apply global middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Base health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Configure listening port
const PORT = process.env.PORT || 5000;

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`AI Student OS Backend Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on Port: ${PORT}`);
  console.log(`Health Check Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`============================================================\n`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

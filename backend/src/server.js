import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import corsOptions from './config/cors.js';
import errorHandler from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ITIL Asset Management API', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1', apiRoutes);

// API Info
app.get('/api/v1', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ITIL API v1',
    version: '1.0.0',
    endpoints: {
      auth: 'POST /api/v1/auth/login, /register, /me',
      assets: 'GET/POST/PUT/DELETE /api/v1/assets',
      procurement: 'GET/POST/PUT /api/v1/procurement',
      licenses: 'GET/POST/PUT/DELETE /api/v1/licenses',
      departments: 'GET/POST/PUT /api/v1/departments',
      locations: 'GET/POST/PUT /api/v1/locations',
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 API: http://localhost:${PORT}/api/v1`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

export default app;

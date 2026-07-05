require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const pool = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const campusRoutes = require('./routes/campus');
const learningRoutes = require('./routes/learning');
const codingRoutes = require('./routes/coding');
const placementRoutes = require('./routes/placement');
const careerRoutes = require('./routes/career');
const analyticsRoutes = require('./routes/analytics');
const missionRoutes = require('./routes/mission');
const orchestratorRoutes = require('./routes/orchestrator');
const officerRoutes = require('./routes/officer');
const companyRoutes = require('./routes/companies');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static file serving for uploads
app.use('/uploads', express.static(uploadDir));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NEROX AI Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Test DB connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();

    // Auto-run DB migrations
    const migrateDb = require('./config/migrateDb');
    await migrateDb(pool);

    app.listen(PORT, () => {
      console.log(`🚀 NEROX AI Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    console.log('⚠️  Server starting without DB connection — some features will be unavailable');
    app.listen(PORT, () => {
      console.log(`🚀 NEROX AI Server running on port ${PORT} (DB disconnected)`);
    });
  }
};

startServer();

module.exports = app;

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Routes will be mounted here
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  // regex catch-all — avoids path-to-regexp breaking on bare '*'
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Error Handler
app.use(errorHandler);

module.exports = app;

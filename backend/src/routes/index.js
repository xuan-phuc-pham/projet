const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const discussionRoutes = require('./discussions');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Auth-related routes
router.use('/auth', authRoutes);

// User-related routes
router.use('/users', userRoutes);

// Discussion-related routes
router.use('/discussions', discussionRoutes);

module.exports = router;

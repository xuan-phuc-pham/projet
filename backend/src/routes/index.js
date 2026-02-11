const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const postRoutes = require('./posts');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth-related routes
router.use('/auth', authRoutes);

// User-related routes
router.use('/users', userRoutes);

// Post-related routes
router.use('/posts', postRoutes);

module.exports = router;

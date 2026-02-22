const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const discussionRoutes = require('./discussions');

const router = express.Router();

// Route de vérification de santé du serveur
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes utilisateurs
router.use('/users', userRoutes);

// Routes discussions
router.use('/discussions', discussionRoutes);

module.exports = router;

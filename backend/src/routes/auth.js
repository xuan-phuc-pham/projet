const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes lié aux auth

// Suggesté par chat, contre brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: 'Trop de tentatives, veuillez réessayer plus tard' },
});


// POST /auth/register
router.post('/register',
  authLimiter,
  validate({
    username: { required: true, type: 'string', minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9_]+$/ },
    password: { required: true, type: 'string', minLength: 6, maxLength: 128 },
    fname: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    lname: { required: true, type: 'string', minLength: 1, maxLength: 50 },
  }),
  authController.register
);

// POST /auth/login
router.post('/login',
  authLimiter,
  validate({
    username: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  authController.login
);

// POST /auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /auth/me - get current user info
router.get('/me', authenticate, authController.me);

module.exports = router;

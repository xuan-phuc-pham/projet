const express = require('express');
const rateLimit = require('express-rate-limit');
const { User } = require('../../db/models');
const authService = require('../services/auth');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: 'Too many attempts, please try again later' },
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
  async (req, res, next) => {
    try {
      const { username, password, fname, lname } = req.body;

      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Username already taken' });
      }

      const user = await authService.registerUser({ username, password, fname, lname });

      const token = authService.generateToken({ userId: user.id });
      await authService.createSession(user.id, token);

      res.cookie('session_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24h
      });

      res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/login
router.post('/login',
  authLimiter,
  validate({
    username: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const validPassword = await authService.comparePassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = authService.generateToken({ userId: user.id });
      await authService.createSession(user.id, token);

      res.cookie('session_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      const result = await authService.getUserWithPermissions(user.id);

      res.json({ success: true, data: { user: result.user, token } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await authService.deleteSession(req.token);
    res.clearCookie('session_token');
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me - get current user info
router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, data: { user: req.user, permissions: req.permissions } });
});

module.exports = router;

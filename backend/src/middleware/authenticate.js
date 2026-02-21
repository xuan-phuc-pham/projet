const authService = require('../services/auth');

async function authenticate(req, res, next) {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.session_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = authService.verifyToken(token);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // Check session exists in DB (allows server-side revocation)
    const session = await authService.findSession(token);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Session expired or revoked' });
    }

    // Load user with roles and permissions
    const result = await authService.getUserWithPermissions(decoded.userId);
    if (!result) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // Check if user is banned
    const isBanned = result.user.roles.some(r => r.role_name === 'Banned');
    if (isBanned) {
      return res.status(403).json({ success: false, error: 'Account is banned' });
    }

    req.user = result.user;
    req.permissions = result.permissions;
    req.token = token;

    next();
  } catch (err) {
    next(err);
  }
}

// Optional auth: sets req.user if token is present, but doesn't block if absent
async function optionalAuth(req, res, next) {
  try {
    let token = req.cookies?.session_token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      req.user = null;
      req.permissions = [];
      return next();
    }

    let decoded;
    try {
      decoded = authService.verifyToken(token);
    } catch (err) {
      req.user = null;
      req.permissions = [];
      return next();
    }

    const session = await authService.findSession(token);
    if (!session) {
      req.user = null;
      req.permissions = [];
      return next();
    }

    const result = await authService.getUserWithPermissions(decoded.userId);
    if (result) {
      req.user = result.user;
      req.permissions = result.permissions;
      req.token = token;
    } else {
      req.user = null;
      req.permissions = [];
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate, optionalAuth };

// Checks that the authenticated user has at least one of the listed permissions
function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user || !req.permissions) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const hasPermission = permissions.some(perm => req.permissions.includes(perm));
    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    next();
  };
}

// Helper to check a specific permission (used in route handlers for own/any logic)
function hasPermission(req, permissionName) {
  return req.permissions && req.permissions.includes(permissionName);
}

module.exports = { requirePermission, hasPermission };

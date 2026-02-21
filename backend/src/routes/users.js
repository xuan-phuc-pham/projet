const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requirePermission } = require('../middleware/authorize');
const { validate, validateId } = require('../middleware/validate');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /users - list users (paginated)
router.get('/',
  authenticate,
  requirePermission('user.read.any'),
  userController.list
);

// GET /users/me - current user profile
router.get('/me', authenticate, userController.getMe);

// GET /users/:id - get a single user
router.get('/:id',
  validateId('id'),
  authenticate,
  requirePermission('user.read.any', 'user.read.own'),
  userController.getById
);

// PATCH /users/:id - update a user
router.patch('/:id',
  validateId('id'),
  authenticate,
  requirePermission('user.edit.own', 'user.edit.any'),
  validate({
    fname: { type: 'string', maxLength: 50 },
    lname: { type: 'string', maxLength: 50 },
    password: { type: 'string', minLength: 6, maxLength: 128 },
    current_password: { type: 'string' },
  }),
  userController.update
);

// DELETE /users/:id - delete a user
router.delete('/:id',
  validateId('id'),
  authenticate,
  requirePermission('user.delete.own', 'user.delete.any'),
  userController.remove
);

// POST /users/:id/ban - ban a user
router.post('/:id/ban',
  validateId('id'),
  authenticate,
  requirePermission('user.ban.any'),
  userController.ban
);

// POST /users/:id/unban - unban a user (restore to User role)
router.post('/:id/unban',
  validateId('id'),
  authenticate,
  requirePermission('user.ban.any'),
  userController.unban
);

module.exports = router;

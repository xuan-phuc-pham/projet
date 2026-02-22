const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requirePermission } = require('../middleware/authorize');
const { validate, validateId } = require('../middleware/validate');
const userController = require('../controllers/userController');

const router = express.Router();

// Route lié aux utilisateurs

// GET /users - lister les utilisateurs (paginé)
router.get('/',
  authenticate,
  requirePermission('user.read.any'),
  userController.list
);

// GET /users/me - profil de l'utilisateur connecté
router.get('/me', authenticate, userController.getMe);

// GET /users/:id - récupérer un utilisateur
router.get('/:id',
  validateId('id'),
  authenticate,
  requirePermission('user.read.any', 'user.read.own'),
  userController.getById
);

// PATCH /users/:id - modifier un utilisateur
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

// DELETE /users/:id - supprimer un utilisateur
router.delete('/:id',
  validateId('id'),
  authenticate,
  requirePermission('user.delete.own', 'user.delete.any'),
  userController.remove
);

// POST /users/:id/ban - bannir un utilisateur
router.post('/:id/ban',
  validateId('id'),
  authenticate,
  requirePermission('user.ban.any'),
  userController.ban
);

// POST /users/:id/unban - débannir un utilisateur (remettre le rôle User)
router.post('/:id/unban',
  validateId('id'),
  authenticate,
  requirePermission('user.ban.any'),
  userController.unban
);

module.exports = router;

const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requirePermission } = require('../middleware/authorize');
const { validate, validateId, REACTION_TYPES } = require('../middleware/validate');
const discussionController = require('../controllers/discussionController');

const router = express.Router();

const commentRouter = require('./comments');

// Montage des sous-routes commentaires: /discussions/:discussionId/comments
router.use('/:discussionId/comments', validateId('discussionId'), commentRouter);

// DISCUSSIONS

// GET /discussions - lister toutes les discussions (paginé)
router.get('/', discussionController.list);

// GET /discussions/:id - récupérer une discussion avec ses commentaires et réactions
router.get('/:id', validateId('id'), discussionController.getById);

// POST /discussions - créer une discussion
router.post('/',
  authenticate,
  requirePermission('discussion.create'),
  validate({
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    content: { required: true, type: 'string', minLength: 1, maxLength: 10000 },
  }),
  discussionController.create
);

// PATCH /discussions/:id - modifier une discussion
router.patch('/:id',
  validateId('id'),
  authenticate,
  requirePermission('discussion.edit.own', 'discussion.edit.any'),
  validate({
    title: { type: 'string', maxLength: 200 },
    content: { type: 'string', maxLength: 10000 },
  }),
  discussionController.update
);

// DELETE /discussions/:id - supprimer une discussion
router.delete('/:id',
  validateId('id'),
  authenticate,
  requirePermission('discussion.delete.own', 'discussion.delete.any'),
  discussionController.remove
);


// RÉACTIONS DE DISCUSSION

// POST /discussions/:id/reactions - ajouter/modifier une réaction sur une discussion
router.post('/:id/reactions',
  validateId('id'),
  authenticate,
  requirePermission('reaction.create'),
  validate({
    type: { required: true, type: 'string', enum: REACTION_TYPES },
  }),
  discussionController.addReaction
);

// DELETE /discussions/:id/reactions - supprimer sa réaction d'une discussion
router.delete('/:id/reactions',
  validateId('id'),
  authenticate,
  requirePermission('reaction.delete.own'),
  discussionController.removeReaction
);

module.exports = router;

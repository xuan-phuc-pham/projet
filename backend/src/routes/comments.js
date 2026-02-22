const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requirePermission } = require('../middleware/authorize');
const { validate, validateId, REACTION_TYPES } = require('../middleware/validate');
const commentController = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

// =============================================
// COMMENTAIRES

// GET /discussions/:discussionId/comments - lister les commentaires d'une discussion
router.get('/', commentController.list);

// POST /discussions/:discussionId/comments - créer un commentaire
router.post('/',
  authenticate,
  requirePermission('comment.create'),
  validate({
    content: { required: true, type: 'string', minLength: 1, maxLength: 5000 },
  }),
  commentController.create
);

// PATCH /discussions/:discussionId/comments/:commentId - modifier un commentaire
router.patch('/:commentId',
  validateId('commentId'),
  authenticate,
  requirePermission('comment.edit.own', 'comment.edit.any'),
  validate({
    content: { required: true, type: 'string', minLength: 1, maxLength: 5000 },
  }),
  commentController.update
);

// DELETE /discussions/:discussionId/comments/:commentId - supprimer un commentaire
router.delete('/:commentId',
  validateId('commentId'),
  authenticate,
  requirePermission('comment.delete.own', 'comment.delete.any'),
  commentController.remove
);

// =============================================
// RÉACTIONS DE COMMENTAIRE

// POST /discussions/:discussionId/comments/:commentId/reactions - ajouter/modifier une réaction
router.post('/:commentId/reactions',
  validateId('commentId'),
  authenticate,
  requirePermission('reaction.create'),
  validate({
    type: { required: true, type: 'string', enum: REACTION_TYPES },
  }),
  commentController.addReaction
);

// DELETE /discussions/:discussionId/comments/:commentId/reactions - supprimer sa réaction
router.delete('/:commentId/reactions',
  validateId('commentId'),
  authenticate,
  requirePermission('reaction.delete.own'),
  commentController.removeReaction
);

module.exports = router;

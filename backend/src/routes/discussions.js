const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requirePermission } = require('../middleware/authorize');
const { validate, validateId, REACTION_TYPES } = require('../middleware/validate');
const discussionController = require('../controllers/discussionController');

const router = express.Router();

const commentRouter = require('./comments');

// Mount comment sub-routes: /discussions/:discussionId/comments
router.use('/:discussionId/comments', validateId('discussionId'), commentRouter);

// =============================================
// DISCUSSION CRUD
// =============================================

// GET /discussions - list all discussions (paginated)
router.get('/', discussionController.list);

// GET /discussions/:id - get a single discussion with comments and reactions
router.get('/:id', validateId('id'), discussionController.getById);

// POST /discussions - create a discussion
router.post('/',
  authenticate,
  requirePermission('discussion.create'),
  validate({
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    content: { required: true, type: 'string', minLength: 1, maxLength: 10000 },
  }),
  discussionController.create
);

// PATCH /discussions/:id - update a discussion
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

// DELETE /discussions/:id - delete a discussion
router.delete('/:id',
  validateId('id'),
  authenticate,
  requirePermission('discussion.delete.own', 'discussion.delete.any'),
  discussionController.remove
);

// =============================================
// DISCUSSION REACTIONS
// =============================================

// POST /discussions/:id/reactions - add/update reaction on a discussion
router.post('/:id/reactions',
  validateId('id'),
  authenticate,
  requirePermission('reaction.create'),
  validate({
    type: { required: true, type: 'string', enum: REACTION_TYPES },
  }),
  discussionController.addReaction
);

// DELETE /discussions/:id/reactions - remove own reaction from a discussion
router.delete('/:id/reactions',
  validateId('id'),
  authenticate,
  requirePermission('reaction.delete.own'),
  discussionController.removeReaction
);

module.exports = router;

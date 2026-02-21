const express = require('express');
const { Discussion, User, Comment, ReactionDiscussion, ReactionComment, sequelize } = require('../../db/models');
const { authenticate } = require('../middleware/authenticate');
const { requirePermission, hasPermission } = require('../middleware/authorize');
const { validate, REACTION_TYPES } = require('../middleware/validate');
const { escapeHtml } = require('../utils/sanitize');

const router = express.Router();

const commentRouter = require('./comments');

// Mount comment sub-routes: /discussions/:discussionId/comments
router.use('/:discussionId/comments', commentRouter);

// =============================================
// DISCUSSION CRUD
// =============================================

// GET /discussions - list all discussions (paginated)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Discussion.findAndCountAll({
      include: [
        { model: User, as: 'owner', attributes: ['id', 'username', 'fname', 'lname'] },
        { model: ReactionDiscussion, as: 'reactions', attributes: ['id', 'user_id', 'type'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        discussions: rows,
        pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /discussions/:id - get a single discussion with comments and reactions
router.get('/:id', async (req, res, next) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'username', 'fname', 'lname'] },
        {
          model: Comment,
          as: 'comments',
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'fname', 'lname'] },
            { model: ReactionComment, as: 'reactions', attributes: ['id', 'user_id', 'type'] },
          ],
          order: [['createdAt', 'ASC']],
        },
        { model: ReactionDiscussion, as: 'reactions', attributes: ['id', 'user_id', 'type'] },
      ],
    });

    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    res.json({ success: true, data: { discussion } });
  } catch (err) {
    next(err);
  }
});

// POST /discussions - create a discussion
router.post('/',
  authenticate,
  requirePermission('discussion.create'),
  validate({
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    content: { required: true, type: 'string', minLength: 1, maxLength: 10000 },
  }),
  async (req, res, next) => {
    try {
      const discussion = await Discussion.create({
        owner_id: req.user.id,
        title: escapeHtml(req.body.title),
        content: escapeHtml(req.body.content),
      });

      const full = await Discussion.findByPk(discussion.id, {
        include: [{ model: User, as: 'owner', attributes: ['id', 'username', 'fname', 'lname'] }],
      });

      res.status(201).json({ success: true, data: { discussion: full } });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /discussions/:id - update a discussion
router.patch('/:id',
  authenticate,
  requirePermission('discussion.edit.own', 'discussion.edit.any'),
  validate({
    title: { type: 'string', maxLength: 200 },
    content: { type: 'string', maxLength: 10000 },
  }),
  async (req, res, next) => {
    try {
      const discussion = await Discussion.findByPk(req.params.id);
      if (!discussion) {
        return res.status(404).json({ success: false, error: 'Discussion not found' });
      }

      // Check ownership for .own permission
      const canEditAny = hasPermission(req, 'discussion.edit.any');
      if (!canEditAny && discussion.owner_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'You can only edit your own discussions' });
      }

      const updates = {};
      if (req.body.title !== undefined) updates.title = escapeHtml(req.body.title);
      if (req.body.content !== undefined) updates.content = escapeHtml(req.body.content);

      await discussion.update(updates);

      const full = await Discussion.findByPk(discussion.id, {
        include: [{ model: User, as: 'owner', attributes: ['id', 'username', 'fname', 'lname'] }],
      });

      res.json({ success: true, data: { discussion: full } });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /discussions/:id - delete a discussion
router.delete('/:id',
  authenticate,
  requirePermission('discussion.delete.own', 'discussion.delete.any'),
  async (req, res, next) => {
    try {
      const discussion = await Discussion.findByPk(req.params.id);
      if (!discussion) {
        return res.status(404).json({ success: false, error: 'Discussion not found' });
      }

      const canDeleteAny = hasPermission(req, 'discussion.delete.any');
      if (!canDeleteAny && discussion.owner_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'You can only delete your own discussions' });
      }

      // Delete related data in a transaction
      const transaction = await sequelize.transaction();
      try {
        // Delete reactions on comments of this discussion
        const commentIds = await Comment.findAll({
          where: { discussion_id: discussion.id },
          attributes: ['id'],
          transaction,
        });
        if (commentIds.length > 0) {
          await ReactionComment.destroy({
            where: { comment_id: commentIds.map(c => c.id) },
            transaction,
          });
        }

        await Comment.destroy({ where: { discussion_id: discussion.id }, transaction });
        await ReactionDiscussion.destroy({ where: { disscussion_id: discussion.id }, transaction });
        await discussion.destroy({ transaction });

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }

      res.json({ success: true, data: { message: 'Discussion deleted' } });
    } catch (err) {
      next(err);
    }
  }
);

// =============================================
// DISCUSSION REACTIONS
// =============================================

// POST /discussions/:id/reactions - add/update reaction on a discussion
router.post('/:id/reactions',
  authenticate,
  requirePermission('reaction.create'),
  validate({
    type: { required: true, type: 'string', enum: REACTION_TYPES },
  }),
  async (req, res, next) => {
    try {
      const discussion = await Discussion.findByPk(req.params.id);
      if (!discussion) {
        return res.status(404).json({ success: false, error: 'Discussion not found' });
      }

      // Upsert: update if exists, create if not
      const existing = await ReactionDiscussion.findOne({
        where: { user_id: req.user.id, disscussion_id: discussion.id },
      });

      let reaction;
      if (existing) {
        await existing.update({ type: req.body.type });
        reaction = existing;
      } else {
        reaction = await ReactionDiscussion.create({
          user_id: req.user.id,
          disscussion_id: discussion.id,
          type: req.body.type,
        });
      }

      res.status(201).json({ success: true, data: { reaction } });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /discussions/:id/reactions - remove own reaction from a discussion
router.delete('/:id/reactions',
  authenticate,
  requirePermission('reaction.delete.own'),
  async (req, res, next) => {
    try {
      const deleted = await ReactionDiscussion.destroy({
        where: { user_id: req.user.id, disscussion_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Reaction not found' });
      }

      res.json({ success: true, data: { message: 'Reaction removed' } });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

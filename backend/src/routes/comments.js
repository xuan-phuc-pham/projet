const express = require('express');
const { Comment, Discussion, User, ReactionComment } = require('../../db/models');
const { authenticate } = require('../middleware/authenticate');
const { requirePermission, hasPermission } = require('../middleware/authorize');
const { validate, REACTION_TYPES } = require('../middleware/validate');
const { escapeHtml } = require('../utils/sanitize');

const router = express.Router({ mergeParams: true });

// GET /discussions/:discussionId/comments - list comments for a discussion
router.get('/', async (req, res, next) => {
  try {
    const discussion = await Discussion.findByPk(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Comment.findAndCountAll({
      where: { discussion_id: req.params.discussionId },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'fname', 'lname'] },
        { model: ReactionComment, as: 'reactions', attributes: ['id', 'user_id', 'type'] },
      ],
      order: [['createdAt', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        comments: rows,
        pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /discussions/:discussionId/comments - create a comment
router.post('/',
  authenticate,
  requirePermission('comment.create'),
  validate({
    content: { required: true, type: 'string', minLength: 1, maxLength: 5000 },
  }),
  async (req, res, next) => {
    try {
      const discussion = await Discussion.findByPk(req.params.discussionId);
      if (!discussion) {
        return res.status(404).json({ success: false, error: 'Discussion not found' });
      }

      const comment = await Comment.create({
        user_id: req.user.id,
        discussion_id: discussion.id,
        content: escapeHtml(req.body.content),
      });

      const full = await Comment.findByPk(comment.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fname', 'lname'] }],
      });

      res.status(201).json({ success: true, data: { comment: full } });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /discussions/:discussionId/comments/:commentId - update a comment
router.patch('/:commentId',
  authenticate,
  requirePermission('comment.edit.own', 'comment.edit.any'),
  validate({
    content: { required: true, type: 'string', minLength: 1, maxLength: 5000 },
  }),
  async (req, res, next) => {
    try {
      const comment = await Comment.findOne({
        where: { id: req.params.commentId, discussion_id: req.params.discussionId },
      });

      if (!comment) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }

      const canEditAny = hasPermission(req, 'comment.edit.any');
      if (!canEditAny && comment.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'You can only edit your own comments' });
      }

      await comment.update({ content: escapeHtml(req.body.content) });

      const full = await Comment.findByPk(comment.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fname', 'lname'] }],
      });

      res.json({ success: true, data: { comment: full } });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /discussions/:discussionId/comments/:commentId - delete a comment
router.delete('/:commentId',
  authenticate,
  requirePermission('comment.delete.own', 'comment.delete.any'),
  async (req, res, next) => {
    try {
      const comment = await Comment.findOne({
        where: { id: req.params.commentId, discussion_id: req.params.discussionId },
      });

      if (!comment) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }

      const canDeleteAny = hasPermission(req, 'comment.delete.any');
      if (!canDeleteAny && comment.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'You can only delete your own comments' });
      }

      // Delete reactions on this comment first, then the comment
      await ReactionComment.destroy({ where: { comment_id: comment.id } });
      await comment.destroy();

      res.json({ success: true, data: { message: 'Comment deleted' } });
    } catch (err) {
      next(err);
    }
  }
);

// =============================================
// COMMENT REACTIONS
// =============================================

// POST /discussions/:discussionId/comments/:commentId/reactions
router.post('/:commentId/reactions',
  authenticate,
  requirePermission('reaction.create'),
  validate({
    type: { required: true, type: 'string', enum: REACTION_TYPES },
  }),
  async (req, res, next) => {
    try {
      const comment = await Comment.findOne({
        where: { id: req.params.commentId, discussion_id: req.params.discussionId },
      });

      if (!comment) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }

      const existing = await ReactionComment.findOne({
        where: { user_id: req.user.id, comment_id: comment.id },
      });

      let reaction;
      if (existing) {
        await existing.update({ type: req.body.type });
        reaction = existing;
      } else {
        reaction = await ReactionComment.create({
          user_id: req.user.id,
          comment_id: comment.id,
          type: req.body.type,
        });
      }

      res.status(201).json({ success: true, data: { reaction } });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /discussions/:discussionId/comments/:commentId/reactions
router.delete('/:commentId/reactions',
  authenticate,
  requirePermission('reaction.delete.own'),
  async (req, res, next) => {
    try {
      const deleted = await ReactionComment.destroy({
        where: { user_id: req.user.id, comment_id: req.params.commentId },
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

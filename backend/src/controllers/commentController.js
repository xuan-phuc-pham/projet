const { Comment, Discussion, User, ReactionComment } = require('../../db/models');
const { hasPermission } = require('../middleware/authorize');
const { escapeHtml } = require('../utils/sanitize');


// Fonction liee aux commentaires des discussions

const list = async (req, res, next) => {
  try {
    const discussion = await Discussion.findByPk(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion pas trouve' });
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
};

const create = async (req, res, next) => {
  try {
    const discussion = await Discussion.findByPk(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion pas trouve' });
    }

    const comment = await Comment.create({
      user_id: req.user.id,
      discussion_id: discussion.id,
      content: escapeHtml(req.body.content),
    });

    const full = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'fname', 'lname'] },
      ],
    });

    res.status(201).json({ success: true, data: { comment: full } });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      where: {
        id: req.params.commentId,
        discussion_id: req.params.discussionId,
      },
    });

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Commentaire pas trouvé' });
    }

    const canEditAny = hasPermission(req, 'comment.edit.any');
    if (!canEditAny && comment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Vous pouvez seulement modifier vos propres commentaires',
      });
    }

    await comment.update({ content: escapeHtml(req.body.content) });

    const full = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'fname', 'lname'] },
      ],
    });

    res.json({ success: true, data: { comment: full } });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      where: {
        id: req.params.commentId,
        discussion_id: req.params.discussionId,
      },
    });

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Commentaire pas trouvé' });
    }

    const canDeleteAny = hasPermission(req, 'comment.delete.any');
    if (!canDeleteAny && comment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Vous pouvez seulement supprimer vos propres commentaires',
      });
    }

    // Delete reactions on this comment first, then the comment
    await ReactionComment.destroy({ where: { comment_id: comment.id } });
    await comment.destroy();

    res.json({ success: true, data: { message: 'Commentaire supprime' } });
  } catch (err) {
    next(err);
  }
};

const addReaction = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      where: {
        id: req.params.commentId,
        discussion_id: req.params.discussionId,
      },
    });

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Commentaire pas trouve' });
    }

    const existing = await ReactionComment.findOne({
      where: { user_id: req.user.id, comment_id: comment.id },
    });

    let reaction;
    let created = false;
    if (existing) {
      await existing.update({ type: req.body.type });
      reaction = existing;
    } else {
      reaction = await ReactionComment.create({
        user_id: req.user.id,
        comment_id: comment.id,
        type: req.body.type,
      });
      created = true;
    }

    res.status(created ? 201 : 200).json({ success: true, data: { reaction } });
  } catch (err) {
    next(err);
  }
};

const removeReaction = async (req, res, next) => {
  try {
    const deleted = await ReactionComment.destroy({
      where: { user_id: req.user.id, comment_id: req.params.commentId },
    });

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Reaction pas trouvé' });
    }

    res.json({ success: true, data: { message: 'Reaction supprime' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove, addReaction, removeReaction };

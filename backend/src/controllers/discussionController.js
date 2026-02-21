const { Discussion, User, Comment, ReactionDiscussion, ReactionComment, sequelize } = require('../../db/models');
const { hasPermission } = require('../middleware/authorize');
const { escapeHtml } = require('../utils/sanitize');

const list = async (req, res, next) => {
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
};

const getById = async (req, res, next) => {
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
};

const create = async (req, res, next) => {
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
};

const update = async (req, res, next) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }

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
};

const remove = async (req, res, next) => {
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
};

const addReaction = async (req, res, next) => {
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
};

const removeReaction = async (req, res, next) => {
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
};

module.exports = { list, getById, create, update, remove, addReaction, removeReaction };

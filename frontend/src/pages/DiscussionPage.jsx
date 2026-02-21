import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import ReactionBar from '../components/ReactionBar';
import CommentForm from '../components/CommentForm';
import DiscussionForm from '../components/DiscussionForm';
import Pagination from '../components/Pagination';

export default function DiscussionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPagination, setCommentPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);

  const fetchDiscussion = useCallback(async () => {
    try {
      const data = await api.get(`/discussions/${id}`);
      setDiscussion(data.discussion);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async (page = 1) => {
    try {
      const data = await api.get(`/discussions/${id}/comments?page=${page}&limit=20`);
      setComments(data.comments);
      setCommentPagination(data.pagination);
    } catch {
      // comments may fail silently if discussion loaded
    }
  }, [id]);

  useEffect(() => {
    fetchDiscussion();
    fetchComments();
  }, [fetchDiscussion, fetchComments]);

  const canEditDiscussion = () => {
    if (!user || !discussion) return false;
    if (hasPermission('discussion.edit.any')) return true;
    if (hasPermission('discussion.edit.own') && discussion.owner_id === user.id) return true;
    return false;
  };

  const canDeleteDiscussion = () => {
    if (!user || !discussion) return false;
    if (hasPermission('discussion.delete.any')) return true;
    if (hasPermission('discussion.delete.own') && discussion.owner_id === user.id) return true;
    return false;
  };

  const canEditComment = (comment) => {
    if (!user) return false;
    if (hasPermission('comment.edit.any')) return true;
    if (hasPermission('comment.edit.own') && comment.user_id === user.id) return true;
    return false;
  };

  const canDeleteComment = (comment) => {
    if (!user) return false;
    if (hasPermission('comment.delete.any')) return true;
    if (hasPermission('comment.delete.own') && comment.user_id === user.id) return true;
    return false;
  };

  const handleEditDiscussion = async (body) => {
    await api.patch(`/discussions/${id}`, body);
    setEditing(false);
    await fetchDiscussion();
  };

  const handleDeleteDiscussion = async () => {
    if (!confirm('Delete this discussion?')) return;
    await api.delete(`/discussions/${id}`);
    navigate('/');
  };

  const handleDiscussionReact = async (type) => {
    await api.post(`/discussions/${id}/reactions`, { type });
    await fetchDiscussion();
  };

  const handleDiscussionRemoveReaction = async () => {
    await api.delete(`/discussions/${id}/reactions`);
    await fetchDiscussion();
  };

  const handleAddComment = async (body) => {
    await api.post(`/discussions/${id}/comments`, body);
    await fetchComments(commentPagination.page);
  };

  const handleEditComment = async (commentId, body) => {
    await api.patch(`/discussions/${id}/comments/${commentId}`, body);
    setEditingCommentId(null);
    await fetchComments(commentPagination.page);
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    await api.delete(`/discussions/${id}/comments/${commentId}`);
    await fetchComments(commentPagination.page);
  };

  const handleCommentReact = async (commentId, type) => {
    await api.post(`/discussions/${id}/comments/${commentId}/reactions`, { type });
    await fetchComments(commentPagination.page);
  };

  const handleCommentRemoveReaction = async (commentId) => {
    await api.delete(`/discussions/${id}/comments/${commentId}/reactions`);
    await fetchComments(commentPagination.page);
  };

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!discussion) return <div className="page"><div className="empty-state">Discussion not found</div></div>;

  const owner = discussion.owner;
  const date = new Date(discussion.createdAt).toLocaleString();

  return (
    <div className="page">
      {/* Discussion Header */}
      <div className="card">
        {editing ? (
          <DiscussionForm
            initial={{ title: discussion.title, content: discussion.content }}
            onSubmit={handleEditDiscussion}
            onCancel={() => setEditing(false)}
            submitLabel="Save Changes"
          />
        ) : (
          <>
            <div className="discussion-header">
              <h1 className="discussion-title">{discussion.title}</h1>
              <div className="discussion-meta">
                by <strong>{owner?.username || 'Unknown'}</strong> &middot; {date}
              </div>
              <div className="discussion-content">{discussion.content}</div>
            </div>

            <ReactionBar
              reactions={discussion.reactions || []}
              onReact={handleDiscussionReact}
              onRemoveReaction={handleDiscussionRemoveReaction}
            />

            {(canEditDiscussion() || canDeleteDiscussion()) && (
              <div className="discussion-actions">
                {canEditDiscussion() && (
                  <button className="btn btn-sm" onClick={() => setEditing(true)}>Edit</button>
                )}
                {canDeleteDiscussion() && (
                  <button className="btn btn-sm btn-danger" onClick={handleDeleteDiscussion}>Delete</button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2 className="comments-title">Comments</h2>

        {user && hasPermission('comment.create') && (
          <div style={{ marginBottom: '1rem' }}>
            <CommentForm onSubmit={handleAddComment} />
          </div>
        )}

        {comments.length === 0 ? (
          <div className="empty-state">No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              {editingCommentId === comment.id ? (
                <CommentForm
                  initial={{ content: comment.content }}
                  onSubmit={(body) => handleEditComment(comment.id, body)}
                  onCancel={() => setEditingCommentId(null)}
                  submitLabel="Save"
                />
              ) : (
                <>
                  <div className="comment-meta">
                    <strong>{comment.author?.username || 'Unknown'}</strong> &middot;{' '}
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  <div className="comment-content">{comment.content}</div>

                  <ReactionBar
                    reactions={comment.reactions || []}
                    onReact={(type) => handleCommentReact(comment.id, type)}
                    onRemoveReaction={() => handleCommentRemoveReaction(comment.id)}
                  />

                  {(canEditComment(comment) || canDeleteComment(comment)) && (
                    <div className="comment-actions">
                      {canEditComment(comment) && (
                        <button className="btn btn-sm" onClick={() => setEditingCommentId(comment.id)}>Edit</button>
                      )}
                      {canDeleteComment(comment) && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}

        <Pagination
          page={commentPagination.page}
          pages={commentPagination.pages}
          onPageChange={fetchComments}
        />
      </div>
    </div>
  );
}

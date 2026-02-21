import { useState } from 'react';

export default function CommentForm({ initial, onSubmit, onCancel, submitLabel = 'Post Comment' }) {
  const [content, setContent] = useState(initial?.content || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) return setError('Comment cannot be empty');
    if (content.length > 5000) return setError('Comment must be at most 5000 characters');

    setSubmitting(true);
    try {
      await onSubmit({ content: content.trim() });
      if (!initial) setContent('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <textarea
          className="form-input form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          rows={3}
          placeholder="Write a comment..."
        />
      </div>

      <div className="modal-actions">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Posting...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

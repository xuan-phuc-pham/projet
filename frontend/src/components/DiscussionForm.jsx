import { useState } from 'react';

export default function DiscussionForm({ initial, onSubmit, onCancel, submitLabel = 'Submit' }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Title is required');
    if (title.length > 200) return setError('Title must be at most 200 characters');
    if (!content.trim()) return setError('Content is required');
    if (content.length > 10000) return setError('Content must be at most 10000 characters');

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim() });
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
        <label>Title</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Discussion title"
        />
      </div>

      <div className="form-group">
        <label>Content</label>
        <textarea
          className="form-input form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={10000}
          rows={6}
          placeholder="Write your discussion content..."
        />
      </div>

      <div className="modal-actions">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

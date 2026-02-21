import { useNavigate } from 'react-router-dom';

export default function DiscussionCard({ discussion }) {
  const navigate = useNavigate();
  const owner = discussion.owner;
  const date = new Date(discussion.createdAt).toLocaleDateString();
  const reactionCount = discussion.reactions?.length || 0;

  return (
    <div className="card discussion-card" onClick={() => navigate(`/discussions/${discussion.id}`)}>
      <div className="discussion-card-title">{discussion.title}</div>
      <div className="discussion-card-meta">
        by <strong>{owner?.username || 'Unknown'}</strong> &middot; {date}
        {reactionCount > 0 && <> &middot; {reactionCount} reaction{reactionCount !== 1 ? 's' : ''}</>}
      </div>
      <div className="discussion-card-preview">{discussion.content}</div>
    </div>
  );
}

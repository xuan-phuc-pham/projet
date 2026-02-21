import { useAuth } from '../hooks/useAuth';

const REACTION_EMOJIS = {
  like: '👍',
  dislike: '👎',
  love: '❤️',
  wow: '😮',
  haha: '😂',
  sad: '😢',
  angry: '😡',
};

export default function ReactionBar({ reactions = [], onReact, onRemoveReaction }) {
  const { user } = useAuth();

  // Group reactions by type with count
  const grouped = {};
  for (const r of reactions) {
    if (!grouped[r.type]) {
      grouped[r.type] = { count: 0, userReacted: false };
    }
    grouped[r.type].count++;
    if (user && r.user_id === user.id) {
      grouped[r.type].userReacted = true;
    }
  }

  // Find current user's reaction type
  const userReaction = user ? reactions.find((r) => r.user_id === user.id) : null;

  const handleClick = (type) => {
    if (!user) return;
    if (userReaction && userReaction.type === type) {
      onRemoveReaction();
    } else {
      onReact(type);
    }
  };

  if (!user) {
    // Show read-only reaction summary for guests
    const types = Object.keys(grouped);
    if (types.length === 0) return null;
    return (
      <div className="reaction-bar">
        {types.map((type) => (
          <span key={type} className="reaction-btn" style={{ cursor: 'default' }}>
            {REACTION_EMOJIS[type]} <span className="reaction-count">{grouped[type].count}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="reaction-bar">
      {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
        const info = grouped[type];
        const isActive = userReaction && userReaction.type === type;
        return (
          <button
            key={type}
            className={`reaction-btn ${isActive ? 'active' : ''}`}
            onClick={() => handleClick(type)}
            title={type}
          >
            {emoji}
            {info && <span className="reaction-count">{info.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

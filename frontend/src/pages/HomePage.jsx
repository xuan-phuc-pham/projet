import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import DiscussionCard from '../components/DiscussionCard';
import DiscussionForm from '../components/DiscussionForm';
import Pagination from '../components/Pagination';

export default function HomePage() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchDiscussions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get(`/discussions?page=${page}&limit=20`);
      setDiscussions(data.discussions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleCreate = async (body) => {
    const data = await api.post('/discussions', body);
    setShowForm(false);
    navigate(`/discussions/${data.discussion.id}`);
  };

  return (
    <div className="page">
      <div className="flex-between">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Discussions</h1>
        {user && hasPermission('discussion.create') && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Discussion'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <DiscussionForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitLabel="Create Discussion"
          />
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading discussions...</div>
      ) : discussions.length === 0 ? (
        <div className="empty-state">No discussions yet. Be the first to start one!</div>
      ) : (
        <>
          {discussions.map((d) => (
            <DiscussionCard key={d.id} discussion={d} />
          ))}
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={fetchDiscussions}
          />
        </>
      )}
    </div>
  );
}

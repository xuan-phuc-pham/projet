import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', fname: '', lname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim()) return setError('Username is required');
    if (form.username.length < 3 || form.username.length > 30) return setError('Username must be 3-30 characters');
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return setError('Username can only contain letters, numbers, and underscores');
    if (!form.password || form.password.length < 6) return setError('Password must be at least 6 characters');
    if (!form.fname.trim()) return setError('First name is required');
    if (!form.lname.trim()) return setError('Last name is required');

    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        password: form.password,
        fname: form.fname.trim(),
        lname: form.lname.trim(),
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-card">
        <h1 className="page-title">Register</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input className="form-input" value={form.username} onChange={update('username')} autoComplete="username" />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input className="form-input" value={form.fname} onChange={update('fname')} />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input className="form-input" value={form.lname} onChange={update('lname')} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" value={form.password} onChange={update('password')} autoComplete="new-password" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login" className="text-link">Already have an account? Login</Link>
        </p>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, hasAnyPermission, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">Forum</Link>

        <div className="navbar-links">
          <Link to="/">Discussions</Link>

          {user && hasAnyPermission('user.read.any', 'user.ban.any') && (
            <Link to="/admin">Admin</Link>
          )}

          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <span className="navbar-user">{user.username}</span>
              <button className="btn btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

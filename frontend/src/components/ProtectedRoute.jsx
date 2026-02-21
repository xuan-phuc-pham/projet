import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, permission }) {
  const { user, loading, hasPermission, hasAnyPermission } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission) {
    const perms = Array.isArray(permission) ? permission : [permission];
    if (!hasAnyPermission(...perms)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

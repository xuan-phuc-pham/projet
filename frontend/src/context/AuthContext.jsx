import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      setPermissions(data.permissions || []);
    } catch {
      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    setUser(data.user);
    // Fetch full permissions after login
    await fetchMe();
    return data;
  };

  const register = async ({ username, password, fname, lname }) => {
    const data = await api.post('/auth/register', { username, password, fname, lname });
    setUser(data.user);
    await fetchMe();
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout errors
    }
    setUser(null);
    setPermissions([]);
  };

  const hasPermission = (perm) => permissions.includes(perm);

  const hasAnyPermission = (...perms) => perms.some((p) => permissions.includes(p));

  const value = {
    user,
    permissions,
    loading,
    login,
    register,
    logout,
    hasPermission,
    hasAnyPermission,
    refreshUser: fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

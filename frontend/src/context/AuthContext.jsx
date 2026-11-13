import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only "loading" if there is a token to validate
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));

  // On app load, check if a token exists and validate it against /me
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    api
        .get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token'); // stale/invalid token
          setUser(null);
        })
        .finally(() => setLoading(false));
  }, []);

  // `identifier` is an email or a username. There is no signup: new accounts come from Google login.
  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
  };

  const value = { user, isLoggedIn: !!user, loading, login, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GuestRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null; // avoid flicker while auth check resolves
  if (isLoggedIn) return <Navigate to="/" replace />;

  return children;
}

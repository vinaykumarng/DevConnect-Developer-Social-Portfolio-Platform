import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// There is deliberately no email + password form here: new accounts are created through
// Google sign-in (see PROJECT_CONTEXT.md, "No standalone email/password signup").
// When Google login is built, pass its handler as `onGoogle`.
export default function Signup() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
      <AuthLayout
          title="SignUp."
          onGoogle={handleGoogleLogin}
          footer={
            <>
              <p>New accounts are created with Google sign-in.</p>
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-link hover:underline">
                  Login
                </Link>
              </p>
            </>
          }
      />
  );
}
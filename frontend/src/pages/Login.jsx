import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { OrDivider } from '../components/auth/AuthLayout';
import FloatingInput from '../components/auth/FloatingInput';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// Two steps, as in the Figma: first the email or username, then the password.
export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (identifier.trim()) setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
      <AuthLayout
          title="LogIn."
          onGoogle={handleGoogleLogin}
          footer={
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-link hover:underline">
                Sign up
              </Link>
            </p>
          }
      >
        <OrDivider />

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
              <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
          )}

          {step === 1 ? (
              <FloatingInput
                  id="identifier"
                  label="Email or username"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
              />
          ) : (
              <>
                <p className="flex items-center justify-between rounded-md border-2 border-line px-3 py-2 text-sm">
                  <span className="truncate">{identifier}</span>
                  <button type="button" onClick={() => setStep(1)} className="ml-2 shrink-0 text-xs text-link hover:underline">
                    Change
                  </button>
                </p>
                <FloatingInput
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </>
          )}

          <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-10 w-full rounded-full bg-plum text-sm font-bold text-white transition-colors hover:bg-plum-soft disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in...' : 'Continue'}
          </button>
        </form>
      </AuthLayout>
  );
}
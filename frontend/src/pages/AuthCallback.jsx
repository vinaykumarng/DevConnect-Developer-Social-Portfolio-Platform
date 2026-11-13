import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            checkAuth();
            navigate('/');
        } else {
            navigate('/login?error=AuthenticationFailed');
        }
    }, [searchParams, navigate, checkAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
            <p className="text-sm text-gray-400">Completing login...</p>
        </div>
    );
}
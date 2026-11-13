import { Routes, Route, Link } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ComingSoon from './pages/ComingSoon';
import AuthCallback from './pages/AuthCallback';

const COMING_SOON = ['explore', 'notifications', 'messages', 'communities', 'premium', 'more'];

function NotFound() {
  return (
    <div className="px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="mt-3 inline-block text-sm text-link hover:underline">
        Back to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Auth screens: full page, no sidebar */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

      {/* Everything else lives inside the 3-column shell */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<Profile />} />
        {COMING_SOON.map((name) => (
          <Route key={name} path={`/${name}`} element={<ComingSoon title={name[0].toUpperCase() + name.slice(1)} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth callback - outside shell */}
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

export default App;

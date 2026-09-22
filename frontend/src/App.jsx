import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Breadcrumb from './components/layout/Breadcrumb';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './pages/Signup';
import GuestRoute from './components/GuestRoute';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1">
        <Routes>
            <Route path="/" element={<Home />} />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="text-white p-8">Profile page (protected)</div>
              </ProtectedRoute>
            }
          />
            <Route path="/profile/:username" element={<Profile />} />
            <Route
                path="/profile/edit"
                element={
                    <ProtectedRoute>
                        <EditProfile />
                    </ProtectedRoute>
                }
            />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

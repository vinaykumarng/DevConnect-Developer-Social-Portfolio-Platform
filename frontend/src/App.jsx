import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Breadcrumb from './components/layout/Breadcrumb';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './pages/Signup';
import GuestRoute from './components/GuestRoute';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<div className="text-white p-8">Home</div>}
          />
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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Breadcrumb from './components/layout/Breadcrumb';

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
          {/* Explore, About, Login, Signup, Profile routes come as pages are built */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

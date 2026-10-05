// App.jsx — with BottomNav + WhatsApp + (removed) install button
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MoviesProvider } from './context/MoviesContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';                  // ⬅️ NEW
import Movies from './components/PopularMovies';
import Series from './pages/Series';
import Admin from './pages/Admin';
import Player from "./components/Player";
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import SeriesPlayer from './components/SeriesPlayer';
import TranslatorPage from './pages/TranslatorPage';
import NationPage from './pages/NationPage';
import CategoryPage from './pages/CategoryPage';
import './index.css';

function App() {
  return (
    <MoviesProvider>
      <div className="App flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Navbar />

        {/* Add bottom padding so content isn't hidden by BottomNav */}
        <main className="flex-grow pb-20 sm:pb-24">
          <Routes>
            <Route path="/" element={<Movies />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/translator" element={<TranslatorPage />} />
            <Route path="/nation" element={<NationPage />} />
            <Route path="/player/:id" element={<Player />} />
            <Route path="/series-player/:id" element={<SeriesPlayer />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Floating buttons */}
        <WhatsAppFloatingButton />

        <Footer />

        {/* Fixed bottom navigation — appears on EVERY page */}
        <BottomNav />
      </div>
    </MoviesProvider>
  );
}

/* ═══════════════════════════════════════════════════════════
   Protected Route for Admin (unchanged)
═══════════════════════════════════════════════════════════ */
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth');
    const authExpiry = localStorage.getItem('admin_auth_expiry');
    const storedAdminUser = localStorage.getItem('admin_user');

    if (adminAuth === 'true' && authExpiry) {
      const expiryTime = parseInt(authExpiry);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
        if (storedAdminUser) setAdminUser(JSON.parse(storedAdminUser));
      } else {
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_auth_expiry');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (username, password) => {
    const ADMIN_PASSWORD = 'santa';
    if (password === ADMIN_PASSWORD) {
      const userData = {
        username: username || 'VIP Administrator',
        loginTime: new Date().toISOString(),
        role: 'Super Admin',
        avatar: username ? username.charAt(0).toUpperCase() : 'A'
      };
      setAdminUser(userData);
      setShowWelcome(true);
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_auth_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      localStorage.setItem('admin_user', JSON.stringify(userData));
      setTimeout(() => {
        setIsAuthenticated(true);
        setShowWelcome(false);
      }, 3000);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_auth_expiry');
    localStorage.removeItem('admin_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading security check...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showWelcome ? <WelcomeScreen adminUser={adminUser} /> : <LoginScreen onLogin={handleLogin} />;
  }

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onLogout: handleLogout, adminUser });
    }
    return child;
  });

  return childrenWithProps;
}

/* ═══════════════════════════════════════════════════════════
   WelcomeScreen + LoginScreen (unchanged — keep your existing)
═══════════════════════════════════════════════════════════ */
function WelcomeScreen({ adminUser }) {
  // ... paste your existing WelcomeScreen code here (unchanged)
}
function LoginScreen({ onLogin }) {
  // ... paste your existing LoginScreen code here (unchanged)
}

export default App;
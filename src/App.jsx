// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MoviesProvider } from './context/MoviesContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
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

/* ═══════════════════════════════════════════════════════════
   ERROR BOUNDARY — catches runtime crashes so we see the error
═══════════════════════════════════════════════════════════ */
class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('❌ Admin crashed:', error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
          <div className="text-white text-center max-w-lg w-full bg-red-950/30 border border-red-800/50 rounded-2xl p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Admin page crashed</h1>
            <p className="text-gray-300 text-sm mb-4 break-words font-mono bg-black/40 p-3 rounded-lg">
              {this.state.error?.message || 'Unknown error'}
            </p>
            {this.state.errorInfo?.componentStack && (
              <details className="text-left mb-4">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                  Show stack trace
                </summary>
                <pre className="text-[10px] text-gray-500 mt-2 overflow-auto max-h-40 bg-black/60 p-2 rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium text-sm transition-colors"
              >
                Reload page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_auth');
                  localStorage.removeItem('admin_auth_expiry');
                  localStorage.removeItem('admin_user');
                  window.location.href = '/';
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium text-sm transition-colors"
              >
                Clear auth & go home
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Open DevTools (F12) → Console for full error details
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════ */
function App() {
  return (
    <MoviesProvider>
      <div className="App flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Navbar />

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

        <WhatsAppFloatingButton />
        <Footer />
        <BottomNav />
      </div>
    </MoviesProvider>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROTECTED ROUTE for /admin
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
        if (storedAdminUser) {
          try {
            setAdminUser(JSON.parse(storedAdminUser));
          } catch (e) {
            console.warn('Failed to parse stored admin user:', e);
          }
        }
      } else {
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_auth_expiry');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (username, password) => {
    const ADMIN_PASSWORD = 'santa'; // ⚠️ change this
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
    return showWelcome
      ? <WelcomeScreen adminUser={adminUser} />
      : <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AdminErrorBoundary>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onLogout: handleLogout,
            adminUser: adminUser,
          });
        }
        return child;
      })}
    </AdminErrorBoundary>
  );
}

/* ═══════════════════════════════════════════════════════════
   WELCOME SCREEN
═══════════════════════════════════════════════════════════ */
function WelcomeScreen({ adminUser }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 p-8 md:p-12 max-w-lg mx-auto transform animate-fade-in-up">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500 rounded-full blur-md animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center border-4 border-emerald-400/50 shadow-2xl">
              <span className="text-4xl font-bold text-white">{adminUser?.avatar || 'A'}</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="inline-block bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500 text-transparent bg-clip-text">
              <h1 className="text-4xl md:text-5xl font-bold">Welcome Back!</h1>
            </div>
            <div className="space-y-2">
              <p className="text-2xl md:text-3xl font-semibold text-white">
                {adminUser?.username}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 rounded-full border border-emerald-500/30">
                  <span className="text-emerald-300 text-sm font-medium">{adminUser?.role}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Accessing Dashboard</span>
              <span>{progress}%</span>
            </div>
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VIP LOGIN SCREEN
═══════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const isValid = onLogin(username || 'VIP Admin', password);
      if (!isValid) {
        setError('Invalid credentials. Access denied.');
        setPassword('');
        const form = document.getElementById('vip-login-form');
        if (form) {
          form.classList.add('animate-shake');
          setTimeout(() => form.classList.remove('animate-shake'), 500);
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500 rounded-full blur-sm animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-full p-1">
              <div className="bg-gradient-to-br from-amber-500 via-emerald-600 to-teal-600 rounded-full p-3 shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500 text-transparent bg-clip-text">
              <h1 className="text-3xl md:text-4xl font-bold mb-1">VIP ACCESS</h1>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px w-6 bg-gradient-to-r from-transparent to-amber-500"></div>
              <span className="text-amber-500 text-xs md:text-sm font-semibold tracking-widest uppercase">Admin Portal</span>
              <div className="h-px w-6 bg-gradient-to-l from-transparent to-amber-500"></div>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Enter your VIP credentials to access the dashboard</p>
          </div>

          <form id="vip-login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  VIP Username
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="relative w-full p-3 bg-gray-800/80 border border-emerald-500/30 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-white placeholder-gray-500 text-sm"
                  placeholder="Enter your VIP username"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  VIP Password
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative w-full p-3 bg-gray-800/80 border border-emerald-500/30 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-white placeholder-gray-500 text-sm pr-12"
                  placeholder="Enter your VIP password"
                  required
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="relative w-full group mt-4"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg font-semibold text-black transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating VIP...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Access VIP Dashboard</span>
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>VIP Access Only • 24/7 Security Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default App;
import { useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { getMe, logout } from './services/auth';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// pages
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import UserDashboard from './pages/UserDashboard/UserDashboard';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

function App() {
  const location = useLocation();
  const [user, setUser] = useState<User>(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = (userData: { id: string; name: string; email: string; role: string }) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // try to refresh user from backend
    getMe()
      .then((data) => {
        const u = data.user || data;
        if (u) {
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        }
      })
      .catch((err) => {
        // Do NOT clear session on getMe failure (cross-origin cookie issues in production)
        // Keep the localStorage user so the session persists on refresh
        console.warn('getMe failed, keeping local session:', err?.response?.status);
      });
  }, []);

  // Re-check localStorage when location changes (for when Login updates it)
  useEffect(() => {
    if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
      try {
        const u = localStorage.getItem('user');
        if (u) {
          setUser(JSON.parse(u));
        }
      } catch (e) {
        console.error('Error reading user from localStorage:', e);
      }
    }
  }, [location, user]);

  const ProtectedRoute = ({ children }: PropsWithChildren) => {
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
  };

  // If not logged in, show login or register
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/user" />
            )}
          </ProtectedRoute>
        }
      />

      {/* User Dashboard */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            {user?.role === 'user' ? (
              <UserDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/admin" />
            )}
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/user'} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

    </Routes>
  )
}

export default App

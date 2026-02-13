import { useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { getMe } from './services/auth';
import { Routes, Route, Navigate } from 'react-router-dom';
// pages
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

function App() {
  const [user, setUser] = useState<User>(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });

  // const handleLoginSuccess = (userData: { id: string; name: string; email: string; role: string }) => {
  //   setUser(userData);
  // };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
        console.error('Failed to refresh user:', err);
        // clear invalid session
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  }, []);

  const ProtectedRoute = ({ children }: PropsWithChildren) => {
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
  };

  // If not logged in, show login or register
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
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

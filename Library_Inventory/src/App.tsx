import { useState } from 'react'
import { useEffect } from 'react'
import { getMe } from './services/auth'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login')
  const [user, setUser] = useState<User>(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })

  const handleLoginSuccess = (userData: { id: string; name: string; email: string; role: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
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

  // If user is logged in, show dashboard
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    } else {
      return <UserDashboard user={user} onLogout={handleLogout} />;
    }
  }

  // If not logged in, show login or register
  return (
    <>
      {currentPage === 'login' ? (
        <Login 
          onNavigateToRegister={() => setCurrentPage('register')} 
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <Register onNavigateToLogin={() => setCurrentPage('login')} />
      )}
    </>
  )
}

export default App

import { useState } from 'react';
import { login } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

// interface LoginProps {
//   onNavigateToRegister: () => void;
//   onLoginSuccess: (user: { id: string; name: string; email: string; role: string }) => void;
// }

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await login(email, password);
      const user = data.user || data;

      if (user && (user.token || user.id)) {
        if (user.token) localStorage.setItem('token', user.token);
        localStorage.setItem('user', JSON.stringify(user));

        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          if (user.role === 'admin') navigate('/admin');
          else navigate('/user');
        }, 500);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}

      <p>
        Don't have an account?{' '}
        <button onClick={() => navigate('/register')}>Register</button>
      </p>
    </div>
  );
}

export default Login;
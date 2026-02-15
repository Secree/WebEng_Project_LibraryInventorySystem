import { useState } from 'react';
import { login } from '../services/auth';

interface LoginProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (user: { id: string; name: string; email: string; role: string }) => void;
}

function Login({ onNavigateToRegister, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!email || !password) {
      setMessage('Please enter both email and password');
      return;
    }
    if(email.trim() === "") {
      setMessage('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setMessage('Invalid email address');
      return;
    }
    
    try {
      const data = await login(email, password);
      // backend returns { message, user } - token is now in httpOnly cookie
      const user = data.user || data;
      if (user && user.id) {
        // Token is automatically stored in httpOnly cookie by browser
        localStorage.setItem('user', JSON.stringify(user));
        setMessage('Login successful!');
        onLoginSuccess(user);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        // Backend validation error (401, 400, etc.)
        setMessage(error.response.data.message);
      } else if (error.response?.status === 500) {
        // Server error
        setMessage('Server error. Please try again later.');
      } else if (error.message === 'Network Error') {
        // Network error
        setMessage('Network error. Check your connection.');
      } else {
        // Unknown error
        setMessage('Error connecting to server');
      }
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
        <button onClick={onNavigateToRegister}>Register</button>
      </p>
    </div>
  );
}

export default Login;

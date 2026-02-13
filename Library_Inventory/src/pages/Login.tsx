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
    
    try {
      const data = await login(email, password);
      // backend returns { message, user } and user contains token
      const user = data.user || data;
      if (user && (user.token || user.id)) {
        if (user.token) localStorage.setItem('token', user.token);
        localStorage.setItem('user', JSON.stringify(user));
        setMessage('Login successful!');
        onLoginSuccess(user);
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
        <button onClick={onNavigateToRegister}>Register</button>
      </p>
    </div>
  );
}

export default Login;

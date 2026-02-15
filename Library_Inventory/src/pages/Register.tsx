import { useState } from 'react';
import { register as registerUser } from '../services/auth';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

function Register({ onNavigateToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = await registerUser(name, email, password, role);
      if (data && (data.user || data.id)) {
        setMessage('Registration successful! You can now login.');
        setTimeout(() => onNavigateToLogin(), 1500);
      } else {
        setMessage(data.message || 'Registration failed');
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
      console.error('Register error:', error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Already have an account?{' '}
        <button onClick={onNavigateToLogin}>Login</button>
      </p>
    </div>
  );
}

export default Register;

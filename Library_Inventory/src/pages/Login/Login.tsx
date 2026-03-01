import { useState } from 'react';
import { login } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import styles from './Login.module.css';
import logo from '../../assets/images/MAES-logo.png';

interface LoginProps {
  onLoginSuccess: (user: { id: string; name: string; email: string; role: string }) => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isErrorMessage, setIsErrorMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsErrorMessage(false);
    setMessage('');

    // Validation
    if (!email || !password) {
      setIsErrorMessage(true);
      setMessage('Please enter both email and password');
      return;
    }
    if (email.trim() === '') {
      setIsErrorMessage(true);
      setMessage('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setIsErrorMessage(true);
      setMessage('Invalid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('Signing in...');
      const data = await login(email, password);
      // Backend returns { message, user } - token is now in httpOnly cookie
      const user = data.user || data;

      if (user && user.id) {
        // Update App's state via callback
        onLoginSuccess(user);

        setIsErrorMessage(false);
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          if (user.role === 'admin') navigate('/admin');
          else navigate('/user');
        }, 500);
      } else {
        setIsErrorMessage(true);
        setMessage(data.message || 'Login failed');
      }
    } catch (error: any) {
      setIsErrorMessage(true);
      if (error.response?.data?.message) {
        // Backend validation error (401, 400, etc.)
        setMessage(error.response.data.message);
      } else if (error.response?.status === 500) {
        // Server error
        setMessage('Server error. Please try again later.');
      } else if (
        error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        String(error.message || '').toLowerCase().includes('request aborted') ||
        error.message === 'Network Error' ||
        String(error.message || '').toLowerCase().includes('timeout')
      ) {
        // Network error
        setMessage('Connection interrupted. Please try again in a few seconds.');
      } else {
        // Unknown error
        setMessage('Error connecting to server');
      }
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <img src={logo} alt="Logo" className={styles.logo} />

      <h3 className={styles.title}>Welcome</h3>
      <p className={styles.schoolName}>Macario Arnedo Elementary School</p>

      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.label}>Email:</label>
        <div className={styles.formGroup}>
          <input
            type="email"
            value={email}
            placeholder='YourEmail@example.com'
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        
        <label className={styles.label}>Password:</label>
        <div className={styles.formGroup}>
          <input
            type="password"
            value={password}
            placeholder='Enter your password'
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <label className={styles.forgotPS}>Forgot password?</label>
        
        <button type="submit" className={styles.button}>
          <b>{isSubmitting ? 'Signing In...' : 'Sign In'}</b>
        </button>
      </form>

      {message && (
        <p className={isErrorMessage ? styles.errorMessage : styles.statusMessage}>{message}</p>
      )}

      <p className={styles.register}>
        Don't have an account? <NavLink to="/register" className={styles.registerLink}>Register</NavLink>
      </p>
    </div>
  );
}

export default Login;
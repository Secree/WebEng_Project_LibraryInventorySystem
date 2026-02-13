import { useState } from 'react';
import { login } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import styles from './Login.module.css';
import logo from '../../assets/images/MAES-logo.png';

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
    <div className={styles.container}>
      <img src={logo} alt="Logo" className={styles.logo} />

      <h3 className={styles.title}>Welcome</h3>
      <p className={styles.schoolName}>Macario Arnedo Elementary School</p>

      <form onSubmit={handleSubmit}>
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
          <b>Sign In</b>
        </button>
      </form>

      {message && <p>{message}</p>}

      <p className={styles.register}>
        Don't have an account? <NavLink to="/register" className={styles.registerLink}>Register</NavLink>
      </p>
    </div>
  );
}

export default Login;
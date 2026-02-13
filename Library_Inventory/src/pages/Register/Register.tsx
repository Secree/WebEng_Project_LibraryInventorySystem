import { useState } from 'react';
import { register as registerUser } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import styles from './Register.module.css';
import logo from '../../assets/images/MAES-logo.png';

// interface RegisterProps {
//   onNavigateToLogin: () => void;
// }

function Register() {
  const navigate = useNavigate();
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
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
      console.error('Register error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <img src={logo} alt="Logo" className={styles.logo} />

      <h3 className={styles.title}>Create Account</h3>
      <p className={styles.schoolName}>Macario Arnedo Elementary School</p>

      <form onSubmit={handleSubmit}>
        <label className={styles.label}>Full Name:</label>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={name}
            placeholder='Juan Crisostomo Dela Cruz'
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </div>

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
            placeholder='Create your password'
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <label className={styles.label}>Confirm Password:</label>
        <div className={styles.formGroup}>
          <input
            type="password"
            value={password}
            placeholder='Confirm your password'
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <label className={styles.label}>Role:</label>
        <div>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className={styles.button}>
          <b>Register</b>
        </button>
      </form>

      {message && <p>{message}</p>}

      <p className={styles.login}>
        Already have an account? <NavLink to="/login" className={styles.loginLink}>Login</NavLink>
      </p>
    </div>
  );
}

export default Register;

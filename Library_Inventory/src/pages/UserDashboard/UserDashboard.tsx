import Inventory from '../Inventory/Inventory';
import MyReservations from './MyReservations';
import styles from './UserDashboard.module.css';
import logo from '../../assets/images/MAES-logo.png';
import { useState } from 'react';

interface UserDashboardProps {
  user: { id: string; name: string; email: string; role: string };
  onLogout: () => void;
}

function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'inventory' | 'reservations'>('inventory');

  const handleLogout = () => {
    setSidebarOpen(false);
    onLogout();
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.headerLogo}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <div className={styles.headerName}>
            <h2>Macario Arnedo Elementary</h2>
            <p>Welcome, {user.name} to Resource Inventory</p>
          </div>
        </div>
        <div className={styles.sideBar}>
          <button onClick={onLogout} className={styles.logoutBTN}>
            Logout
          </button>          
        </div>
        <button
          className={styles.menuToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div className={`${styles.mobileSidebar} ${sidebarOpen ? styles.open : ''}`}>
          <button onClick={handleLogout} className={styles.logoutBTN}>
            Logout
          </button>
        </div>
      </div>
      <div className={styles.viewTabs}>
        <button
          type="button"
          className={`${styles.viewTabButton} ${activeView === 'inventory' ? styles.viewTabButtonActive : ''}`}
          onClick={() => setActiveView('inventory')}
        >
          Inventory
        </button>
        <button
          type="button"
          className={`${styles.viewTabButton} ${activeView === 'reservations' ? styles.viewTabButtonActive : ''}`}
          onClick={() => setActiveView('reservations')}
        >
          My Reservations
        </button>
      </div>
      <div className={styles.body}>
        {activeView === 'inventory' ? <Inventory userRole="user" /> : <MyReservations />}
      </div>
    </div>
  );
}

export default UserDashboard;

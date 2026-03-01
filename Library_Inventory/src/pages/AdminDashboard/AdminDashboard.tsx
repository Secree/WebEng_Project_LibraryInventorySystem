import { useState, useEffect } from 'react';
import Inventory from '../Inventory/Inventory';
import styles from './AdminDashboard.module.css';
import logo from '../../assets/images/MAES-logo.png';
import { getAllUsers as fetchAllUsers, deleteUser as deleteUserApi } from '../../services/api';

interface AdminDashboardProps {
  user: { id: string; name: string; email: string; role: string };
  onLogout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'users'>('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers(user.id);
      setUsers(data.users);
      setMessage('');
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Error connecting to server');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteUserApi(user.id, targetUserId);
      setMessage('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Error connecting to server');
      console.error('Delete user error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleInventoryManagement = () => {
    setSidebarOpen(false)
    setActiveTab('inventory')
  };

  const handleUserManegement = () => {
    setSidebarOpen(false);
    setActiveTab('users');
  };

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
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`${styles.inventoryManagement} ${activeTab === 'inventory' ? styles.active : ''}`}
          >
            Inventory Management
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`${styles.userManagement} ${activeTab === 'users' ? styles.active : ''}`}
          >
            User Management
          </button>
          <button onClick={onLogout} className={styles.logoutBTN}>
            Logout
          </button>
        </div>

        <button 
          className={styles.menuToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <div className={`${styles.mobileSidebar} ${sidebarOpen ? styles.open : ''}`}>
          <button 
            onClick={handleInventoryManagement} 
            className={`${styles.inventoryManagement} ${activeTab === 'inventory' ? styles.active : ''}`}
          >
            Inventory Management
          </button>
          <button 
            onClick={handleUserManegement} 
            className={`${styles.userManagement} ${activeTab === 'users' ? styles.active : ''}`}
          >
            User Management
          </button>
          <button onClick={handleLogout} className={styles.logoutBTN}>
            Logout
          </button>
        </div>
      </div>
      <div className={styles.body}>
        {activeTab === 'inventory' ? (
          <Inventory userRole="admin" />
        ) : (
          <div className={styles.userManagementContainer}>
            <div className={styles.userManagementTable}>
              <div className={styles.userTitle}>
                <h2>User Management</h2>
                <button onClick={fetchUsers} disabled={loading} className={styles.refreshBTN}>
                  {loading ? 'Loading...' : 'Refresh Users'}
                </button>
              </div>
              {message && (
                <p style={{ 
                  padding: '10px', 
                  background: message.includes('success') ? '#d4edda' : '#f8d7da',
                  color: message.includes('success') ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  {message}
                </p>
              )}
              {users.length > 0 ? (
                <table className={styles.responsiveTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td data-label="ID">{u.id}</td>
                        <td data-label="Name">{u.name}</td>
                        <td data-label="Email">{u.email}</td>
                        <td data-label="Role">
                          <span className={styles.roleSpan} style={{
                            background: u.role === 'admin' ? '#e3f2fd' : '#f3e5f5',
                            color: u.role === 'admin' ? '#1565c0' : '#7b1fa2',
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td data-label="Actions">
                          {u.id !== user.id && (
                            <button 
                              onClick={() => deleteUser(u.id)}
                              className={styles.deleteBtn}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
                  No users found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

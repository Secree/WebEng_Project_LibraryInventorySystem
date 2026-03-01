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
        <div>
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
      </div>
      <div className={styles.body}>
        {activeTab === 'inventory' ? (
          <Inventory userRole="admin" />
        ) : (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h2>User Management</h2>
            <button 
              onClick={fetchUsers} 
              disabled={loading}
              // style={{
              //   padding: '8px 16px',
              //   background: '#3498db',
              //   color: 'white',
              //   border: 'none',
              //   borderRadius: '4px',
              //   cursor: loading ? 'not-allowed' : 'pointer',
              //   marginBottom: '15px'
              // }}
            >
              {loading ? 'Loading...' : 'Refresh Users'}
            </button>
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
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{u.id}</td>
                      <td style={{ padding: '12px' }}>{u.name}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          background: u.role === 'admin' ? '#e3f2fd' : '#f3e5f5',
                          color: u.role === 'admin' ? '#1565c0' : '#7b1fa2',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {u.id !== user.id && (
                          <button 
                            onClick={() => deleteUser(u.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
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
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

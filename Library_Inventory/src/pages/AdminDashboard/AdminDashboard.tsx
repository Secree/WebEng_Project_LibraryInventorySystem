import { useState, useEffect } from 'react';
import Inventory from '../Inventory/Inventory';
import styles from './AdminDashboard.module.css';
import logo from '../../assets/images/MAES-logo.png'

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
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setMessage('');
      } else {
        setMessage(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      setMessage('Error connecting to server');
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
      const response = await fetch('http://localhost:3000/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, targetUserId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('User deleted successfully');
        fetchUsers(); // Refresh list
      } else {
        setMessage(data.message || 'Failed to delete user');
      }
    } catch (error) {
      setMessage('Error connecting to server');
      console.error('Delete user error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const tabStyle = (tab: 'inventory' | 'users') => ({
    padding: '12px 24px',
    background: activeTab === tab ? '#3498db' : '#ecf0f1',
    color: activeTab === tab ? 'white' : '#2c3e50',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    borderRadius: '6px 6px 0 0',
  });

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
          <button onClick={() => setActiveTab('inventory')} style={tabStyle('inventory')}>
            📚 Inventory Management
          </button>
          <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>
            👥 User Management
          </button>
          <button onClick={onLogout} className={styles.logoutBTN}>
            Logout
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <Inventory userRole="admin" />
      ) : (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <h2>User Management</h2>
          <button 
            onClick={fetchUsers} 
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
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
  );
}

export default AdminDashboard;

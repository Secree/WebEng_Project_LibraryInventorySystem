import { useState, useEffect } from 'react';

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
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name} (Admin)</p>
      <button onClick={onLogout}>Logout</button>
      <hr />
      <h2>All Users</h2>
      <button onClick={fetchUsers} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Users'}
      </button>
      {message && <p>{message}</p>}
      {users.length > 0 ? (
        <table border={1}>
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
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.id !== user.id && (
                    <button onClick={() => deleteUser(u.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found</p>
      )}
    </div>
  );
}

export default AdminDashboard;

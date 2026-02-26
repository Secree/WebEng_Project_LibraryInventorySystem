import Inventory from './Inventory/Inventory';

interface UserDashboardProps {
  user: { id: string; name: string; email: string; role: string };
  onLogout: () => void;
}

function UserDashboard({ user, onLogout }: UserDashboardProps) {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>User Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {user.name}!</p>
        </div>
        <button 
          onClick={onLogout}
          style={{
            padding: '10px 20px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>
      
      <Inventory userRole="user" />
    </div>
  );
}

export default UserDashboard;

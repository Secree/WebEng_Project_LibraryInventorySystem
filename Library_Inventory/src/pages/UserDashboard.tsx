interface UserDashboardProps {
  user: { id: string; name: string; email: string; role: string };
  onLogout: () => void;
}

function UserDashboard({ user, onLogout }: UserDashboardProps) {
  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={onLogout}>Logout</button>
      <hr />
      <h2>Your Library</h2>
      <p>This is where user-specific content will go...</p>
    </div>
  );
}

export default UserDashboard;

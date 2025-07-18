import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ username, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login'); // 登出后跳转到登录页
  };

  return (
    <div>
      <h2>Welcome, {username}!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
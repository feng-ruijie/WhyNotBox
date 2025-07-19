import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // ✅ 添加 state

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // ✅ 设置 user
    } else {
      navigate('/login'); // 如果没有用户信息，跳转回登录页
    }
  }, [navigate]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div>
      <h2>Welcome, {user?.username}!</h2>
      <button onClick={handleLogout}>Logout</button>
      {user?.isAdmin ? (
        <p>您是管理员，拥有最高权限。</p>
      ) : (
        <p>您是普通用户。</p>
      )}
    </div>
  );
};

export default Dashboard;
//使用node server.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './DashBoard';
import Register from './Register'; // 引入注册页面
import './App.css';

const App = () => {
  // 从 localStorage 中读取用户对象
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // 存储完整用户对象
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); // 移除用户对象
  };
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* 页面内容 */}
        <main className="container mx-auto p-6">
          <Routes>

            {/*<Route
              path="/login"
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard username={username} onLogout={handleLogout} /> : <Navigate to="/login" />}
            />*/}

            <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
            />
            <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
            />

            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
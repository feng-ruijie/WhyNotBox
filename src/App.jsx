//使用node server.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './DashBoard';
import Register from './Register'; // 引入注册页面
import './App.css';

const App = () => {
  const [username, setUsername] = useState(null);

  const handleLogin = (user) => {
    setUsername(user);
  };

  const handleLogout = () => {
    setUsername(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* 页面内容 */}
        <main className="container mx-auto p-6">
          <Routes>
            <Route
              path="/login"
              element={!username ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/dashboard"
              element={username ? <Dashboard username={username} onLogout={handleLogout} /> : <Navigate to="/login" />}
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
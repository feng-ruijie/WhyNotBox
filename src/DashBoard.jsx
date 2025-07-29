// DashBoard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import loginBackground from './assets/LoginBackGround.png';
import Card from './components/Card'; // 引入组件
import TopNavigation from './components/TopNavigation'; // 引入新组件
import './index.css';
const DashBoard = ({ user, onLogout }) => {
  const navigate = useNavigate();


  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout(); // ✅ 调用父组件传入的onLogout
    } else {
      navigate('/login'); // ✅ 降级处理
    }
  };
  {/*背景图区域 */}
  return (
    <div 
  className="h-[100dvh] w-[140dvh] flex flex-col bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${loginBackground})` }}
>
  {/* 顶部卡片区域 */}
  <TopNavigation />

  {/* 中间欢迎信息（重点调整部分） */}
  <div className="flex-1 container mx-auto px-6 flex items-center">
    <div className="w-full">
      <h1 className="text-3xl font-bold text-purple">欢迎回来，{user.username}！☺️</h1>
      <p className="text-black mt-2">这里是盒乐不为📦️</p>
    </div>
  </div>

  {/* 底部退出按钮 */}
  <div className="container mx-auto px-6 pb-10">
    <button className="red-button" onClick={handleLogoutClick}>退出登录</button>
  </div>
</div>
  );
};

export default DashBoard;
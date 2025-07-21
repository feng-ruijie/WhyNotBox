// DashBoard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import loginBackground from './assets/LoginBackGround.png';
import Card from './components/Card'; // 引入组件
import './index.css';
const DashBoard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleBlindBoxClick = () => navigate('/blindbox/list');
  const handleOrderClick = () => navigate('/order/list');
  const handleActivityClick = () => navigate('/activity/list');
  const handleCommunityClick = () => navigate('/community'); 

  const handleProfileClick = () => navigate('/profile'); // 个人中心路径为 profile

  return (
    <div 
  className="h-[100dvh] w-[140dvh] flex flex-col bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${loginBackground})` }}
>
  {/* 顶部卡片区域 */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
  <Card title="盲盒列表" onClick={handleBlindBoxClick} />
  <Card title="订单管理" onClick={handleOrderClick} />
  <Card title="活动管理" onClick={handleActivityClick} />
  <Card title="玩家秀" onClick={handleCommunityClick} />
  <Card title="个人中心" onClick={handleProfileClick} /> {/* 新增卡片 */}
</div>

  {/* 中间欢迎信息（重点调整部分） */}
  <div className="flex-1 container mx-auto px-6 flex items-center">
    <div className="w-full">
      <h1 className="text-3xl font-bold text-purple">欢迎回来，{user.username}！☺️</h1>
      <p className="text-black mt-2">这里是盒乐不为📦️</p>
    </div>
  </div>

  {/* 底部退出按钮 */}
  <div className="container mx-auto px-6 pb-10">
    <button className="red-button">退出登录</button>
  </div>
</div>
  );
};

export default DashBoard;
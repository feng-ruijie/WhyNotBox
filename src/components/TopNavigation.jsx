import React from 'react';
import './TopNavigation.css';
import { useNavigate } from 'react-router-dom';

const TopNavigation = () => {
  const navigate = useNavigate();

  const buttons = [
    { title: '盲盒列表', path: '/blindbox' },
    { title: '订单管理', path: '/order' },
    { title: '活动管理', path: '/activity' },
    { title: '玩家秀', path: '/community' },
    { title: '个人中心', path: '/profile' }
  ];

  return (
    <div className="top-nav">
      {buttons.map((btn, index) => (
        <button 
          key={index} 
          className="nav-button"
          onClick={() => navigate(btn.path)}
        >
          {btn.title}
        </button>
      ))}
    </div>
  );
};

export default TopNavigation;
import React from 'react';
import './Card.css'; // 直接引入基础样式

const Card = ({ title, children, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <h2>{title}</h2>
      {children && <div>{children}</div>}
    </div>
  );
};

export default Card;
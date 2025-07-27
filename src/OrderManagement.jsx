// src/OrderManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from './components/TopNavigation';
import loginBackground from './assets/LoginBackGround.png';

// 将 WheelComponent 移出主组件，避免重新创建
const WheelComponent = ({ currentOrder, spinning, prize, rotation, onClose }) => {
  const wheelRef = useRef(null);
  
  // 如果没有当前订单，不渲染
  if (!currentOrder) return null;
  
  // 获取盲盒物品列表
  const items = currentOrder.blindBox?.items || [];
  
  // 如果没有物品，显示错误信息
  if (items.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-4">错误</h3>
          <p>该盲盒没有任何物品</p>
          <button 
            onClick={onClose}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }
  
  // 创建转盘扇形（基于概率）
  const renderWheelSegments = () => {
    let startAngle = 0;
    
    return items.map((item, index) => {
      // 根据概率计算扇形角度
      const angle = (parseFloat(item.probability) || 0) * 3.6; // 100% = 360度
      const endAngle = startAngle + angle;
      
      // 计算扇形的路径
      const largeArcFlag = angle > 180 ? 1 : 0;
      const startX = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
      const startY = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
      const endX = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
      const endY = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
      
      const pathData = [
        `M 50 50`,
        `L ${startX} ${startY}`,
        `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ');
      
      // 计算文字位置（在扇形中间）
      const textAngle = startAngle + angle / 2;
      const textX = 50 + 30 * Math.cos((textAngle - 90) * Math.PI / 180);
      const textY = 50 + 30 * Math.sin((textAngle - 90) * Math.PI / 180);
      
      // 为每个扇形生成不同颜色
      const hue = (index * 360) / items.length;
      const color = `hsl(${hue}, 80%, 60%)`;
      
      const segment = (
        <g key={index}>
          <path
            d={pathData}
            fill={color}
            stroke="#fff"
            strokeWidth="1"
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize="8"
            fontWeight="bold"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          >
            {item.name.length > 6 ? item.name.substring(0, 6) + '...' : item.name}
          </text>
        </g>
      );
      
      startAngle = endAngle;
      return segment;
    });
  };
  
  // 指针组件
  const Pointer = () => (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
      <svg width="30" height="30" viewBox="0 0 30 30">
        <polygon points="15,0 10,15 20,15" fill="#ef4444" />
      </svg>
    </div>
  );
  
  // 当开始旋转时添加动画类
  useEffect(() => {
    if (spinning && wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      wheelRef.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [spinning, rotation]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-center mb-4">抽取盲盒</h3>
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Pointer />
            <div 
              ref={wheelRef}
              className="relative"
              style={{
                transform: 'rotate(0deg)',
                transition: 'none'
              }}
            >
              <svg width="250" height="250" viewBox="0 0 100 100" className="rounded-full shadow-lg">
                {renderWheelSegments()}
                {/* 中心圆 */}
                <circle cx="50" cy="50" r="8" fill="#fff" />
              </svg>
            </div>
          </div>
        </div>
        
        {spinning ? (
          <p className="text-center text-lg font-semibold text-blue-600">正在抽取中...</p>
        ) : prize ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2 text-green-600">恭喜你!</p>
            <div className="flex items-center justify-center mb-4 p-4 bg-gray-50 rounded-lg">
              {prize.image ? (
                <img 
                  src={`http://localhost:5000${prize.image}`} 
                  alt={prize.name}
                  className="w-16 h-16 object-cover rounded mr-3"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-3" />
              )}
              <div>
                <p className="font-bold text-lg">{prize.name}</p>
                <p className="text-gray-600">概率: {prize.probability}%</p>
              </div>
            </div>
            <p className="text-gray-700">获得了 {currentOrder.blindBox?.name} 中的物品!</p>
          </div>
        ) : (
          <p className="text-center text-lg font-semibold text-gray-600">准备开始抽取...</p>
        )}
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWheel, setShowWheel] = useState(false); // 是否显示转盘
  const [spinning, setSpinning] = useState(false); // 转盘是否在旋转
  const [currentOrder, setCurrentOrder] = useState(null); // 当前抽取的订单
  const [prize, setPrize] = useState(null); // 抽取到的奖品
  const [rotation, setRotation] = useState(0); // 旋转角度
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userData);
      const response = await fetch(`http://localhost:5000/api/orders/${user.username}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusText = (isOpened, isRefunded) => {
    if (isRefunded) return '已退款';
    if (isOpened) return '已抽取';
    return '待处理';
  };

  const getStatusClass = (isOpened, isRefunded) => {
    if (isRefunded) return 'bg-gray-100 text-gray-800';
    if (isOpened) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // 抽取盲盒
  const handleOpenBox = async (orderId) => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const order = orders.find(o => o.id === orderId);
    
    try {
      setCurrentOrder(order);
      setShowWheel(true);
      setRotation(0); // 重置旋转角度
      setPrize(null); // 清空之前的奖品
      
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 设置奖品
        setPrize(data.item);
        
        // 计算旋转角度
        const items = order.blindBox?.items || [];
        const prizeIndex = items.findIndex(item => item.id === data.item.id);
        if (prizeIndex !== -1) {
          let prizePosition = 0;
          // 计算当前奖品之前所有扇形的角度总和
          for (let i = 0; i < prizeIndex; i++) {
            prizePosition += (parseFloat(items[i].probability) || 0) * 3.6;
          }
          // 加上当前奖品扇形的一半，得到奖品扇形的中心角度
          prizePosition += (parseFloat(data.item.probability) || 0) * 1.8;
          
          // 计算总旋转角度：5圈（1800度）+ 偏移（360度 - 奖品中心角度）
          const rotation = 1800 + (360 - prizePosition);
          setRotation(rotation);
        }
        
        // 延迟100ms后开始旋转，确保DOM已更新
        setTimeout(() => {
          setSpinning(true);
        }, 100);
        
        // 4秒后停止转盘并显示结果
        setTimeout(() => {
          setSpinning(false);
          
          // 再过2秒关闭转盘并显示结果
          setTimeout(() => {
            setShowWheel(false);
            alert(`抽取成功！获得物品: ${data.item.name}`);
            // 更新订单状态
            fetchOrders();
          }, 2000);
        }, 4000);
      } else {
        setShowWheel(false);
        alert(data.error || '抽取失败');
      }
    } catch (error) {
      console.error('抽取失败:', error);
      setShowWheel(false);
      alert('抽取失败，请重试');
    }
  };

  // 退款订单
  const handleRefund = async (orderId) => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    
    if (!window.confirm('确定要退款吗？退款后将无法抽取盲盒。')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('退款成功！');
        // 更新用户余额
        const updatedUser = { ...user, balance: data.newBalance };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // 更新订单状态
        fetchOrders();
      } else {
        alert(data.error || '退款失败');
      }
    } catch (error) {
      console.error('退款失败:', error);
      alert('退款失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-[100dvh] w-[140dvh] flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <TopNavigation />
      
      {/* 转盘动画遮罩层 */}
      {showWheel && (
        <WheelComponent 
          currentOrder={currentOrder}
          spinning={spinning}
          prize={prize}
          rotation={rotation}
          onClose={() => setShowWheel(false)}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">我的订单</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600">暂无订单记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="flex-shrink-0 mr-4">
                        {order.blindBox?.image ? (
                          <img 
                            src={`http://localhost:5000${order.blindBox.image}`} 
                            alt={order.blindBox.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {order.blindBox?.name || '盲盒商品'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          订单号: {order.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 md:ml-6">
                      <div>
                        <p className="text-xs text-gray-500">购买时间</p>
                        <p className="text-sm font-medium">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">价格</p>
                        <p className="text-sm font-medium text-green-600">¥{order.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">状态</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.is_opened, order.is_refunded)}`}>
                          {getStatusText(order.is_opened, order.is_refunded)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">用户名</p>
                        <p className="text-sm font-medium">{order.username}</p>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      {!order.is_opened && !order.is_refunded && (
                        <>
                          <button
                            onClick={() => handleOpenBox(order.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            抽取
                          </button>
                          <button
                            onClick={() => handleRefund(order.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            退款
                          </button>
                        </>
                      )}
                      {order.is_opened && (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed"
                        >
                          已抽取
                        </button>
                      )}
                      {order.is_refunded && (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed"
                        >
                          已退款
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* 显示已抽取的物品信息 */}
                  {order.is_opened && order.opened_item_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">获得的物品:</h4>
                      <div className="flex items-center">
                        {order.blindBox?.items?.find(item => item.id === order.opened_item_id)?.image ? (
                          <img 
                            src={`http://localhost:5000${order.blindBox.items.find(item => item.id === order.opened_item_id).image}`} 
                            alt={order.blindBox.items.find(item => item.id === order.opened_item_id).name}
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                        )}
                        <div>
                          <p className="font-medium">
                            {order.blindBox?.items?.find(item => item.id === order.opened_item_id)?.name || '未知物品'}
                          </p>
                          {order.blindBox?.items?.find(item => item.id === order.opened_item_id)?.probability && (
                            <p className="text-sm text-gray-500">
                              概率: {order.blindBox.items.find(item => item.id === order.opened_item_id).probability}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
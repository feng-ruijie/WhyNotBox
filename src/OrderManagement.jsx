// src/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from './components/TopNavigation';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`抽取成功！获得物品: ${data.item.name}`);
        // 更新订单状态
        fetchOrders();
      } else {
        alert(data.error || '抽取失败');
      }
    } catch (error) {
      console.error('抽取失败:', error);
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
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
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
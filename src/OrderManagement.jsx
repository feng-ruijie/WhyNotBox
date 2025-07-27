// src/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import TopNavigation from './components/TopNavigation';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchOrders(parsedUser.username);
    }
  }, []);

  const fetchOrders = async (username) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${username}`);
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
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getStatusText = (isOpened, isRefunded) => {
    if (isRefunded) return '已退款';
    if (isOpened) return '已开启';
    return '未开启';
  };

  const getStatusClass = (isOpened, isRefunded) => {
    if (isRefunded) return 'bg-red-100 text-red-800';
    if (isOpened) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">我的订单</h1>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
// src/BlindBoxDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BlindBoxDetail = () => {
  const { id } = useParams(); // 获取 URL 中的盲盒 ID
  const navigate = useNavigate();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查用户是否为管理员
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsAdmin(!!parsedUser.isAdmin);
      } catch (e) {
        console.error('解析用户信息失败');
      }
    }
  }, []);

  // 获取盲盒详情
  useEffect(() => {
    const fetchBlindBox = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/blindbox/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('无法获取盲盒详情');
        }

        const data = await response.json();
        setBox(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlindBox();
  }, [id]);

  // 删除盲盒
  const handleDelete = async () => {
    if (!window.confirm('确定要删除这个盲盒吗？')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/blindbox/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        navigate('/blindbox');
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 编辑跳转
  const handleEdit = () => {
    navigate(`/add-blindbox`, { state: { editMode: true, box } });
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-12">错误: {error}</div>;
  }

  if (!box) {
    return <div className="text-center py-12">未找到该盲盒</div>;
  }

  const imageUrl = box.image
    ? `http://localhost:5000${box.image}`
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={imageUrl}
            alt={box.name}
            className="w-full h-64 object-cover"
          />
          {box.isRecommended && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              推荐
            </span>
          )}
          {box.isNew && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              新品
            </span>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{box.name}</h1>
          <p className="text-gray-700 mb-2">{box.description || '暂无描述'}</p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-blue-600 font-bold">¥{box.price}</span>
            <span className="text-gray-500 text-sm">剩余: {box.remaining} 个</span>
          </div>

          <h2 className="font-semibold mt-6 mb-2">包含物品</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {box.items && box.items.length > 0 ? (
              box.items.map((item, index) => {
                const probability = parseFloat(item.probability);
                let badgeColor = 'bg-gray-300';
                if (probability > 50) {
                  badgeColor = 'bg-green-500';
                } else if (probability < 20) {
                  badgeColor = 'bg-red-500';
                } else {
                  badgeColor = 'bg-yellow-500';
                }

                const itemImageUrl = item.image
                  ? `http://localhost:5000${item.image}`
                  : 'https://via.placeholder.com/100x100?text=No+Image';

                return (
                  <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <img
                        src={itemImageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <span className={`text-xs text-white px-2 py-1 rounded ${badgeColor}`}>
                          概率: {probability}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">该盲盒暂无物品</p>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              返回
            </button>

            {isAdmin && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  编辑
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlindBoxDetail;
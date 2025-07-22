// BlindBoxList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import loginBackground from './assets/LoginBackGround.png';
import BlindBoxCard from './components/BlindBoxCard';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import TopNavigation from './components/TopNavigation';

const ITEMS_PER_PAGE = 4; // 每页显示4个盲盒

const BlindBoxList = () => {
  // 状态定义
  const [boxes, setBoxes] = useState([]); // 当前页数据
  const [allBoxes, setAllBoxes] = useState([]); // 所有数据
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    sort: 'newest'
  });
  const [newBox, setNewBox] = useState({
    name: '',
    price: '',
    remaining: '',
    description: '',
    image: ''
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false); // 管理员权限状态

  // 获取盲盒数据
  const fetchBoxes = useCallback(async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/blindbox`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('网络响应失败');

      const data = await response.json();
      
      // 保存全部数据
      setAllBoxes(data || []);
      
      // 根据当前页码和每页数量切分数据
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginatedData = data.slice(start, end);
      
      setBoxes(paginatedData);
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE) || 1);
    } catch (error) {
      console.error('加载失败:', error);
      setBoxes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // 检查用户权限
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsAdmin(!!parsedUser.isAdmin); // 假设角色字段为 role
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  // 当 filters 或 page 变化时，重新计算分页数据
  useEffect(() => {
    const filtered = allBoxes.filter(box => {
      // 示例筛选逻辑（可根据需要扩展）
      return true;
    });
    
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedData = filtered.slice(start, end);
    
    setBoxes(paginatedData);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1);
  }, [filters, page, allBoxes]);

  // 页面加载时获取数据
  useEffect(() => {
    fetchBoxes();
  }, [fetchBoxes]);

  // 创建新盲盒
  const handleCreateBox = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blindbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBox)
      });
      
      if (response.ok) {
        fetchBoxes(); // 刷新数据
        setNewBox({ 
          name: '', 
          price: '', 
          remaining: '', 
          description: '', 
          image: '' 
        });
      }
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  return (
    
    <div 
      className="h-[100dvh] w-[140dvh] flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      {/* 顶部导航 */}
      <TopNavigation />
      
      {/* 新增表单（仅管理员可见） */}
      {isAdmin && (
        <div className="mb-8 p-4 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4">新增盲盒</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input 
              value={newBox.name} 
              onChange={(e) => setNewBox({...newBox, name: e.target.value})}
              placeholder="名称"
              className="border p-2 rounded"
            />
            <input 
              type="number" 
              value={newBox.price} 
              onChange={(e) => setNewBox({...newBox, price: parseFloat(e.target.value)})}
              placeholder="价格"
              className="border p-2 rounded"
            />
            <input 
              type="number" 
              value={newBox.remaining} 
              onChange={(e) => setNewBox({...newBox, remaining: parseInt(e.target.value)})}
              placeholder="剩余量"
              className="border p-2 rounded"
            />
            <input 
              value={newBox.image} 
              onChange={(e) => setNewBox({...newBox, image: e.target.value})}
              placeholder="图片URL"
              className="border p-2 rounded"
            />
          </div>
          <button 
            onClick={handleCreateBox}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            创建盲盒
          </button>
        </div>
      )}

      {/* 筛选区 */}
      <Filters filters={filters} onChange={setFilters} />
      
      {/* 列表展示 */}
      {loading ? (
        <div className="flex justify-center py-12">加载中...</div>
      ) : boxes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">未找到符合条件的盲盒</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {boxes.map(box => (
            <BlindBoxCard 
              key={box.id} 
              box={box} 
              isAdmin={isAdmin} // 传递管理员权限
              onDelete={() => fetchBoxes()} 
            />
          ))}
        </div>
      )}
      
      {/* 分页组件 */}
      {!loading && totalPages > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </div>
      )}

      
    </div>
  );
};

export default BlindBoxList;
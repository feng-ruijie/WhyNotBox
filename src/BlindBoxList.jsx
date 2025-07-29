// BlindBoxList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import loginBackground from './assets/LoginBackGround.png';
import BlindBoxCard from './components/BlindBoxCard';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import TopNavigation from './components/TopNavigation';
import { Link } from 'react-router-dom'; // 新增导入
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
  const [searchTerm, setSearchTerm] = useState(''); // 添加搜索关键词状态
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

  // 当 filters、searchTerm 或 page 变化时，重新计算分页数据
  useEffect(() => {
    // 应用搜索、价格范围和排序筛选
    let filtered = [...allBoxes];
    
    // 搜索功能 - 根据盲盒名称匹配
    if (searchTerm) {
      filtered = filtered.filter(box => 
        box.name && box.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 价格范围筛选
    filtered = filtered.filter(box => {
      const price = parseFloat(box.price);
      return price >= parseFloat(filters.priceRange[0]) && price <= parseFloat(filters.priceRange[1]);
    });
    
    // 排序方式
    switch (filters.sort) {
      case 'price_asc':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'popularity':
        // 按剩余数量排序作为热门程度的近似
        filtered.sort((a, b) => parseInt(b.remaining) - parseInt(a.remaining));
        break;
      case 'newest':
      default:
        // 默认按ID排序（最新上架）
        filtered.sort((a, b) => b.id - a.id);
        break;
    }
    
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedData = filtered.slice(start, end);
    
    setBoxes(paginatedData);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1);
  }, [filters, searchTerm, page, allBoxes]);

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
    
    {isAdmin ? (
      <div className="mb-8 p-4 backdrop-blur-sm">
        <Link 
          to="/add-blindbox"
          className="bg-green-600 !!text-white px-4 py-2 rounded hover:bg-green-700 "
        >
          添加盲盒
        </Link>
      </div>
    ) : (
      // 为非管理员用户添加一些顶部间距
      <div className="mb-6"></div>
    )}
    
    {/* 筛选区 */}
    <div className="mb-6">
      {/* 搜索框 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索盲盒名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2 px-4 py-2 border border-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <Filters filters={filters} onChange={setFilters} />
    </div>
    
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
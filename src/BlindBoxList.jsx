// BlindBoxList.jsx
import React, { useState, useEffect } from 'react';
import loginBackground from './assets/LoginBackGround.png';
import BlindBoxCard from './components/BlindBoxCard';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import TopNavigation from './components/TopNavigation'; // 引入新组件
const BlindBoxList = () => {
  const [boxes, setBoxes] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    sort: 'newest'
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 获取盲盒数据
  useEffect(() => {
    const fetchBoxes = async () => {
      setLoading(true);
      // 模拟API请求
      setTimeout(() => {
        setBoxes(mockBlindBoxes);
        setTotalPages(10);
        setLoading(false);
      }, 800);
    };
    
    fetchBoxes();
  }, [filters, page]);

  return (
     <div 
  className="h-[100dvh] w-[140dvh] flex flex-col bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: `url(${loginBackground})` }}
>
  {/* 顶部卡片区域 */}
  <TopNavigation />
      {/* 筛选区 */}
      <Filters filters={filters} onChange={setFilters} />
      
      {/* 列表展示 */}
      {loading ? (
        <div className="flex justify-center py-12">加载中...</div>
      ) : boxes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">未找到符合条件的盲盒</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boxes.map(box => (
            <BlindBoxCard key={box.id} box={box} />
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

const mockBlindBoxes = [
  {
    id: 1,
    name: '限量潮玩盲盒 #001',
    category: '潮玩',
    price: 299.99,
    remaining: 58,
    isRecommended: true,
    isNew: true,
    image: 'https://picsum.photos/seed/box1/400/300'
  },
  // 可添加更多模拟数据
];

export default BlindBoxList;
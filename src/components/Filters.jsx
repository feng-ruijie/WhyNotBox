// components/Filters.jsx
import React from 'react';

const Filters = ({ filters, onChange }) => {
  const categories = ['全部', '潮玩', '美妆', '数码', '文具', '其他'];

  return (
    <div className="mb-8 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 分类筛选 */}
        <div>
          <label className="block text-gray-700 mb-2">分类</label>
          <select 
            value={filters.category}
            onChange={e => onChange({ ...filters, category: e.target.value })}
            className="w-full border-gray-300 rounded"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* 价格范围 */}
        <div>
          <label className="block text-gray-700 mb-2">价格区间</label>
          <div className="flex gap-2">
            <input 
              type="number"
              value={filters.priceRange[0]}
              onChange={e => onChange({
                ...filters,
                priceRange: [e.target.value, filters.priceRange[1]]
              })}
              className="flex-1 border-gray-300 rounded"
            />
            <span className="flex items-center">-</span>
            <input 
              type="number"
              value={filters.priceRange[1]}
              onChange={e => onChange({
                ...filters,
                priceRange: [filters.priceRange[0], e.target.value]
              })}
              className="flex-1 border-gray-300 rounded"
            />
          </div>
        </div>

        {/* 排序方式 */}
        <div>
          <label className="block text-gray-700 mb-2">排序方式</label>
          <select 
            value={filters.sort}
            onChange={e => onChange({ ...filters, sort: e.target.value })}
            className="w-full border-gray-300 rounded"
          >
            <option value="newest">最新上架</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
            <option value="popularity">热门排序</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
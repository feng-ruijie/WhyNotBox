// components/BlindBoxCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const BLIND_BOX_PLACEHOLDER = 'https://picsum.photos/300/200?text=No+Image';



const BlindBoxCard = ({ box , onDelete , isAdmin}) => {
  
  const [isLoading, setIsLoading] = useState(true); // ✅ 添加状态
   /*const imageUrl = box.image 
    ? `http://localhost:5000${box.image}` 
    : BLIND_BOX_PLACEHOLDER;
*/
//console.log(box.image)
 const navigate = useNavigate();
 const handleDetailClick = () => {
  
  navigate(`/blindbox/${box.id}`);
};
const imageUrl = box.image 
  ? `http://localhost:5000${box.image}` // 添加斜杠
  : BLIND_BOX_PLACEHOLDER;
  const handleDelete = async () => {
    if (isAdmin) { // ✅ 使用传入的 isAdmin
      if (window.confirm('确定要删除这个盲盒吗？')) {
        try {
          const response = await fetch(`http://localhost:5000/api/blindbox/${box.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            onDelete?.(box.id);
          }
        } catch (error) {
          console.error('删除失败:', error);
        }
      }
    }

  };
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
      {/* 删除按钮 */}
      {isAdmin && (
        <button 
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center z-10 hover:bg-red-700"
        >
          ×
        </button>
      )}
      
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={box.name || '盲盒图片'} 
          className="w-full h-48 object-cover"
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            e.target.src = BLIND_BOX_PLACEHOLDER;
            setIsLoading(false);
          }}
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
      <div className="p-4">
        <h3 className="font-semibold text-lg">{box.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-blue-600 font-bold">¥{box.price}</span>
          <span className="text-gray-500 text-sm">{box.remaining}个剩余</span>
        </div>
        <div className="mt-3 flex justify-between">
          <button
            className="bg-blue-400 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            onClick={handleDetailClick}
          >
            详情
          </button>
          <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
            立即购买
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlindBoxCard;
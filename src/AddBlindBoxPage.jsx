// src/pages/AddBlindBoxPage.jsx
import React, { useState, useEffect } from 'react';
import loginBackground from './assets/LoginBackGround.png';
import { useNavigate } from 'react-router-dom'; // 添加这行
import TopNavigation from './components/TopNavigation';

const AddBlindBoxPage = () => {
  //盲盒字段
  const [newBox, setNewBox] = useState({
    name: '',
    price: '',
    remaining: '',
    description: '',
    image: null, // 修改为存储文件对象
    items: [{ name: '', quantity: '', probability: '' }] //todo : image

  });


  const [isAdmin, setIsAdmin] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(''); // 图片预览URL
   const navigate = useNavigate();
  // 检查用户权限
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsAdmin(!!parsedUser.isAdmin);
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  // 处理文件选择
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 更新newBox状态
      setNewBox(prev => ({ ...prev, image: file }));
      
      // 创建图片预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 创建新盲盒
  const handleCreateBox = async () => {
  if (!newBox.image) {
    alert('请先选择图片');
    return;
  }

  // ✅ 新增：校验概率总和是否为100%
  const totalProb = calculateTotalProbability();
  if (Math.abs(totalProb - 100) > 0.01) {
    alert(`物品概率总和必须为100%，当前总和为${totalProb}%`);
    return;
  }

  const formData = new FormData();
  formData.append('name', newBox.name);
  formData.append('price', newBox.price);
  formData.append('remaining', newBox.remaining);
  formData.append('description', newBox.description);
  formData.append('image', newBox.image);
  formData.append('items', JSON.stringify(newBox.items)); 

  try {
    const response = await fetch('http://localhost:5000/api/blindbox', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      setNewBox({
        name: '',
        price: '',
        remaining: '',
        description: '',
        image: null
      });
      navigate('/blindbox', { state: { refresh: true } });
    }
  } catch (error) {
    console.error('创建失败:', error);
  }
};
  // 处理物品字段修改
const handleItemChange = (index, field, value) => {
  const updatedItems = [...newBox.items];
  updatedItems[index] = { ...updatedItems[index], [field]: value };
  setNewBox({ ...newBox, items: updatedItems });
};

// 计算总概率
const calculateTotalProbability = () => {
  return newBox.items.reduce((sum, item) => sum + (parseFloat(item.probability) || 0), 0);
};

// 添加/删除物品
const addItem = () => {
  setNewBox({
    ...newBox,
    items: [...newBox.items, { name: '', quantity: '', probability: '' }]
  });
};

const removeItem = (index) => {
  setNewBox({
    ...newBox,
    items: newBox.items.filter((_, i) => i !== index)
  });
};

  return (
    <div 
      className="h-[100dvh] w-[140dvh] flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <TopNavigation />
      
      {isAdmin && (
        <div className="m-auto p-6 backdrop-blur-sm max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">新增盲盒</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
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
            <textarea 
            value={newBox.description}
            onChange={(e) => setNewBox({...newBox, description: e.target.value})}
            placeholder="描述"
            className="border p-2 rounded"
            />

            {/* 物品列表输入 */}
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-2">盲盒物品</h3>
  {newBox.items.map((item, index) => (
    <div key={index} className="flex gap-2 mb-2">
      <input
        type="text"
        placeholder="物品名称"
        value={item.name}
        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
        className="border p-2 rounded flex-1"
      />
      <input
        type="number"
        placeholder="概率%"
        value={item.probability}
        onChange={(e) => handleItemChange(index, 'probability', parseFloat(e.target.value))}
        className="border p-2 rounded w-24"
      />
      <button
        type="button"
        onClick={() => removeItem(index)}
        className="bg-red-500 text-white p-2 rounded"
      >
        删除
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={addItem}
    className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
  >
    添加物品
  </button>
  <div className="mt-2 text-sm text-gray-600">
    总概率: {calculateTotalProbability()}%
  </div>
</div>


            {/* 文件上传控件 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                选择图片
              </label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-500 file:text-white
                  hover:file:bg-green-600"
              />
            </div>

            {/* 图片预览 */}
            {previewUrl && (
              <div className="mt-4">
                <img 
                  src={previewUrl} 
                  alt="预览" 
                  className="max-h-60 mx-auto rounded"
                />
              </div>
            )}
          </div>
          
          <button 
            onClick={handleCreateBox}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            创建盲盒
          </button>
        </div>
      )}
    </div>
  );
};

export default AddBlindBoxPage;
// src/pages/AddBlindBoxPage.jsx
import React, { useState, useEffect } from 'react';
import loginBackground from './assets/LoginBackGround.png';
import { useNavigate } from 'react-router-dom'; // 添加这行
import TopNavigation from './components/TopNavigation';

const AddBlindBoxPage = () => {
  const [newBox, setNewBox] = useState({
    name: '',
    price: '',
    remaining: '',
    description: '',
    image: null // 修改为存储文件对象
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

    const formData = new FormData();
    formData.append('name', newBox.name);
    formData.append('price', newBox.price);
    formData.append('remaining', newBox.remaining);
    formData.append('description', newBox.description);
    formData.append('image', newBox.image); // 添加图片文件

    try {
      const response = await fetch('http://localhost:5000/api/blindbox', {
        method: 'POST',
        body: formData
        // 注意：使用FormData时不要手动设置Content-Type
        // 浏览器会自动设置为multipart/form-data
      });
      
      if (response.ok) {
        // 重置表单
        setNewBox({ 
          name: '', 
          price: '', 
          remaining: '', 
          description: '', 
          image: null 
        });
        navigate('/blindbox', { state: { refresh: true } });
        // 跳转回列表页或显示成功提示
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
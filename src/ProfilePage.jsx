// src/ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import TopNavigation from './components/TopNavigation';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef(null);

  // 获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      // 从 localStorage 获取用户信息
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setAvatarPreview(parsedUser.avatar ? `http://localhost:5000${parsedUser.avatar}` : '');
      } else {
        throw new Error('用户未登录');
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
      alert('获取用户信息失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 预览图片
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // 上传到服务器
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', user.id); // 添加用户ID

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile/avatar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        // 更新用户信息
        const updatedUser = { ...user, avatar: data.avatar };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('头像上传成功');
      } else {
        throw new Error(data.msg || '上传失败');
      }
    } catch (err) {
      console.error('上传失败:', err);
      alert('上传失败: ' + err.message);
      // 恢复之前的头像预览
      if (user?.avatar) {
        setAvatarPreview(`http://localhost:5000${user.avatar}`);
      } else {
        setAvatarPreview('');
      }
    }
  };

  // 处理头像点击
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // 处理密码修改
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新密码和确认密码不一致');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('密码长度至少6位');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          userId: user.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('密码修改成功');
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(data.msg || '修改失败');
      }
    } catch (err) {
      console.error('修改失败:', err);
      alert('修改失败: ' + err.message);
    }
  };

  // 处理充值
  const handleRecharge = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的充值金额');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          amount,
          userId: user.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // 更新用户余额
        const updatedUser = { ...user, balance: data.balance };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setRechargeAmount('');
        alert(`充值成功，当前余额: ${data.balance.toFixed(2)}`);
      } else {
        throw new Error(data.msg || '充值失败');
      }
    } catch (err) {
      console.error('充值失败:', err);
      alert('充值失败: ' + err.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">用户未登录</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNavigation />
      
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center my-8">个人中心</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col items-center mb-6">
            <div 
              className="relative cursor-pointer"
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="头像" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-blue-500 flex items-center justify-center">
                  <span className="text-gray-500">上传头像</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            
            <h2 className="text-2xl font-semibold mt-4">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">账户余额</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600">¥{user.balance?.toFixed(2) || '0.00'}</span>
              <button 
                onClick={() => document.getElementById('recharge-modal').classList.remove('hidden')}
                className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
              >
                充值
              </button>
            </div>
          </div>
        </div>
        
        {/* 修改密码表单 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">修改密码</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">旧密码</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">新密码</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">确认新密码</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition"
            >
              修改密码
            </button>
          </form>
        </div>
      </div>
      
      {/* 充值模态框 */}
<div id="recharge-modal" className="hidden fixed inset-0 flex items-center justify-center z-50">
  <div className="absolute inset-0 bg-black opacity-50" 
       onClick={() => document.getElementById('recharge-modal').classList.add('hidden')}></div>
  <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">账户充值</h3>
      <button 
        onClick={() => document.getElementById('recharge-modal').classList.add('hidden')}
        className="text-gray-500 hover:text-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <form onSubmit={handleRecharge}>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">充值金额</label>
        <input
          type="number"
          step="0.01"
          value={rechargeAmount}
          onChange={(e) => setRechargeAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入充值金额"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={() => document.getElementById('recharge-modal').classList.add('hidden')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          确认充值
        </button>
      </div>
    </form>
  </div>
</div>
    </div>
  );
};

export default ProfilePage;
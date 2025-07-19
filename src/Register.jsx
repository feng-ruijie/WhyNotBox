import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginBackground from './assets/LoginBackGround.png'; // 导入背景图片
const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [password2, setPassword2] = useState(''); // 二次确认
  const [email, setEmail] = useState(''); //邮箱

  const navigate = useNavigate();

  /*const handleRegister = (e) => {
    e.preventDefault();
    // 模拟注册逻辑
    if (username && password) {
      alert('注册成功');
      navigate('/login'); // 注册完成后跳转到登录页
    } else {
      alert('请输入用户名和密码');
    }
  };*/
  const handleRegister = async (e) => {

  e.preventDefault();
  if (password !== password2) {
  alert('两次输入的密码不一致');
  return;
  }
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username,email, password ,isAdmin:false}), // 可能有问题
    });

    const data = await res.json();
    

    if (res.ok) {
      alert('注册成功');
      navigate('/login');
    } else {
      alert(data.msg || '注册失败');
    }
  } catch (err) {
    alert('无法连接服务器');
  }
};

  return (
    
        <div
          className="h-[100dvh] w-[150dvh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${loginBackground})` }}
        >
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-white">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">注册</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


        {/* 新增：邮箱输入框 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // 绑定邮箱状态
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
    
          <div> 
  <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
    确认密码
  </label>
  <input
    id="password2"
    type="password"
    placeholder="Confirm Password"
    value={password2}
    onChange={(e) => setPassword2(e.target.value)} //  绑定状态
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
     </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            注册完成后跳转到登录页
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
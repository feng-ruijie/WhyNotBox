import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginBackground from './assets/LoginBackGround.png'; // 导入背景图片

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  /*const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      onLogin(username);
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
    }
   
  };*/
  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      //const user = data.user.username; 
      onLogin(data.user);


      //localStorage.setItem('user', JSON.stringify(data.user)); // 存储用户信息
      console.log('登录返回数据:', data);
      localStorage.setItem('user', JSON.stringify(data.user)); //  确保 data.user 存在

      navigate('/dashboard');
    } else {
      alert(data.msg || '登录失败');
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
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-white backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-center text-black mb-6">登录</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-black mb-1">
              用户名
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-black font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
          >
          登录
          </button>
        </form>
        <div className="text-center mt-4">
        <p className="text-sm text-black mb-2">没有账号？</p>
        <button
         type="button"
          onClick={() => navigate('/register')}
          className="text-blue-400 hover:text-blue-300 font-medium"
          >
        立即注册
  </button>
</div>
      </div>
    </div>
  );
};

export default Login;
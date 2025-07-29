// src/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from './components/TopNavigation';
import loginBackground from './assets/LoginBackGround.png';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data);
      } else {
        console.error('获取玩家秀失败:', data.error);
      }
    } catch (error) {
      console.error('获取玩家秀失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  const handleCreatePost = () => {
    navigate('/community/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <TopNavigation />
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <TopNavigation />
      
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800">玩家秀</h1>
          <button
            onClick={handleCreatePost}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            发布新玩家秀
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">暂无玩家秀，快来发布第一个吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-200"
                onClick={() => handlePostClick(post.id)}
              >
                {post.firstImage ? (
                  <img 
                    src={`http://localhost:5000${post.firstImage}`} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                    <span className="text-gray-500">暂无图片</span>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">{post.title}</h2>
                  <div className="flex items-center mt-4">
                    {post.user?.avatar ? (
                      <img 
                        src={`http://localhost:5000${post.user.avatar}`} 
                        alt={post.user.username}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2">
                        <span className="text-white text-xs">{post.user?.username?.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-gray-600 text-sm">{post.user?.username}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
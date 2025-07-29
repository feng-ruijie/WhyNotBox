// src/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNavigation from './components/TopNavigation';
import loginBackground from './assets/LoginBackGround.png';

const PostDetailPage = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setPost(data);
      } else {
        console.error('获取玩家秀详情失败:', data.error);
      }
    } catch (error) {
      console.error('获取玩家秀详情失败:', error);
    } finally {
      setLoading(false);
    }
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100">
        <TopNavigation />
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">玩家秀不存在</p>
            <button
              onClick={() => navigate('/community')}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              返回玩家秀列表
            </button>
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
        <button
          onClick={() => navigate('/community')}
          className="mb-4 flex items-center text-purple-600 hover:text-purple-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回列表
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
            
            <div className="flex items-center mb-6">
              {post.author?.avatar ? (  // 修正访问路径为 author
                <img 
                  src={`http://localhost:5000${post.author.avatar}`} 
                  alt={post.author.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">{post.author?.username?.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{post.author?.username}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
            </div>
            
            {post.images && post.images.length > 0 && (
              <div className="mt-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.images.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img 
                        src={`http://localhost:5000${image}`} 
                        alt={`图片 ${index + 1}`}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
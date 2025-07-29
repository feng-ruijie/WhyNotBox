// src/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNavigation from './components/TopNavigation';
import loginBackground from './assets/LoginBackGround.png';

const PostDetailPage = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 获取当前用户信息
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    fetchPost();
    fetchComments();
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

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/post/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setComments(data);
      } else {
        console.error('获取评论失败:', data.error);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment,
          userId: user.id,
          postId: id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNewComment('');
        fetchComments(); // 重新获取评论
      } else {
        alert(data.error || '发表评论失败');
      }
    } catch (error) {
      console.error('发表评论失败:', error);
      alert('发表评论失败');
    }
  };

  const handleAddReply = async (parentId) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    if (!replyContent.trim()) {
      alert('请输入回复内容');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyContent,
          userId: user.id,
          postId: id,
          parentId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments(); // 重新获取评论
      } else {
        alert(data.error || '发表回复失败');
      }
    } catch (error) {
      console.error('发表回复失败:', error);
      alert('发表回复失败');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        fetchComments(); // 重新获取评论以更新点赞数
      } else {
        alert(data.error || '点赞失败');
      }
    } catch (error) {
      console.error('点赞失败:', error);
      alert('点赞失败');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
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
              {post.author?.avatar ? (
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
            
            <div className="prose max-w-none mb-6 text-left">
              <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
            </div>
            
            {post.images && post.images.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">图片展示</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.images.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img 
                        src={`http://localhost:5000${image}`} 
                        alt={`图片 ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 评论区域 */}
        <div className="bg-white rounded-lg shadow-md mt-6 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">评论</h2>
          
          {/* 发表评论表单 */}
          {user ? (
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleAddComment}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  发表评论
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center py-4 text-gray-500">
              <p>请先登录以发表评论</p>
            </div>
          )}

          {/* 评论列表 - 添加最大高度和滚动条 */}
          <div className="max-h-96 overflow-y-auto pr-2">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-4 mb-4">
                  {/* 主评论 */}
                  <div className="flex">
                    {comment.author?.avatar ? (
                      <img 
                        src={`http://localhost:5000${comment.author.avatar}`} 
                        alt={comment.author.username}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                        <span className="text-white text-xs">{comment.author?.username?.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      {/* 用户名和时间移到阴影框外面 */}
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-800">{comment.author?.username}</span>
                        <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
                      </div>
                      {/* 阴影框只包含内容 */}
                      <div className="bg-gray-100 rounded-lg p-3 mb-2 text-left">
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      
                      <div className="mt-1 flex items-center">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center text-sm text-gray-500 hover:text-red-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {comment.likes}
                        </button>
                        
                        <button
                          onClick={() => {
                            if (replyingTo === comment.id) {
                              setReplyingTo(null);
                            } else {
                              setReplyingTo(comment.id);
                              setReplyContent('');
                            }
                          }}
                          className="ml-4 text-sm text-gray-500 hover:text-purple-600"
                        >
                          回复
                        </button>
                      </div>
                      
                      {/* 回复表单 */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 ml-4">
                          {user ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`回复 ${comment.author?.username}...`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={2}
                              />
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => handleAddReply(comment.id)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition duration-200"
                                >
                                  发布
                                </button>
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded-lg transition duration-200"
                                >
                                  取消
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2 text-gray-500">
                              <p>请先登录以发表回复</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* 回复列表 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex">
                              {reply.author?.avatar ? (
                                <img 
                                  src={`http://localhost:5000${reply.author.avatar}`} 
                                  alt={reply.author.username}
                                  className="w-6 h-6 rounded-full mr-2"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mr-2">
                                  <span className="text-white text-xs">{reply.author?.username?.charAt(0)}</span>
                                </div>
                              )}
                              <div className="flex-1">
                                {/* 回复的用户名和时间也移到阴影框外面 */}
                                <div className="flex justify-between mb-1">
                                  <span className="font-semibold text-gray-800 text-sm">{reply.author?.username}</span>
                                  <span className="text-gray-500 text-xs">{formatDate(reply.createdAt)}</span>
                                </div>
                                {/* 回复的阴影框只包含内容 */}
                                <div className="bg-gray-50 rounded-lg p-2 mb-1 text-left">
                                  <p className="text-gray-700 text-sm">{reply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>暂无评论，快来发表第一个评论吧！</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
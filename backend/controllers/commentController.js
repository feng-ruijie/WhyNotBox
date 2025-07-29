// backend/controllers/commentController.js
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');

// 获取特定玩家秀的所有评论（包括回复）
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // 检查玩家秀是否存在
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: '玩家秀不存在' });
    }
    
    // 获取所有评论和回复
    const comments = await Comment.findAll({
      where: { postId, parentId: null }, // 只获取顶级评论
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ],
      order: [
        ['createdAt', 'ASC'],
        [{ model: Comment, as: 'replies' }, 'createdAt', 'ASC']
      ]
    });
    
    res.json(comments);
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ error: '获取评论失败' });
  }
};

// 创建新评论或回复
const createComment = async (req, res) => {
  try {
    const { content, userId, postId, parentId } = req.body;
    
    // 验证必填字段
    if (!content || !userId || !postId) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 检查玩家秀是否存在
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: '玩家秀不存在' });
    }
    
    // 如果是回复，检查父评论是否存在
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({ error: '父评论不存在' });
      }
    }
    
    // 创建评论
    const newComment = await Comment.create({
      content,
      userId,
      postId,
      parentId: parentId || null
    });
    
    // 获取完整的评论信息（包括作者信息）
    const commentWithAuthor = await Comment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });
    
    res.status(201).json(commentWithAuthor);
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({ error: '创建评论失败' });
  }
};

// 给评论点赞（允许重复点赞）
const likeComment = async (req, res) => {
  try {
    const { id } = req.params; // 修正参数获取方式
    
    // 检查评论是否存在
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }
    
    // 增加点赞数
    comment.likes += 1;
    await comment.save();
    
    res.json({ 
      message: '点赞成功',
      likes: comment.likes
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ error: '点赞失败' });
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  likeComment
};
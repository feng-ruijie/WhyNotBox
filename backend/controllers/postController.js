// backend/controllers/postController.js
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// 确保上传目录存在 - 修正路径
const uploadDir = path.join(__dirname, '../../uploads/posts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 获取所有玩家秀（只包含标题和首图）
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['username', 'avatar']
      }],
      order: [['createdAt', 'DESC']]
    });

    // 只返回必要信息给前端
    const simplifiedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
      user: post.author,
      firstImage: post.images && post.images.length > 0 ? post.images[0] : null
    }));

    res.json(simplifiedPosts);
  } catch (error) {
    console.error('获取玩家秀列表失败:', error);
    res.status(500).json({ error: '获取玩家秀列表失败' });
  }
};

// 获取特定玩家秀详情
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['username', 'avatar']
      }]
    });

    if (!post) {
      return res.status(404).json({ error: '玩家秀不存在' });
    }

    res.json(post);
  } catch (error) {
    console.error('获取玩家秀详情失败:', error);
    res.status(500).json({ error: '获取玩家秀详情失败' });
  }
};

// 创建新玩家秀
const createPost = async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少用户信息' });
    }

    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 处理上传的图片
    const images = [];
    if (req.files && req.files.length > 0) {
      // 最多只保留3张图片
      const filesToProcess = req.files.slice(0, 3);
      filesToProcess.forEach(file => {
        images.push(`/uploads/posts/${file.filename}`);
      });
    }

    // 创建玩家秀
    const newPost = await Post.create({
      title,
      content,
      images: images.length > 0 ? images : null,
      userId
    });

    // 返回创建的玩家秀（包含用户信息）
    const postWithUser = await Post.findByPk(newPost.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['username', 'avatar']
      }]
    });

    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('创建玩家秀失败:', error);
    res.status(500).json({ error: '创建玩家秀失败' });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost
};
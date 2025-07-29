// backend/controllers/commentController.js
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');

// 获取特定玩家秀的所有评论（包括多级回复）
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // 先获取所有评论
    const comments = await Comment.findAll({
      where: { postId: postId },
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
      order: [['createdAt', 'ASC']]
    });

    // 构建评论树结构
    const commentMap = {};
    const rootComments = [];

    // 初始化所有评论到映射中
    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment.toJSON(),
        replies: []
      };
    });

    // 构建树结构
    comments.forEach(comment => {
      if (comment.parentId === null) {
        rootComments.push(commentMap[comment.id]);
      } else if (commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment.id]);
      }
    });

    res.json(rootComments);
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ error: '获取评论失败' });
  }
};

// 创建新评论
const createComment = async (req, res) => {
  try {
    const { content, userId, postId, parentId } = req.body;

    // 验证用户和玩家秀是否存在
    const user = await User.findByPk(userId);
    const post = await Post.findByPk(postId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (!post) {
      return res.status(404).json({ error: '玩家秀不存在' });
    }

    // 如果提供了parentId，验证父评论是否存在
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({ error: '父评论不存在' });
      }
    }

    const newComment = await Comment.create({
      content,
      userId,
      postId,
      parentId: parentId || null
    });

    // 获取新创建的评论及其关联信息
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

// 给评论点赞
const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    comment.likes += 1;
    await comment.save();

    res.json({ likes: comment.likes });
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
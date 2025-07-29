// backend/routes/comment.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// 获取特定玩家秀的所有评论（包括回复）
router.get('/post/:postId', commentController.getCommentsByPost);

// 创建新评论
router.post('/', commentController.createComment);

// 给评论点赞
router.post('/:id/like', commentController.likeComment);

module.exports = router;
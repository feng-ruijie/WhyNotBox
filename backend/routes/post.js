// backend/routes/post.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController'); // 添加评论控制器
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件上传 - 修正路径
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/posts/');
    
    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, 'post-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制5MB
    files: 3 // 最多3个文件
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取所有玩家秀
router.get('/', postController.getAllPosts);

// 获取特定玩家秀
router.get('/:id', postController.getPostById);

// 创建新玩家秀（支持多图上传）
router.post('/', upload.array('images', 3), postController.createPost);

// 添加评论相关路由
router.get('/:id/comments', commentController.getCommentsByPost);
router.post('/comments', commentController.createComment);
router.post('/comments/:id/like', commentController.likeComment);

module.exports = router;
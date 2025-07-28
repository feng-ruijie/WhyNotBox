// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, uploadAvatar, changePassword, recharge } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置头像上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // 使用绝对路径指向项目根目录下的uploads/avatars
  },
  filename: function (req, file, cb) {
    cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
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

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 获取用户信息
router.get('/profile', getProfile);

// 上传头像
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);

// 修改密码
router.put('/profile/password', changePassword);

// 充值
router.post('/profile/recharge', recharge);

module.exports = router;
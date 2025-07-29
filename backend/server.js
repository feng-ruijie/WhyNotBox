// backend/server.js
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');

const cors = require('cors');
const dotenv = require('dotenv');
const blindBoxRoutes = require('./routes/blindBox');
const commentRoutes = require('./routes/comment'); // 添加评论路由
const path = require('path');


dotenv.config();

const express = require('express');
const app = express();

app.use(express.json());
// 中间件
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');

// 修正路径 - 确保目录存在
const uploadDirs = [
  path.resolve(__dirname, '../uploads'),
  path.resolve(__dirname, '../uploads/avatars'),
  path.resolve(__dirname, '../uploads/posts')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(cors()); // 允许前端域名
app.use('/api/auth', authRoutes);

const Item = require('./models/Item.js');
const BlindBox = require('./models/BlindBox.js');
const Order = require('./models/order.js');
const User = require('./models/User.js');
const Post = require('./models/Post.js');
const Comment = require('./models/Comment.js'); // 添加评论模型

// 盲盒和物品关联
BlindBox.hasMany(Item, {
  as: 'items',
  foreignKey: 'blindBoxId'
});

Item.belongsTo(BlindBox, {
  as: 'blindBox',
  foreignKey: 'blindBoxId'
});

// 订单和盲盒关联
Order.belongsTo(BlindBox, {
  as: 'blindBox',
  foreignKey: 'blind_box_id'
});

BlindBox.hasMany(Order, {
  as: 'orders',
  foreignKey: 'blind_box_id'
});

// 用户和订单关联
User.hasMany(Order, {
  as: 'orders',
  foreignKey: 'user_id'
});

Order.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id'
});

// 用户和玩家秀关联
User.hasMany(Post, {
  as: 'posts',
  foreignKey: 'userId'
});

Post.belongsTo(User, {
  as: 'author',
  foreignKey: 'userId'
});

// 玩家秀和评论关联
Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'postComments' // 修改别名避免冲突
});

Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post'
});

// 用户和评论关联
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'userComments' // 修改别名避免冲突
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// 评论和回复关联
Comment.hasMany(Comment, {
  foreignKey: 'parentId',
  as: 'replies'
});

Comment.belongsTo(Comment, {
  foreignKey: 'parentId',
  as: 'parent'
});

// 同步数据库
sequelize.sync({ alter : false }).then(() => {
  console.log('数据库已同步');
}).catch(err => {
  console.error('数据库同步失败:', err);
});

const postRoutes = require('./routes/post');
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes); // 注册评论路由
app.use('/api', blindBoxRoutes);
// 添加静态文件服务 - 修正路径
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
// 启动服务器
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
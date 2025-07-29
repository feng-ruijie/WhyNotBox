// backend/models/Post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON, // 存储图片路径数组
    allowNull: true
  }
}, {
  tableName: 'Posts',
  modelName: 'Post',
  timestamps: true
});

// 注意：关联关系应该只在模型中定义一次，或在 server.js 中统一定义
// 这里我们移除模型中的关联定义，统一在 server.js 中处理

module.exports = Post;

const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');

const cors = require('cors');
const dotenv = require('dotenv');
const blindBoxRoutes = require('./routes/blindBox');
const path = require('path');


dotenv.config();

const express = require('express');
const app = express();

app.use(express.json());
// 中间件
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');

const uploadDirs = [
  path.resolve(__dirname, '../uploads'),
  path.resolve(__dirname, '../uploads/avatars')
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
BlindBox.hasMany(Item, {
  as: 'items',
  foreignKey: 'blindBoxId'
});

Item.belongsTo(BlindBox, {
  as: 'blindBox',
  foreignKey: 'blindBoxId'
});
Order.belongsTo(BlindBox, {
  as: 'blindBox',
  foreignKey: 'blind_box_id'
});

BlindBox.hasMany(Order, {
  as: 'orders',
  foreignKey: 'blind_box_id'
});
User.hasMany(Order, {
  as: 'orders',
  foreignKey: 'user_id'
});

Order.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id'
});
// 同步数据库
sequelize.sync({ alter : true }).then(() => {
  console.log('数据库已同步');
});


app.use('/api', blindBoxRoutes); // 添加这行
// 添加静态文件服务
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
//app.use('/uploads', path.join(__dirname, 'uploads'));
// 启动服务器
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

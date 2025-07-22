const express = require('express');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const dotenv = require('dotenv');
const blindBoxRoutes = require('./routes/blindBox');

dotenv.config();

const app = express();

// 中间件
app.use(express.json());
app.use(cors());
app.use(cors({ origin: 'http://localhost:5173' })); // 允许前端域名
app.use('/api/auth', authRoutes);

// 同步数据库
sequelize.sync({ force: false }).then(() => {
  console.log('数据库已同步');
});
app.use('/api', blindBoxRoutes); // 添加这行
// 启动服务器
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // SQLite 文件路径
});

module.exports = sequelize;
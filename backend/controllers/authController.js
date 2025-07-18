const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 注册
exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ msg: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    res.status(201).json({ msg: '注册成功', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 登录
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ msg: '用户不存在' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: '密码错误' });
    }

    res.json({ msg: '登录成功', username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
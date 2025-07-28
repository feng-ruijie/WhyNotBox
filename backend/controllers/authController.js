const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
// 注册
const register = async (req, res) => {
  const { username, email,password ,isAdmin,balance } = req.body; //important

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ msg: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username,email , password: hashedPassword ,isAdmin,balance });

    res.status(201).json({ msg: '注册成功', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 登录
const login = async (req, res) => {
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

    //res.json({ msg: '登录成功', username });

     const isAdmin = username === 'admin' ? true : user.isAdmin;
    const balance = user.balance;
   //修改登录接口
    res.json({ 
  msg: '登录成功', 
  user: user.toJSON()
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ msg: '缺少用户信息' });
    }
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('获取用户信息错误:', err);
    res.status(500).json({ error: err.message });
  }
};

// 上传头像
// 上传头像
const uploadAvatar = async (req, res) => {
  try {
    // 检查是否有文件上传
    if (!req.file) {
      return res.status(400).json({ msg: '请选择文件' });
    }

    // 从请求体获取用户ID
    const { userId } = req.body;
    if (!userId) {
      // 删除已上传的文件，因为缺少用户信息
      const filePath = path.join(__dirname, '../../uploads/avatars/', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ msg: '缺少用户信息' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      // 删除已上传的文件，因为用户不存在
      const filePath = path.join(__dirname, '../../uploads/avatars/', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({ msg: '用户不存在' });
    }

    // 删除旧头像文件（如果有）
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars/', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // 更新数据库中的头像路径
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      msg: '头像更新成功',
      avatar: user.avatar
    });
  } catch (err) {
    console.error('上传头像错误:', err);
    
    // 如果有上传的文件，尝试删除它
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/avatars/', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // 确保返回 JSON 格式的错误响应
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || '服务器内部错误' });
    }
  }
};// 修改密码
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ msg: '缺少用户信息' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: '旧密码不正确' });
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: '新密码长度至少6位' });
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ msg: '密码修改成功' });
  } catch (err) {
    console.error('修改密码错误:', err);
    res.status(500).json({ error: err.message });
  }
};

// 充值
const recharge = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ msg: '缺少用户信息' });
    }
    
    // 验证金额
    const rechargeAmount = parseFloat(amount);
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return res.status(400).json({ msg: '充值金额必须大于0' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }

    // 更新余额
    user.balance += rechargeAmount;
    await user.save();

    res.json({
      msg: '充值成功',
      balance: user.balance
    });
  } catch (err) {
    console.error('充值错误:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  uploadAvatar,
  changePassword,
  recharge
};
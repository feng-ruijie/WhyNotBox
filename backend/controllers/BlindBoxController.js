// backend/controllers/BlindBoxController.js
const BlindBox = require('../models/BlindBox');
const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

// 确保uploads目录存在
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}



exports.getAll = async (req, res) => {
  try {
    const boxes = await BlindBox.findAll(); // 使用模型的 findAll 方法
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ error: '获取盲盒列表失败' });
  }
};

// 新增盲盒
exports.createBlindBox = async (req, res) => {
  try {
    // ✅ 新增：正确解析 multipart/form-data 中的字段
    const { name, price, remaining, description, isRecommended, isNew } = req.body;
    
    // ✅ 新增：解析物品数据（来自字符串）
    const itemsData = req.body.items ? JSON.parse(req.body.items) : [];
    
    // ✅ 新增：验证概率总和
    const totalProbability = itemsData.reduce((sum, item) => sum + item.probability, 0);
    if (Math.abs(totalProbability - 100) > 0.01) {  // 允许浮点误差
      return res.status(400).json({ error: '物品概率总和必须为100%' });
    }
    
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const newBox = await BlindBox.create({
      name,
      price,
      remaining,
      description,
      isRecommended: isRecommended === 'true' || isRecommended === true,
      isNew: isNew === 'true' || isNew === true,
      image: imagePath,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    if (itemsData.length > 0) {
      const items = itemsData.map(item => ({
        ...item,
        blindBoxId: newBox.id // 设置外键
      }));
      await Item.bulkCreate(items); // 批量创建物品
    }
    
    res.status(201).json(newBox);
  } catch (error) {
    console.error('创建失败:', error);
    res.status(500).json({ error: '创建盲盒失败' });
  }
};

// 删除盲盒
exports.deleteBlindBox = async (req, res) => {
  try {
    const { id } = req.params;
    
    const box = await BlindBox.findByPk(id);
    if (!box) {
      return res.status(404).json({ error: '未找到该盲盒' });
    }
    
    await box.destroy();
    res.json({ message: '盲盒已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除盲盒失败' });
  }
};
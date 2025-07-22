// backend/controllers/BlindBoxController.js
const BlindBox = require('../models/BlindBox');



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
    const { name, price, remaining, description, isRecommended, isNew, image } = req.body;
    
    const newBox = await BlindBox.create({
      name,
      price,
      remaining,
      description,
      isRecommended,
      isNew,
      image
    });
    
    res.status(201).json(newBox);
  } catch (error) {
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
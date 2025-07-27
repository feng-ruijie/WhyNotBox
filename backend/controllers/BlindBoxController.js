// backend/controllers/BlindBoxController.js
const BlindBox = require('../models/BlindBox');
const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sequelize = require('../config/db');
const User = require('../models/User');
const Order = require('../models/order');
const uploadDir = path.resolve(__dirname, '../../uploads');


//const { upload } = require('../controllers/BlindBoxController');
// 配置文件上传存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //const uploadDir = path.resolve(__dirname, '../../uploads') ;
    //const uploadDir = path.join(__dirname, '../../uploads');  //关键位置

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 使用时间戳+原始扩展名防止重名
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 仅允许图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型：${file.fieldname}`), false);
  }
};

// 初始化multer配置
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB限制
    files: 21 // 最大文件数（1个盲盒图+20个物品图）
  }
}).fields([
  { name: 'image', maxCount: 1 },       // 盲盒主图
  { name: 'itemImages', maxCount: 20 }  // 物品图片（最多20个）
]);

// 获取所有盲盒
const getAll = async (req, res) => {
  try {
    const boxes = await BlindBox.findAll();
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ error: '获取盲盒列表失败' });
  }
};

// 新增盲盒
const createBlindBox = async (req, res) => {
  try {
    // 解析表单数据
    const { 
      name, 
      price, 
      remaining, 
      description, 
      isRecommended, 
      isNew 
    } = req.body;

    // 解析物品数据
    let itemsData = [];
    try {
      itemsData = req.body.items ? JSON.parse(req.body.items) : [];
    } catch (error) {
      return res.status(400).json({ error: '物品数据格式错误' });
    }

    // 验证概率总和
    const totalProbability = itemsData.reduce(
      (sum, item) => sum + parseFloat(item.probability || 0), 0
    );
    if (Math.abs(totalProbability - 100) > 0.01) {
      return res.status(400).json({ 
        error: `物品概率总和必须为100%（当前：${totalProbability.toFixed(2)}%）` 
      });
    }

    // 处理文件上传
    const itemImages = req.files?.itemImages || [];
    
    // 验证物品与图片数量匹配
    if (itemsData.length !== itemImages.length) {
      return res.status(400).json({ 
        error: `物品数量(${itemsData.length})与图片数量(${itemImages.length})不匹配` 
      });
    }

    // 构建物品数据
    const itemsWithImages = itemsData.map((item, index) => ({
      ...item,
      image: itemImages[index] 
        ? `/uploads/${path.basename(itemImages[index].path)}`
        : null,
      blindBoxId: null // 占位符
    }));
    
    // 处理盲盒主图
    const imagePath = req.files?.image?.[0] 
      ? `/uploads/${path.basename(req.files.image[0].path)}`
      : null;

    /*const imagePath = req.files?.image?.[0] 
  ? `uploads/${path.basename(req.files.image[0].path)}` // 去掉前导斜杠
  : null;*/
    // 创建盲盒
    const newBox = await BlindBox.create({
      name,
      price: parseFloat(price),
      remaining: parseInt(remaining),
      description,
      isRecommended: isBoolean(isRecommended),
      isNew: isBoolean(isNew),
      image: imagePath
    });

    // 创建关联物品
    if (itemsWithImages.length > 0) {
      const items = itemsWithImages.map(item => ({
        ...item,
        blindBoxId: newBox.id,
        image:item.image,
        probability: parseFloat(item.probability),
      }));
      
      if (items.some(item => !item.name || isNaN(item.probability))) {
      return res.status(400).json({ error: '物品数据必须包含有效名称和概率' });
   }

  


      await Item.bulkCreate(items);
    }
console.log('文件存储路径:', uploadDir); // ✅ 调试输出
console.log('上传的文件:', req.files); // ✅ 调试输出
    res.status(201).json({
      ...newBox.toJSON(),
      items: itemsWithImages
    });
  } catch (error) {
    console.error('创建失败:', error);
    res.status(500).json({ 
      error: '创建盲盒失败',
      details: error.message
    });
  }
};
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const box = await BlindBox.findByPk(id, {
      include: [{ model: Item, as: 'items' }]
    });

    if (!box) {
      return res.status(404).json({ error: '未找到该盲盒' });
    }

    res.json(box);
  } catch (error) {
    res.status(500).json({ error: '获取盲盒详情失败' });
  }
};

//支付接口

const buyBlindBox = async (req, res) => {
  const { id: boxId } = req.params;
  const { username } = req.body;
  console.log(boxId);
  try {
    const user = await User.findOne({ where: { username } });
    const box = await BlindBox.findByPk(boxId);
    if (!box) {
      return res.status(404).json({ error: '盲盒未找到' });
    }
    if (!user ) {
      return res.status(404).json({ error: '用户未找到' }); // ✅ 详细提示
    }
    

    if (user.balance < box.price) {
      return res.status(400).json({ error: '余额不足' });
    }
    if(box.remaining <= 0){
      return res.status(400).json({ error: '盲盒已售罄' });
    }


    /*const newBalance = user.balance - box.price;

    // 事务处理
    await User.update({ balance: newBalance }, { where: { username: username } });
    await BlindBox.update({ remaining: box.remaining - 1 }, { where: { id: boxId } });

    res.json({
      message: '购买成功',
      newBalance
    });*/
      const transaction = await sequelize.transaction();
    try {
      // 更新用户余额和库存
      const newBalance = user.balance - box.price;
      await User.update(
        { balance: newBalance },
        { where: { username }, transaction }
      );
      await BlindBox.update(
        { remaining: box.remaining - 1 },
        { where: { id: boxId }, transaction }
      );
      
      // ✅ 创建订单
      const order = await Order.create({
        user_id: user.id,
        username,
        blind_box_id: box.id,
        price: box.price,
        is_opened: false,
        is_refunded: false
      }, { transaction });
      
      await transaction.commit();
      
      res.json({
        message: '购买成功',
        newBalance,
        orderId: order.id // ✅ 返回订单ID
      });
    } catch (error) {
      //res.status(500).json({ message: '购买失败' });
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('购买失败:', error);
    res.status(500).json({ error: '购买失败' });
  }
};// 删除盲盒
const deleteBlindBox = async (req, res) => {
  try {
    const { id } = req.params;
    
    const box = await BlindBox.findByPk(id);
    if (!box) {
      return res.status(404).json({ error: '未找到该盲盒' });
    }
    
    // 删除关联的物品图片文件
    const items = await Item.findAll({ where: { blindBoxId: id } });
    for (const item of items) {
      if (item.imageUrl) {
        const filePath = path.resolve(__dirname, '../../', item.imageUrl);
       // const filePath = path.join(__dirname, '../../uploads', path.basename(item.imageUrl));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // 删除盲盒主图
    if (box.image) {
      const filePath = path.resolve(__dirname, '../../', box.image);
     // const filePath = path.join(__dirname, '../../uploads', path.basename(item.imageUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 删除数据库记录
    await box.destroy();
    res.json({ message: '盲盒已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除盲盒失败' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { username } = req.params;
    
    const orders = await Order.findAll({
      where: { username },
      include: [{
        model: BlindBox,
        as: 'blindBox',
        attributes: ['name', 'image']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('获取订单失败:', error);
    res.status(500).json({ error: '获取订单失败' });
  }
};


const openBlindBox = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { username } = req.body;
    
    // 查找订单
    const order = await Order.findByPk(orderId, {
      include: [{
        model: BlindBox,
        as: 'blindBox',
        include: [{ model: Item, as: 'items' }] // 包含盲盒内的物品
      }]
    });
    
    if (!order) {
      return res.status(404).json({ error: '订单未找到' });
    }
    
    if (order.username !== username) {
      return res.status(403).json({ error: '无权限操作此订单' });
    }
    
    if (order.is_opened) {
      return res.status(400).json({ error: '盲盒已抽取' });
    }
    
    if (order.is_refunded) {
      return res.status(400).json({ error: '订单已退款，无法抽取' });
    }
    
    // 获取盲盒内的所有物品
    const items = order.blindBox.items;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: '盲盒内没有物品' });
    }
    
    // 根据概率随机选择一个物品
    const totalProbability = items.reduce((sum, item) => sum + parseFloat(item.probability || 0), 0);
    let randomValue = Math.random() * totalProbability;
    
    let selectedItem = null;
    for (const item of items) {
      randomValue -= parseFloat(item.probability);
      if (randomValue <= 0) {
        selectedItem = item;
        break;
      }
    }
    
    // 如果因为浮点数精度问题没有选中物品，则选择最后一个
    if (!selectedItem) {
      selectedItem = items[items.length - 1];
    }
    
    // 更新订单状态
    await order.update({
      is_opened: true,
      opened_item_id: selectedItem.id
    });
    
    res.json({
      message: '抽取成功',
      item: selectedItem
    });
    
  } catch (error) {
    console.error('抽取失败:', error);
    res.status(500).json({ error: '抽取失败' });
  }
};

// 退款功能
const refundOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { username } = req.body;
    
    // 查找订单
    const order = await Order.findByPk(orderId, {
      include: [{
        model: BlindBox,
        as: 'blindBox'
      }]
    });
    
    if (!order) {
      return res.status(404).json({ error: '订单未找到' });
    }
    
    if (order.username !== username) {
      return res.status(403).json({ error: '无权限操作此订单' });
    }
    
    if (order.is_refunded) {
      return res.status(400).json({ error: '订单已退款' });
    }
    
    if (order.is_opened) {
      return res.status(400).json({ error: '盲盒已抽取，无法退款' });
    }
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: '用户未找到' });
    }
    
    // 开启事务
    const transaction = await sequelize.transaction();
    
    try {
      // 退还金额给用户
      const newBalance = user.balance + order.price;
      await User.update(
        { balance: newBalance },
        { where: { username }, transaction }
      );
      await BlindBox.update(
        { remaining: order.blindBox.remaining + 1 },
        { where: { id: order.blind_box_id }, transaction }
      );
      // 更新订单状态
      await order.update(
        { is_refunded: true },
        { transaction }
      );
      
      await transaction.commit();
      
      res.json({
        message: '退款成功',
        newBalance
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('退款失败:', error);
    res.status(500).json({ error: '退款失败' });
  }
};

// 辅助函数：安全转换布尔值
function isBoolean(value) {
  return value === 'true' || value === true;
}
module.exports = {
  upload,
  createBlindBox,
  getAll,
  deleteBlindBox,
  getById,
  buyBlindBox,
  getUserOrders,
  openBlindBox, 
  refundOrder    
};
const express = require('express');
const router = express.Router();
const blindBoxController = require('../controllers/BlindBoxController.js');

const { upload } = blindBoxController;
const multer = require('multer'); //  确保正确引入
const path = require('path'); // 新增路径模块



// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 存储到uploads目录
  },
  filename: function (req, file, cb) {
    // 使用时间戳+扩展名保存文件
    cb(null, Date.now() + path.extname(file.originalname));
  }
});



//查询盲盒
router.get('/blindbox', blindBoxController.getAll); // 无前缀

// 创建新盲盒
//router.post('/blindbox', blindBoxController.createBlindBox);

//const BlindBoxController = require('../controllers/BlindBoxController');
router.post('/blindbox', upload, blindBoxController.createBlindBox);


// 删除盲盒
router.delete('/blindbox/:id', blindBoxController.deleteBlindBox);

module.exports = router;
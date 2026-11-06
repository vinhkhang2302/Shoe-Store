const express = require('express');
const router = express.Router();
const controller = require('../controllers/ControllerProduct');

var multer = require('multer');
const path = require('path');

const ControllerJWT = require('../jwt/ControllerJWT');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

router.post('/api/addproduct', ControllerJWT.verifyTokenAdmin, upload.array('fileImg'), controller.AddProducts);
router.get('/api/products', controller.GetProducts);
router.get('/api/product', controller.GetOneProducts);
router.get('/api/search', controller.SearchProduct);
router.post('/api/editpro', ControllerJWT.verifyTokenAdmin, controller.EditPro);
router.delete('/api/deleteproduct', ControllerJWT.verifyTokenAdmin, controller.deletePro);
router.post('/api/editorder', ControllerJWT.verifyTokenAdmin, controller.EditOrder);
router.get('/api/similarproduct', controller.SimilarProduct);

module.exports = router;

// src/modules/products/product.routes.js

const express = require('express');
const router = express.Router();

const productController = require('./product.controller');
const {verifyToken,authorizeRole} = require('../../middleware/auth.middleware.js');
    

router.get( '/',verifyToken,productController.getProducts);
router.post('/',verifyToken,authorizeRole('Admin'), productController.createProduct);


module.exports = router;
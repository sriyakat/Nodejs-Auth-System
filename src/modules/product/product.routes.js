const express = require('express');
const router = express.Router();

const productController = require('./product.controller');
const {verifyToken,authorizeRole} = require('../../middleware/auth.middleware.js');
    

router.get( '/',verifyToken,productController.getProducts);
router.post('/',verifyToken,authorizeRole('Admin'), productController.createProduct);
router.get("/:id", verifyToken, productController.getProductById);
router.put("/:id", verifyToken, authorizeRole("Admin"), productController.updateProduct);
router.delete("/:id", verifyToken, authorizeRole("Admin"), productController.deleteProduct);


module.exports = router; 
const productService = require('./product.service');


// CREATE PRODUCT ==========================
const createProduct = async (req, res) => {
    try {
        const product = req.body;
        const result = await productService.createProduct(product);
        return res.status(201).json({
            success: true,
            message: 'Product successfully add ho gaya',
            data: result
        });
    } catch (error) {
        console.error('Create Product Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Product add karne me error aayi'
        });
    }
};


// GET ALL PRODUCTS =========================
const getProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        return res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get Products Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Products laane me error aayi'
        });
    }
};


//GET PRODUCT BY ID ==========================
const getProductById = async(req , res , next)=>{
    try{
        const productId = req.params.id;
        const result = await productService.getProductById(productId);

        return res.status(200).json({
            success:true,
            message:`product id no.${productId} fetch successfully`,
            data:result
        })        
    }catch(err){
        next(err)
    }
}


//UPDATE PRODUCT BY ID =========================
const updateProduct = async(req, res, next)=>{
    try{
        const body = req.body;
        const productId = req.params.id;

        const result = await productService.updateProduct(body, productId);
        return res.status(200).json({
            success:true,
            message:`Custmer Id${productId} updated successfully`,
            data:result
        });
    }catch(err){
        next(err)
    }
}


//DELETE PRODUCT BY ID =========================
const deleteProduct = async(req, res, next)=>{
   try{
     const productId = req.params.id;
     const result = await productService.deleteProduct(productId);
     return res.status(200).json({
        success:true,
        message:`Product Id${productId} deleted successfully`,
        data:result
    });
   }catch(err){
    next(err)
   }
}

module.exports = {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};
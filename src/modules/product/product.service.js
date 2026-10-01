const { executeAuthSP } = require('../auth/auth.repository');
const productRepo = require('./product.repository');

// CREATE PRODUCT ====================
const createProduct = async (product) => {
    const { name, price, description } = product;
    const result = await productRepo.executeProductSP(
        'ADD',
        null,
        name,
        price,
        description
    );
    return result[0];
};


// GET ALL PRODUCTS ========================
const getAllProducts = async () => {
    const result = await productRepo.executeProductSP('GET_ALL');
    return result;
};


//GET PRODUCT BY ID ==========================
const getProductById = async(productId)=>{
    const result = await productRepo.executeProductSP( "GET_BY_ID", productId );
    return result; 
}

//UPDATE PRODUCT Y ID ================
const updateProduct = async(body, productId)=>{
     const { name, price, description } = body
    const result = await productRepo.executeProductSP(
        "UPDATE",
        parseInt(productId, 10),  // Id
        name ?? null,
        price ?? null,
        description ?? null
    );
    return result;
}


//DELETE PRODUCT BY ID ====================
const deleteProduct = async(productId)=>{
    const result = await productRepo.executeProductSP(
        "DELETE",
        parseInt(productId)
    )
}


module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};
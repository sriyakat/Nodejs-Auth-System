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
    const result = await productRepo.executeProductSP()
}


module.exports = {
    getAllProducts,
    createProduct
};